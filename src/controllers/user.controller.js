// /controllers/user.controller.sql.js
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils.js"; // Import new helpers
import db from "../db/db.js"; // Import the SQL connection
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const options = {
    httpOnly: true,
    secure: true,
};

// This helper function is now SQL-based
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // 1. Fetch the user from the SQL database
        const [user] = await db.query("SELECT * FROM Users WHERE user_id = ? LIMIT 1", [userId]);
        
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // 2. Generate tokens using the helper functions
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // 3. Save the refresh token to the SQL database
        await db.query("UPDATE Users SET refreshToken = ? WHERE user_id = ?", [refreshToken, userId]);

        return { accessToken, refreshToken };

    } catch (error) {
        // Log the internal error
        console.error("Token generation error:", error); 
        // Throw a generic error to the user
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // 1. Check if user already exists
    const [existedUser] = await db.query(
        "SELECT username, email FROM Users WHERE username = ? OR email = ? LIMIT 1",
        [username, email]
    );

    if (existedUser) {
        if (existedUser.username === username) {
            throw new ApiError(409, "Username already exists");
        }
        if (existedUser.email === email) {
            throw new ApiError(409, "Email already exists");
        }
    }

    // 2. Hash the password (was in Mongoose .pre('save') hook)
    const hashedPassword = await bcrypt.hash(password, 10);

    
    // 3. Create the user
    const result = await db.query(
        "INSERT INTO Users (fullName, email, password, username) VALUES (?, ?, ?, ?)",
        [fullName, email, hashedPassword, username.toLowerCase()]
    );

    
    const createdUserId = result.insertId;
    if (!createdUserId) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // 4. Fetch the created user (without password)
    const [createdUser] = await db.query(
        "SELECT user_id, fullName, email, username, role, created_at, updated_at FROM Users WHERE user_id = ?",
        [createdUserId]
    );

    // 5. Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(createdUserId);

    const data = {
        user: createdUser,
        accessToken,
        refreshToken
    };

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "User registered successfully"
        )
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { password } = req.body;

    // FIX: Default to `null` if the value is not present (falsy)
    const username = req.body.username || null;
    const email = req.body.email || null;

    if (!username && !email) {
        throw new ApiError(400, 'Username or email required');
    }

    if (!password) {
        throw new ApiError(400, 'Password is required');
    }

    // 1. Find the user
    const [user] = await db.query(
        "SELECT * FROM Users WHERE username = ? OR email = ? LIMIT 1",
        [username, email]
    );

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // 2. Check the password (was in Mongoose .isPasswordCorrect())
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials');
    }

    // 3. Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.user_id);

    // 4. Create a "safe" user object to return
    const loggedInUser = {
        user_id: user.user_id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role
    };

    return res
        .status(200)
        .cookie('refreshToken', refreshToken, options)
        .cookie('accessToken', accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                'User logged in successfully'
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    
    // 1. Safely get the user ID from the req.user object
    //    Use 'user_id' to match your SQL database
    const userId = req.user?.user_id; 

    if (!userId) {
        // This might happen if verifyJWT failed but was part of an optional chain
        throw new ApiError(400, "Invalid user for logout");
    }

    // 2. Run the query with the valid userId
    await db.query(
        "UPDATE Users SET refreshToken = NULL WHERE user_id = ?",
        [userId] 
    );

    return res
        .status(200)
        .clearCookie('refreshToken', options)
        .clearCookie('accessToken', options)
        .json(
            new ApiResponse(
                200,
                {},
                'User logged out successfully'
            )
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    // 1. Verify the token
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // 2. Find the user in the DB
    const [user] = await db.query(
        "SELECT * FROM Users WHERE user_id = ? LIMIT 1",
        [decodedToken?._id]
    );

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    // 3. Check if token matches the one in the DB
    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    // 4. Generate new tokens
    // (Bug Fix: Renamed destructured variables)
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
        await generateAccessAndRefreshTokens(user.user_id);

    return res
        .status(200)
        .cookie('refreshToken', newRefreshToken, options)
        .cookie('accessToken', newAccessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                },
                'Token refreshed successfully'
            )
        );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    // 1. Get the user from DB
    const [user] = await db.query(
        "SELECT * FROM Users WHERE user_id = ? LIMIT 1",
        [req.user?._id]
    );

    // 2. Check old password
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    // 3. Hash new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password in DB
    await db.query(
        "UPDATE Users SET password = ? WHERE user_id = ?",
        [newHashedPassword, req.user?._id]
    );

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword
};