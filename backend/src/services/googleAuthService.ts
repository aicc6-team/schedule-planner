import { google } from 'googleapis';
import 'dotenv/config';

export interface GoogleAuthTokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

class GoogleAuthService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env['GOOGLE_CLIENT_ID'],
      process.env['GOOGLE_CLIENT_SECRET'],
      process.env['GOOGLE_REDIRECT_URI']
    );
  }

  /**
   * Google OAuth 로그인 URL 생성
   */
  generateAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // 항상 refresh token을 받기 위해
    });

    return authUrl;
  }

  /**
   * 인증 코드로 토큰 교환
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleAuthTokens> {
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
    } catch (error) {
      console.error('토큰 교환 실패:', error);
      throw new Error('Google OAuth 토큰 교환에 실패했습니다.');
    }
  }

  /**
   * 토큰으로 OAuth2 클라이언트 설정
   */
  setCredentials(tokens: GoogleAuthTokens) {
    this.oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date
    });
  }

  /**
   * 토큰 갱신
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleAuthTokens> {
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
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      throw new Error('토큰 갱신에 실패했습니다.');
    }
  }

  /**
   * OAuth2 클라이언트 반환 (Calendar API 호출용)
   */
  getOAuth2Client() {
    return this.oauth2Client;
  }

  /**
   * 토큰 유효성 검증
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const tokenInfo = await this.oauth2Client.getTokenInfo(accessToken);
      
      // 토큰이 만료되지 않았고, 필요한 스코프를 가지고 있는지 확인
      return tokenInfo.expiry_date! > Date.now() && 
             tokenInfo.scopes?.includes('https://www.googleapis.com/auth/calendar');
    } catch (error) {
      console.error('토큰 검증 실패:', error);
      return false;
    }
  }
}

export default new GoogleAuthService(); 