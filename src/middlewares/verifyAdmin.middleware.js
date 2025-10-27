import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const verifyAdmin = asyncHandler((req, res, next) => {
    if (req.user.role === "admin") {
        return next();
    }
    throw new ApiError(403, "Access denied, admin only");
});

export { verifyAdmin };
