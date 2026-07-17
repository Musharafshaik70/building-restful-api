import crypto from "crypto";
import User from "./auth.model.js";
import ApiError from "../../common/utils/api-error.js";
import {
    generateAccessToken,
    generateRefreshToken,
    generateResetToken,
    verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "./../../common/config/email.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const register = async ({ name, email, password, role }) => {
    const existing = await User.findOne({ email });
    if (existing) throw ApiError.conflict("Email already exists");

    const { rawToken, hashedToken } = await generateResetToken();
    const user = await User.create({
        name,
        email,
        password,
        role,
        verificationToken: hashedToken,
    });

    //send verification email to user
    try {
        await sendVerificationEmail(email, rawToken);
    } catch (err) {
        console.error("Failed to send verification Email:", err.message);
    }

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.verificationToken;

    return userObj;
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw ApiError.badRequest("Email or password is incorrect");

    const checkPassword = await user.comparePassword(password, user.password);
    if (!checkPassword) throw ApiError.unauthorized("Password is Incorrect");

    if (!user.isVerified) throw ApiError.forbidden("User is Unauthorized");

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    return { user: userObj, accessToken, refreshToken };
};

const refresh = async (token) => {
    if (!token) throw ApiError.unauthorized("Refresh token is missing");

    const decoded = verifyRefreshToken(token);

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user) throw ApiError.unauthorized("User not found");

    if (hashToken(token) !== user.refreshToken) throw ApiError.unauthorized("Invalid refresh token");

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const logout = async (userId) => {
    // Clear stored refresh token so it can't be reused
    await User.findByIdAndUpdate(userId, { refreshToken: null });
};

//VerifyEmail service is used to verify the user when he clicks on the Verify button sent to email
const verifyEmail = async (token) => {
    const trimmed = String(token).trim();

    const hashedToken = hashToken(trimmed);

    let user = await User.findOne({ verificationToken: hashedToken }).select("+verificationToken");

    if (!user) throw ApiError.badRequest("Invalid or expired verification token");

    //updating isVerified to true and deleting the verificationToken field so that it cannot be reused
    user = await User.findByIdAndUpdate(
        user._id,
        {
            $set: { isVerified: true },
            $unset: { verificationToken: 1 },
        },
        { new: true },
    );

    return user;
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw ApiError.notFound("User not found");

    const { rawToken, hashedToken } = await generateResetToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    try {
        await sendResetPasswordEmail(email, rawToken);
    } catch (err) {
        console.error("Failed to send reset email : ", err.message);
    }
    return rawToken;
};

const resetPassword = async (token, newPassword) => {
    if (!token) throw ApiError.unauthorized("Token is Missing");
    const trimmed = String(token).trim();

    const hashedToken = hashToken(trimmed);

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) throw ApiError.unauthorized("Reset token is invalid or has expired");

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
};

const getMe = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return user;
};

export { register, login, refresh, logout, forgotPassword, resetPassword, verifyEmail, getMe };
