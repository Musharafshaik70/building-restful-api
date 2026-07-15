import { Router } from "express";
import * as controller from "./auth.controller.js";
import validate from "../../common/middleware/validate.middleware.js";
import { authenticate } from "./auth.middleware.js";
import RegisterDto from "./dto/register.dto";
import LoginDto from "./dto/login.dto.js";
import ForgotPasswordDto from "./dto/forgotPassword.dto.js";
import ResetPasswordDto from "./dto/resetPassword.dto.js";

const router = Router();

router.post("/register", validate(RegisterDto), controller.register);
router.post("/verify-email/:token", controller.verifyEmail);
router.post("/login", validate(LoginDto), controller.login);
router.post("/refesh-token", controller.refreshToken);
router.post("/logout", authenticate, controller.logout);
router.post("/forgot-password", validate(ForgotPasswordDto), controller.forgotPassword);
router.post("/reset-password/:token", validate(ResetPasswordDto), controller.resetPassword);
router.get("/getMe", authenticate, controller.getMe);

export default router;
