class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = "Bad Request") {
        return new ApiError(400, message);
    }

    static unauthorized(message = "unauthorized") {
        return new ApiError(401, message);
    }

    static notFound(message = "User not Found") {
        return ApiError(404, message);
    }

    static conflict(message = "Conflict - User already exists") {
        return ApiError(409, message);
    }

    static forbidden(message = "User not Authorized") {
        return ApiError(412, message);
    }
}

export default ApiError;
