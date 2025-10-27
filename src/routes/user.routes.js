import { Router } from "express";
import { changeCurrentPassword, registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js"

const router = Router();


router.route("/register").post(upload.none(),registerUser);
router.route("/login").post(upload.none(),loginUser);


//secured user routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").get(verifyJWT,refreshAccessToken)
router.route("/changePassword").get(verifyJWT,changeCurrentPassword)



export default router;