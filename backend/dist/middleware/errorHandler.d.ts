import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare const errorHandler: (err: AppError, req: Request, res: Response, _next: NextFunction) => void;
export declare class CustomError extends Error implements AppError {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number);
}
export declare class BadRequestError extends CustomError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends CustomError {
    constructor(message?: string);
}
export declare class ForbiddenError extends CustomError {
    constructor(message?: string);
}
export declare class NotFoundError extends CustomError {
    constructor(message?: string);
}
export declare class ConflictError extends CustomError {
    constructor(message?: string);
}
export declare class ValidationError extends CustomError {
    constructor(message?: string);
}
//# sourceMappingURL=errorHandler.d.ts.map