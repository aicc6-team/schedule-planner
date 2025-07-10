"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.CustomError = exports.errorHandler = void 0;
const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || '서버 내부 오류가 발생했습니다.';
    const errorResponse = {
        error: message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    };
    if (process.env['NODE_ENV'] === 'development') {
        errorResponse.stack = err.stack;
    }
    console.error('❌ 에러 발생:', {
        message: err.message,
        statusCode,
        path: req.originalUrl,
        method: req.method,
        stack: err.stack
    });
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
class CustomError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
class BadRequestError extends CustomError {
    constructor(message = '잘못된 요청입니다.') {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends CustomError {
    constructor(message = '인증이 필요합니다.') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends CustomError {
    constructor(message = '접근 권한이 없습니다.') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends CustomError {
    constructor(message = '요청한 리소스를 찾을 수 없습니다.') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends CustomError {
    constructor(message = '리소스 충돌이 발생했습니다.') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends CustomError {
    constructor(message = '데이터 검증에 실패했습니다.') {
        super(message, 422);
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errorHandler.js.map