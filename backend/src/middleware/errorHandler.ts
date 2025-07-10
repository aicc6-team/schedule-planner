import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || '서버 내부 오류가 발생했습니다.';

  // 개발 환경에서는 스택 트레이스 포함
  const errorResponse: any = {
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

// 커스텀 에러 클래스
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// HTTP 상태 코드별 에러 클래스들
export class BadRequestError extends CustomError {
  constructor(message: string = '잘못된 요청입니다.') {
    super(message, 400);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = '인증이 필요합니다.') {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = '접근 권한이 없습니다.') {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = '요청한 리소스를 찾을 수 없습니다.') {
    super(message, 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = '리소스 충돌이 발생했습니다.') {
    super(message, 409);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string = '데이터 검증에 실패했습니다.') {
    super(message, 422);
  }
} 