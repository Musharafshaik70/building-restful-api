import { Router } from "express";
import * as controller from "./auth.controller.js";
import validate from "../../common/middleware/validate.middleware.js";
import RegisterDto from "./dto/register.dto";
import { authenticate } from "./auth.middleware.js";
import LoginDto from "./dto/login.dto.js";
import forgotPasswordDto from "./dto/forgotPassword.dto.js";
import resetPasswordDto from "./dto/resetPassword.dto.js"; // COMPLETED: Imported missing reset password DTO

const router = Router();

router.post("/register", validate(RegisterDto), controller.register);
router.post("/login", validate(LoginDto), controller.login);
router.post("/logout", authenticate, controller.logout);
router.get("/getMe", authenticate, controller.getMe);
router.post("/reset-password", validate(resetPasswordDto), controller.resetPassword);
router.post("/forgot-password", validate(forgotPasswordDto), controller.forgotPassword);

export default router;
