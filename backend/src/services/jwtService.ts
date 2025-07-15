import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface UserPayload {
  id: string;
  email: string;
  name: string;
  googleTokens?: any;
}

interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

class JWTService {
  private readonly JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = '7d';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '30d';

  /**
   * JWT 토큰 생성
   */
  generateToken(user: UserPayload): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });
  }

  /**
   * 리프레시 토큰 생성
   */
  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN
    });
  }

  /**
   * JWT 토큰 검증
   */
  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      console.error('JWT 토큰 검증 실패:', error);
      return null;
    }
  }

  /**
   * 리프레시 토큰 검증
   */
  verifyRefreshToken(refreshToken: string): { userId: string } | null {
    try {
      return jwt.verify(refreshToken, this.JWT_SECRET) as { userId: string };
    } catch (error) {
      console.error('리프레시 토큰 검증 실패:', error);
      return null;
    }
  }

  /**
   * 비밀번호 해싱
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * 비밀번호 검증
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * 토큰에서 사용자 정보 추출
   */
  extractUserFromToken(token: string): TokenPayload | null {
    return this.verifyToken(token);
  }
}

export default new JWTService(); 