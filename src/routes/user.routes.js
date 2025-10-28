import { Router } from "express";
import { changeCurrentPassword, registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);


//secured user routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").get(verifyJWT,refreshAccessToken)
router.route("/changePassword").post(verifyJWT,changeCurrentPassword)



export default router;