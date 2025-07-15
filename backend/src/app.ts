import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import 'dotenv/config';

// 라우터 import
import scheduleRoutes from './routes/schedules';
import analyticsRoutes from './routes/analytics';
import googleAuthRoutes from './routes/googleAuth';
import authRoutes from './routes/auth';
import aiConflictAnalysisRoutes from './routes/aiConflictAnalysis';
import calendarRoutes from './routes/calendar';
import utilsRoutes from './routes/utils';

// 미들웨어 import
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();

// 기본 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(compression()); // 응답 압축
app.use(express.json({ limit: '10mb' })); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩 파싱

// CORS 설정
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'], // 개발 환경에서 두 포트 모두 허용
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting 설정
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 요청 수
  message: {
    error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
});
app.use('/api/', limiter);

// 요청 로깅 미들웨어
app.use(requestLogger);

// API 라우터 설정
app.use('/api/schedules', scheduleRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai-conflict-analysis', aiConflictAnalysisRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/utils', utilsRoutes);

app.use('/kms', express.static(path.join(__dirname, '../kms')));

/*
=== 구현된 일정 관리 API 엔드포인트 목록 ===

📋 조회 API:
- GET  /api/schedules/personal      - 개인 일정 목록 조회
- GET  /api/schedules/department    - 부서 일정 목록 조회
- GET  /api/schedules/project       - 프로젝트 일정 목록 조회
- GET  /api/schedules/all           - 모든 일정 조회 (통합)

👤 개인 일정 CRUD:
- POST   /api/schedules/personal    - 개인 일정 생성
- GET    /api/schedules/personal/:id - 개인 일정 상세 조회
- PUT    /api/schedules/personal/:id - 개인 일정 수정
- DELETE /api/schedules/personal/:id - 개인 일정 삭제

🏢 부서 일정 CRUD:
- POST   /api/schedules/department    - 부서 일정 생성
- GET    /api/schedules/department/:id - 부서 일정 상세 조회
- PUT    /api/schedules/department/:id - 부서 일정 수정
- DELETE /api/schedules/department/:id - 부서 일정 삭제

📁 프로젝트 일정 CRUD:
- POST   /api/schedules/project    - 프로젝트 일정 생성
- GET    /api/schedules/project/:id - 프로젝트 일정 상세 조회
- PUT    /api/schedules/project/:id - 프로젝트 일정 수정
- DELETE /api/schedules/project/:id - 프로젝트 일정 삭제

📊 응답 형식:
{
  "success": true,
  "data": {...},
  "message": "작업 완료",
  "count": 5 (목록 조회 시)
}

🔧 기능:
- ✅ Firestore 연동
- ✅ TypeScript 타입 안정성
- ✅ 에러 처리 (400, 404, 500)
- ✅ ID 검증
- ✅ 자동 타임스탬프 (createdAt, updatedAt)
*/

// 헬스 체크 엔드포인트
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development'
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: '요청한 엔드포인트를 찾을 수 없습니다.',
    path: req.originalUrl,
    method: req.method
  });
});

// 에러 핸들링 미들웨어 (마지막에 배치)
app.use(errorHandler);

export default app; 