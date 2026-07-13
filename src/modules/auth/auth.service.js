import ApiError from "../../common/utils/api-error.js";
import {
    generateAccessToken,
    generateRefreshToken,
    generateResetToken,
    verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";
import User from "./auth.model.js";
import crypto from "crypto";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const register = async ({ name, email, password, role }) => {
    const existing = await User.findOne({ email });
    if (existing) throw ApiError.conflict("Email already exists");

    const { rawToken, hashedToken } = generateResetToken();
    const user = await User.create({
        name,
        email,
        password,
        role,
        verificationToken: hashedToken,
    });

    //send verification email to user

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.verificationToken;

    return userObj;
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) throw ApiError.badRequest("Email or password is incorrect");

    const checkPassword = await user.comparePassword(password);
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
    await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw ApiError.notFound("User not found");

    const { rawToken, hashedToken } = generateResetToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    //send rawToken to user via email
    return rawToken;
};

const resetPassword = async (email, token, newPassword) => {
    if (!token) throw ApiError.unauthorized("Token is Missing");

    const user = await User.findOne({ email }).select("+resetPasswordToken +resetPasswordExpires");
    if (!user) throw ApiError.unauthorized("User is unauthorized");

    if (Date.now() > user.resetPasswordExpires) throw ApiError.unauthorized("Reset token has expired");

    if (hashToken(token) !== user.resetPasswordToken) throw ApiError.unauthorized("Invalid token");

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();
};

const verifyEmail = async (token) => {
    const hashedToken = hashToken(token);

    const user = await User.findOne({ verificationToken: hashedToken }).select("+verificationToken +isVerified");
    if (!user) throw ApiError.unauthorized("Not Authorized");

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return user;
};

const getMe = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return user;
};

export { register, login, refresh, logout, forgotPassword, resetPassword, verifyEmail, getMe };

//user.refreshToken = null ----> "refreshToken " field exists in DB.
//user.refreshToken = undefined -----> "refreshToken " is removed from DB.
