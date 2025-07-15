import { Request, Response } from 'express';
import googleAuthService from '../services/googleAuthService';
import googleCalendarService from '../services/googleCalendarService';
import jwtService from '../services/jwtService';
import { firestoreService } from '../services/firestoreService';

export interface AuthenticatedRequest extends Request {
  user?: {
    tokens: any;
  };
}

class GoogleAuthController {
  /**
   * 환경변수 확인 (디버깅용)
   * GET /api/auth/google/debug
   */
  async debugConfig(_req: Request, res: Response) {
    try {
      const config = {
        clientId: process.env['GOOGLE_CLIENT_ID'] ? '✅ 설정됨' : '❌ 미설정',
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'] ? '✅ 설정됨' : '❌ 미설정',
        redirectUri: process.env['GOOGLE_REDIRECT_URI'] || '❌ 미설정',
        jwtSecret: process.env['JWT_SECRET'] ? '✅ 설정됨' : '❌ 미설정'
      };

      return res.status(200).json({
        success: true,
        data: config,
        message: '환경변수 설정 상태'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '환경변수 확인 실패'
      });
    }
  }

  /**
   * Google OAuth 로그인 URL 생성
   * GET /api/auth/google
   */
  async getAuthUrl(_req: Request, res: Response) {
    try {
      console.log('🚀 Google OAuth URL 생성 요청 받음');
      
      const authUrl = googleAuthService.generateAuthUrl();
      
      console.log('✅ Google OAuth URL 생성 성공');
      
      return res.status(200).json({
        success: true,
        data: {
          authUrl: authUrl
        },
        message: 'Google OAuth URL이 생성되었습니다.'
      });
    } catch (error) {
      console.error('❌ OAuth URL 생성 실패:', error);
      return res.status(500).json({
        success: false,
        error: 'OAuth URL 생성에 실패했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  }

  /**
   * Google OAuth 콜백 처리
   * GET /api/auth/google/callback?code=xxx
   */
  async handleCallback(req: Request, res: Response) {
    try {
      console.log('🔄 Google OAuth 콜백 처리 시작');
      console.log('📝 요청 쿼리:', req.query);
      
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        console.log('❌ 인증 코드 없음');
        return res.status(400).json({
          success: false,
          error: '인증 코드가 제공되지 않았습니다.'
        });
      }

      console.log('✅ 인증 코드 수신:', code.substring(0, 20) + '...');

      // 인증 코드로 토큰 교환
      const tokens = await googleAuthService.exchangeCodeForTokens(code);
      
      // Google 사용자 정보 가져오기
      const userInfo = await googleAuthService.getUserInfo(tokens.access_token);
      
      // 사용자 정보를 Firestore에 저장하거나 업데이트
      const userData = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        googleTokens: tokens,
        lastLogin: new Date(),
        createdAt: new Date()
      };

      const userId = await firestoreService.createOrUpdateUser(userData);
      
      // JWT 토큰 생성
      const jwtToken = jwtService.generateToken({
        id: userId,
        email: userInfo.email,
        name: userInfo.name
      });

      const refreshToken = jwtService.generateRefreshToken(userId);
      
      // 프론트엔드로 리디렉션 (토큰 포함)
      const redirectUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/dashboard?tokens=${encodeURIComponent(JSON.stringify({
        accessToken: jwtToken,
        refreshToken: refreshToken,
        googleTokens: tokens
      }))}`;
      
      return res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('OAuth 콜백 처리 실패:', error);
      const errorUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/login?error=oauth_error`;
      return res.redirect(errorUrl);
    }
  }

  /**
   * 토큰 갱신
   * POST /api/auth/google/refresh
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token이 제공되지 않았습니다.'
        });
      }

      const newTokens = await googleAuthService.refreshAccessToken(refreshToken);
      
      return res.status(200).json({
        success: true,
        data: {
          tokens: newTokens
        },
        message: '토큰이 갱신되었습니다.'
      });
      
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      return res.status(500).json({
        success: false,
        error: '토큰 갱신에 실패했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 토큰 검증
   * POST /api/auth/google/validate
   */
  async validateToken(req: Request, res: Response) {
    try {
      const { accessToken } = req.body;
      
      if (!accessToken) {
        return res.status(400).json({
          success: false,
          error: 'Access token이 제공되지 않았습니다.'
        });
      }

      const isValid = await googleAuthService.validateToken(accessToken);
      
      return res.status(200).json({
        success: true,
        data: {
          isValid: isValid
        },
        message: isValid ? '토큰이 유효합니다.' : '토큰이 유효하지 않습니다.'
      });
      
    } catch (error) {
      console.error('토큰 검증 실패:', error);
      return res.status(500).json({
        success: false,
        error: '토큰 검증에 실패했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 캘린더 이벤트 목록 조회
   * POST /api/auth/google/calendar/events
   */
  async getCalendarEvents(req: Request, res: Response) {
    try {
      const { tokens, options } = req.body;
      
      if (!tokens || !tokens.access_token) {
        return res.status(400).json({
          success: false,
          error: '인증 토큰이 제공되지 않았습니다.'
        });
      }

      const events = await googleCalendarService.getEvents(tokens, options);
      
      return res.status(200).json({
        success: true,
        data: {
          events: events,
          count: events.length
        },
        message: '캘린더 이벤트를 성공적으로 조회했습니다.'
      });
      
    } catch (error) {
      console.error('캘린더 이벤트 조회 실패:', error);
      return res.status(500).json({
        success: false,
        error: '캘린더 이벤트 조회에 실패했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 캘린더 이벤트 생성
   * POST /api/auth/google/calendar/events/create
   */
  async createCalendarEvent(req: Request, res: Response) {
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

      const createdEvent = await googleCalendarService.createEvent(tokens, eventData);
      
      return res.status(201).json({
        success: true,
        data: {
          event: createdEvent
        },
        message: '캘린더 이벤트가 성공적으로 생성되었습니다.'
      });
      
    } catch (error) {
      console.error('캘린더 이벤트 생성 실패:', error);
      return res.status(500).json({
        success: false,
        error: '캘린더 이벤트 생성에 실패했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 캘린더 목록 조회
   * POST /api/auth/google/calendar/list
   */
  async getCalendarList(req: Request, res: Response) {
    try {
      const { tokens } = req.body;
      
      if (!tokens || !tokens.access_token) {
        return res.status(400).json({
          success: false,
          error: '인증 토큰이 제공되지 않았습니다.'
        });
      }

      const calendars = await googleCalendarService.getCalendarList(tokens);
      
      return res.status(200).json({
        success: true,
        data: {
          calendars: calendars,
          count: calendars.length
        },
        message: '캘린더 목록을 성공적으로 조회했습니다.'
      });
      
    } catch (error) {
      console.error('캘린더 목록 조회 실패:', error);
      return res.status(500).json({
        success: false,
        error: '캘린더 목록 조회에 실패했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  }
}

export default new GoogleAuthController(); 