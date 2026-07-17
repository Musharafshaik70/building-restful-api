import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";
import ApiError from "../../common/utils/api-error.js";

const register = async (req, res) => {
    const user = await authService.register(req.body);
    return ApiResponse.created(res, "Registration Successful. Please verify your Email", user);
};

const login = async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
    });
    return ApiResponse.ok(res, "Login Successful", { user, accessToken, refreshToken });
};

const refreshToken = async (req, res) => {
    const token = req.cookies?.refreshToken;
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.refresh(token);
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
    });
    return ApiResponse.ok(res, "Tokens updated", { newAccessToken, newRefreshToken });
};

const logout = async (req, res) => {
    await authService.logout(req.user.id);
    res.clearCookie("refreshToken").clearCookie("accessToken");
    return ApiResponse.ok(res, "Logout Successful");
};

const verifyEmail = async (req, res) => {
    const user = await authService.verifyEmail(req.params.token);
    return ApiResponse.ok(res, "Email verified successfully", user);
};

const forgotPassword = async (req, res) => {
    const rawToken = await authService.forgotPassword(req.body.email);
    return ApiResponse.ok(res, "Token sent to mail", rawToken);
};

const resetPassword = async (req, res) => {
    await authService.resetPassword(req.params.token, req.body.password);
    return ApiResponse.ok(res, "Password reset successful");
};

const getMe = async (req, res) => {
    const user = await authService.getMe(req.user.id);
    return ApiResponse.ok(res, "Successfully Fetched User Details", user);
};

export { register, login, refreshToken, logout, verifyEmail, forgotPassword, resetPassword, getMe };

// here , we are exposing the tokens by returning it in response. It is just for testing.
