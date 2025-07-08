import 'dotenv/config';
export interface GoogleAuthTokens {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
}
declare class GoogleAuthService {
    private oauth2Client;
    constructor();
    generateAuthUrl(): string;
    exchangeCodeForTokens(code: string): Promise<GoogleAuthTokens>;
    setCredentials(tokens: GoogleAuthTokens): void;
    refreshAccessToken(refreshToken: string): Promise<GoogleAuthTokens>;
    getOAuth2Client(): import("googleapis-common").OAuth2Client;
    validateToken(accessToken: string): Promise<boolean>;
}
declare const _default: GoogleAuthService;
export default _default;
//# sourceMappingURL=googleAuthService.d.ts.map