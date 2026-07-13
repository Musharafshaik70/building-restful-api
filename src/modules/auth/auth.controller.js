import ApiResponse from "../../common/utils/api-response.js";
import * as authService from "./auth.service.js";

const register = async (req, res) => {
    const user = await authService.register(req.body);
    return ApiResponse.created(res, "Successfully Registered", user);
};

const login = async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 15 * 60 * 1000 });
    return ApiResponse.ok(res, "Login Successful", { user, accessToken, refreshToken });
};

const logout = async (req, res) => {
    await authService.logout(req.user.id);
    res.clearCookie("refreshToken").clearCookie("accessToken");
    return ApiResponse.ok(res, "Logout Successful");
};

const refresh = async (req, res) => {
    const token = req.cookies.refreshToken;
    const { accessToken, refreshToken } = await authService.refresh(token);
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 15 * 60 * 1000 });
    return ApiResponse.ok(res, "Tokens updated", { accessToken, refreshToken });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const rawToken = await authService.forgotPassword(email);
    //send rawToken via email
    return ApiResponse.ok(res, "Token sent to mail");
};

const resetPassword = async (req, res) => {
    await authService.resetPassword(req.body);
    return ApiResponse.ok(res, "Password reset successful");
};

const verifyEmail = async (req, res) => {
    const user = await authService.verifyEmail(req.params);
    return ApiResponse.ok(res, "Email verified successfully", user);
};

const getMe = async (req, res) => {
    const user = await authService.getMe(req.user.id);
    return ApiResponse.ok(res, "Successfully Fetched User Details", user);
};

export { register, login, logout, refresh, forgotPassword, resetPassword, getMe };
