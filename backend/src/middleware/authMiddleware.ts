import { Request, Response, NextFunction } from 'express';
import jwtService from '../services/jwtService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
}

/**
 * JWT 토큰 인증 미들웨어
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: '인증 토큰이 제공되지 않았습니다.',
      message: '로그인이 필요합니다.'
    });
    return;
  }

  const user = jwtService.verifyToken(token);
  if (!user) {
    res.status(403).json({
      success: false,
      error: '유효하지 않은 토큰입니다.',
      message: '토큰이 만료되었거나 유효하지 않습니다.'
    });
    return;
  }

  req.user = user;
  next();
};

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
 */
export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const user = jwtService.verifyToken(token);
    if (user) {
      req.user = user;
    }
  }

  next();
};

/**
 * 토큰 갱신 미들웨어
 */
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: '리프레시 토큰이 제공되지 않았습니다.'
    });
  }

  const payload = jwtService.verifyRefreshToken(refreshToken);
  if (!payload) {
    return res.status(403).json({
      success: false,
      error: '유효하지 않은 리프레시 토큰입니다.'
    });
  }

  // 새로운 액세스 토큰 생성
  const newAccessToken = jwtService.generateToken({
    id: payload.userId,
    email: '', // 필요시 사용자 정보를 DB에서 조회
    name: ''
  });

  return res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken
    },
    message: '토큰이 갱신되었습니다.'
  });
}; 