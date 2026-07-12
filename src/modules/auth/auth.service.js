import ApiError from "../../common/utils/api-error";
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

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.verificationToken;

    return userObj;
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) throw ApiError.badRequest("Email or password is incorrect");

    // password checking

    if (!user.isVerified) throw ApiError.forbidden("User is Unauthorized");

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = hashToken(refreshToken);
    user.save({ validateBeforeSave: false });

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
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

export { register, login, refresh };
