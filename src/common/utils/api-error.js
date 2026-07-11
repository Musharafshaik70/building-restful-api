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

    static conflict(message = "Conflict - User already exists") {
        return ApiError(409, message);
    }
}

export default ApiError;
