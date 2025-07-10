"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    const start = Date.now();
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
        if (res.statusCode >= 400) {
            console.error('❌ 요청 실패:', logMessage);
        }
        else if (res.statusCode >= 300) {
            console.warn('⚠️ 요청 리다이렉트:', logMessage);
        }
        else {
            console.log('✅ 요청 성공:', logMessage);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map