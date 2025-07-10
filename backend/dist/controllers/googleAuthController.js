"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleAuthService_1 = __importDefault(require("../services/googleAuthService"));
const googleCalendarService_1 = __importDefault(require("../services/googleCalendarService"));
class GoogleAuthController {
    async getAuthUrl(_req, res) {
        try {
            const authUrl = googleAuthService_1.default.generateAuthUrl();
            return res.status(200).json({
                success: true,
                data: {
                    authUrl: authUrl
                },
                message: 'Google OAuth URL이 생성되었습니다.'
            });
        }
        catch (error) {
            console.error('OAuth URL 생성 실패:', error);
            return res.status(500).json({
                success: false,
                error: 'OAuth URL 생성에 실패했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            });
        }
    }
    async handleCallback(req, res) {
        try {
            const { code } = req.query;
            if (!code || typeof code !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: '인증 코드가 제공되지 않았습니다.'
                });
            }
            const tokens = await googleAuthService_1.default.exchangeCodeForTokens(code);
            return res.status(200).json({
                success: true,
                data: {
                    tokens: tokens
                },
                message: 'Google OAuth 인증이 완료되었습니다.'
            });
        }
        catch (error) {
            console.error('OAuth 콜백 처리 실패:', error);
            return res.status(500).json({
                success: false,
                error: 'OAuth 인증 처리에 실패했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            });
        }
    }
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Refresh token이 제공되지 않았습니다.'
                });
            }
            const newTokens = await googleAuthService_1.default.refreshAccessToken(refreshToken);
            return res.status(200).json({
                success: true,
                data: {
                    tokens: newTokens
                },
                message: '토큰이 갱신되었습니다.'
            });
        }
        catch (error) {
            console.error('토큰 갱신 실패:', error);
            return res.status(500).json({
                success: false,
                error: '토큰 갱신에 실패했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            });
        }
    }
    async validateToken(req, res) {
        try {
            const { accessToken } = req.body;
            if (!accessToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Access token이 제공되지 않았습니다.'
                });
            }
            const isValid = await googleAuthService_1.default.validateToken(accessToken);
            return res.status(200).json({
                success: true,
                data: {
                    isValid: isValid
                },
                message: isValid ? '토큰이 유효합니다.' : '토큰이 유효하지 않습니다.'
            });
        }
        catch (error) {
            console.error('토큰 검증 실패:', error);
            return res.status(500).json({
                success: false,
                error: '토큰 검증에 실패했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            });
        }
    }
    async getCalendarEvents(req, res) {
        try {
            const { tokens, options } = req.body;
            if (!tokens || !tokens.access_token) {
                return res.status(400).json({
                    success: false,
                    error: '인증 토큰이 제공되지 않았습니다.'
                });
            }
            const events = await googleCalendarService_1.default.getEvents(tokens, options);
            return res.status(200).json({
                success: true,
                data: {
                    events: events,
                    count: events.length
                },
                message: '캘린더 이벤트를 성공적으로 조회했습니다.'
            });
        }
        catch (error) {
            console.error('캘린더 이벤트 조회 실패:', error);
            return res.status(500).json({
                success: false,
                error: '캘린더 이벤트 조회에 실패했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            });
        }
    }
    async createCalendarEvent(req, res) {
        try {
            const { tokens, eventData } = req.body;
            if (!tokens || !tokens.access_token) {
                return res.status(400).json({
                    success: false,
                    error: '인증 토큰이 제공되지 않았습니다.'
                });
            }
            if (!eventData || !eventData.summary) {
                return res.status(400).json({
                    success: false,
                    error: '이벤트 제목이 필요합니다.'
                });
            }
            const createdEvent = await googleCalendarService_1.default.createEvent(tokens, eventData);
            return res.status(201).json({
                success: true,
                data: {
                    event: createdEvent
                },
                message: '캘린더 이벤트가 성공적으로 생성되었습니다.'
            });
        }
        catch (error) {
            console.error('캘린더 이벤트 생성 실패:', error);
            return res.status(500).json({
                success: false,
                error: '캘린더 이벤트 생성에 실패했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            });
        }
    }
    async getCalendarList(req, res) {
        try {
            const { tokens } = req.body;
            if (!tokens || !tokens.access_token) {
                return res.status(400).json({
                    success: false,
                    error: '인증 토큰이 제공되지 않았습니다.'
                });
            }
            const calendars = await googleCalendarService_1.default.getCalendarList(tokens);
            return res.status(200).json({
                success: true,
                data: {
                    calendars: calendars,
                    count: calendars.length
                },
                message: '캘린더 목록을 성공적으로 조회했습니다.'
            });
        }
        catch (error) {
            console.error('캘린더 목록 조회 실패:', error);
            return res.status(500).json({
                success: false,
                error: '캘린더 목록 조회에 실패했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            });
        }
    }
}
exports.default = new GoogleAuthController();
//# sourceMappingURL=googleAuthController.js.map