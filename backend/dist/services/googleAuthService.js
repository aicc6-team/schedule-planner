"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
require("dotenv/config");
class GoogleAuthService {
    constructor() {
        this.oauth2Client = new googleapis_1.google.auth.OAuth2(process.env['GOOGLE_CLIENT_ID'], process.env['GOOGLE_CLIENT_SECRET'], process.env['GOOGLE_REDIRECT_URI']);
    }
    generateAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ];
        const authUrl = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
        return authUrl;
    }
    async exchangeCodeForTokens(code) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            if (!tokens.access_token) {
                throw new Error('Access token을 받지 못했습니다.');
            }
            return {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token || '',
                scope: tokens.scope || '',
                token_type: tokens.token_type || 'Bearer',
                expiry_date: tokens.expiry_date || 0
            };
        }
        catch (error) {
            console.error('토큰 교환 실패:', error);
            throw new Error('Google OAuth 토큰 교환에 실패했습니다.');
        }
    }
    setCredentials(tokens) {
        this.oauth2Client.setCredentials({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            scope: tokens.scope,
            token_type: tokens.token_type,
            expiry_date: tokens.expiry_date
        });
    }
    async refreshAccessToken(refreshToken) {
        try {
            this.oauth2Client.setCredentials({
                refresh_token: refreshToken
            });
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            return {
                access_token: credentials.access_token || '',
                refresh_token: credentials.refresh_token || refreshToken,
                scope: credentials.scope || '',
                token_type: credentials.token_type || 'Bearer',
                expiry_date: credentials.expiry_date || 0
            };
        }
        catch (error) {
            console.error('토큰 갱신 실패:', error);
            throw new Error('토큰 갱신에 실패했습니다.');
        }
    }
    getOAuth2Client() {
        return this.oauth2Client;
    }
    async validateToken(accessToken) {
        try {
            this.oauth2Client.setCredentials({
                access_token: accessToken
            });
            const tokenInfo = await this.oauth2Client.getTokenInfo(accessToken);
            return tokenInfo.expiry_date > Date.now() &&
                tokenInfo.scopes?.includes('https://www.googleapis.com/auth/calendar');
        }
        catch (error) {
            console.error('토큰 검증 실패:', error);
            return false;
        }
    }
}
exports.default = new GoogleAuthService();
//# sourceMappingURL=googleAuthService.js.map