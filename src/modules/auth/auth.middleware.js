import ApiError from "../../common/utils/api-error";
import { verifyAccessToken } from "../../common/utils/jwt.utils";
import User from "./auth.model.js";

const authenticate = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
        let token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw ApiError.unauthorized("Not authorized");

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id);
    if (!user) throw ApiError.unauthorized("Not authorized");

    req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    return next();
};

const authorize = async (...roles) => {
    return (req, res, next) => {
        if (!req.user.role.includes(roles)) {
            throw ApiError.forbidden("You do not have permission to perform this Action");
        }

        return next();
    };
};

export { authenticate, authorize };
