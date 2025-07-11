"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
require("dotenv/config");
const schedules_1 = __importDefault(require("./routes/schedules"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const googleAuth_1 = __importDefault(require("./routes/googleAuth"));
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
});
app.use('/api/', limiter);
app.use(requestLogger_1.requestLogger);
app.use('/api/schedules', schedules_1.default);
app.use('/api/auth/google', googleAuth_1.default);
app.use('/api/analytics', analytics_1.default);
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development'
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        error: '요청한 엔드포인트를 찾을 수 없습니다.',
        path: req.originalUrl,
        method: req.method
    });
});
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map