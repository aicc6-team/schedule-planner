import express from 'express';
import googleAuthController from '../controllers/googleAuthController';

const router = express.Router();

/*
=== Google OAuth & Calendar API 라우터 ===

🔐 OAuth 인증:
- GET  /api/auth/google              - OAuth URL 생성
- GET  /api/auth/google/callback     - OAuth 콜백 처리
- POST /api/auth/google/refresh      - 토큰 갱신
- POST /api/auth/google/validate     - 토큰 검증

📅 Calendar API:
- POST /api/auth/google/calendar/events       - 이벤트 목록 조회
- POST /api/auth/google/calendar/events/create - 이벤트 생성
- POST /api/auth/google/calendar/list         - 캘린더 목록 조회

📊 요청/응답 형식:
{
  "success": true,
  "data": {...},
  "message": "작업 완료"
}
*/

// OAuth 인증 관련 라우터
router.get('/debug', googleAuthController.debugConfig); // 디버깅용
router.get('/', googleAuthController.getAuthUrl);
router.get('/callback', googleAuthController.handleCallback);
router.post('/refresh', googleAuthController.refreshToken);
router.post('/validate', googleAuthController.validateToken);

// Calendar API 관련 라우터
router.post('/calendar/events', googleAuthController.getCalendarEvents);
router.post('/calendar/events/create', googleAuthController.createCalendarEvent);
router.post('/calendar/list', googleAuthController.getCalendarList);

export default router; 