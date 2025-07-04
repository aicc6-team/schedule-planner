import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // 응답 완료 후 로깅
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    // 상태 코드에 따른 로그 레벨
    if (res.statusCode >= 400) {
      console.error('❌ 요청 실패:', logMessage);
    } else if (res.statusCode >= 300) {
      console.warn('⚠️ 요청 리다이렉트:', logMessage);
    } else {
      console.log('✅ 요청 성공:', logMessage);
    }
  });

  next();
}; 