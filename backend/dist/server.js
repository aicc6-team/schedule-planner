"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
require("dotenv/config");
const PORT = process.env['PORT'] || 3001;
const startServer = async () => {
    try {
        app_1.default.listen(PORT, () => {
            console.log('🚀 서버가 시작되었습니다!');
            console.log(`📍 서버 주소: http://localhost:${PORT}`);
            console.log(`🔍 헬스 체크: http://localhost:${PORT}/health`);
            console.log(`🌍 환경: ${process.env['NODE_ENV'] || 'development'}`);
            console.log(`⏰ 시작 시간: ${new Date().toISOString()}`);
        });
    }
    catch (error) {
        console.error('❌ 서버 시작 실패:', error);
        process.exit(1);
    }
};
startServer();
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('🛑 SIGINT 신호를 받았습니다. 서버를 종료합니다...');
    process.exit(0);
});
//# sourceMappingURL=server.js.map