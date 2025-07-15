import { Router } from 'express';
import calendarController from '../controllers/calendarController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// 모든 캘린더 API는 인증 필요
router.use(authenticateToken);

// 캘린더 이벤트 조회
router.get('/events', calendarController.getCalendarEvents);

// 캘린더 이벤트 생성
router.post('/events', calendarController.createCalendarEvent);

// 캘린더 이벤트 수정
router.put('/events/:eventId', calendarController.updateCalendarEvent);

// 캘린더 이벤트 삭제
router.delete('/events/:eventId', calendarController.deleteCalendarEvent);

// 캘린더 목록 조회
router.get('/list', calendarController.getCalendarList);

// 구글 캘린더 → Firestore 동기화
router.post('/sync-google', calendarController.syncGoogleCalendarToFirestore);

export default router; 