// /utils/jwt.utils.js
import jwt from "jsonwebtoken";

// This function now takes the user object as an argument
export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            // Note: We use _id in the token to match your original code
            // The user object we pass in will have user_id, so we map it.
            _id: user.user_id, 
            email: user.email,
            username: user.username,
            fullName: user.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// This function also takes the user object
export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            _id: user.user_id, // Map user_id to _id for the token
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};