import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import googleCalendarService from '../services/googleCalendarService';
import { firestoreService } from '../services/firestoreService';
import { db } from '../config/firebase';

class CalendarController {
  /**
   * 사용자의 Google Calendar 이벤트 조회
   * GET /api/calendar/events
   */
  async getCalendarEvents(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      // 사용자 정보 조회
      const user = await firestoreService.getUserById(req.user.userId);
      if (!user || !user.googleTokens) {
        return res.status(400).json({
          success: false,
          error: 'Google Calendar 연동이 필요합니다.'
        });
      }

      const { startDate, endDate, maxResults = 50 } = req.query;
      
      const options: any = {
        maxResults: parseInt(maxResults as string)
      };

      if (startDate) {
        options.timeMin = new Date(startDate as string).toISOString();
      }
      if (endDate) {
        options.timeMax = new Date(endDate as string).toISOString();
      }

      const events = await googleCalendarService.getEvents(user.googleTokens, options);
      
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
   * Google Calendar 이벤트 생성
   * POST /api/calendar/events
   */
  async createCalendarEvent(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const { summary, description, start, end, location, attendees } = req.body;

      if (!summary || !start || !end) {
        return res.status(400).json({
          success: false,
          error: '제목, 시작시간, 종료시간은 필수입니다.'
        });
      }

      // 사용자 정보 조회
      const user = await firestoreService.getUserById(req.user.userId);
      if (!user || !user.googleTokens) {
        return res.status(400).json({
          success: false,
          error: 'Google Calendar 연동이 필요합니다.'
        });
      }

      const eventData = {
        summary,
        description,
        start: {
          dateTime: new Date(start).toISOString(),
          timeZone: 'Asia/Seoul'
        },
        end: {
          dateTime: new Date(end).toISOString(),
          timeZone: 'Asia/Seoul'
        },
        location,
        attendees: attendees ? attendees.map((email: string) => ({ email })) : undefined
      };

      const createdEvent = await googleCalendarService.createEvent(user.googleTokens, eventData);
      
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
   * Google Calendar 이벤트 수정
   * PUT /api/calendar/events/:eventId
   */
  async updateCalendarEvent(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const { eventId } = req.params;
      const { summary, description, start, end, location, attendees } = req.body;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          error: '이벤트 ID가 필요합니다.'
        });
      }

      // 사용자 정보 조회
      const user = await firestoreService.getUserById(req.user.userId);
      if (!user || !user.googleTokens) {
        return res.status(400).json({
          success: false,
          error: 'Google Calendar 연동이 필요합니다.'
        });
      }

      const eventData: any = {};
      if (summary) eventData.summary = summary;
      if (description) eventData.description = description;
      if (start) eventData.start = { dateTime: new Date(start).toISOString(), timeZone: 'Asia/Seoul' };
      if (end) eventData.end = { dateTime: new Date(end).toISOString(), timeZone: 'Asia/Seoul' };
      if (location) eventData.location = location;
      if (attendees) eventData.attendees = attendees.map((email: string) => ({ email }));

      const updatedEvent = await googleCalendarService.updateEvent(user.googleTokens, eventId, eventData);
      
      return res.status(200).json({
        success: true,
        data: {
          event: updatedEvent
        },
        message: '캘린더 이벤트가 성공적으로 수정되었습니다.'
      });
      
    } catch (error) {
      console.error('캘린더 이벤트 수정 실패:', error);
      return res.status(500).json({
        success: false,
        error: '캘린더 이벤트 수정에 실패했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  }

  /**
   * Google Calendar 이벤트 삭제
   * DELETE /api/calendar/events/:eventId
   */
  async deleteCalendarEvent(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const { eventId } = req.params;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          error: '이벤트 ID가 필요합니다.'
        });
      }

      // 사용자 정보 조회
      const user = await firestoreService.getUserById(req.user.userId);
      if (!user || !user.googleTokens) {
        return res.status(400).json({
          success: false,
          error: 'Google Calendar 연동이 필요합니다.'
        });
      }

      await googleCalendarService.deleteEvent(user.googleTokens, eventId);
      
      return res.status(200).json({
        success: true,
        message: '캘린더 이벤트가 성공적으로 삭제되었습니다.'
      });
      
    } catch (error) {
      console.error('캘린더 이벤트 삭제 실패:', error);
      return res.status(500).json({
        success: false,
        error: '캘린더 이벤트 삭제에 실패했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 사용자의 Google Calendar 목록 조회
   * GET /api/calendar/list
   */
  async getCalendarList(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      // 사용자 정보 조회
      const user = await firestoreService.getUserById(req.user.userId);
      if (!user || !user.googleTokens) {
        return res.status(400).json({
          success: false,
          error: 'Google Calendar 연동이 필요합니다.'
        });
      }

      const calendars = await googleCalendarService.getCalendarList(user.googleTokens);
      
      return res.status(200).json({
        success: true,
        data: {
          calendars: calendars
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

  /**
   * Google Calendar → Firestore 동기화
   * POST /api/calendar/sync-google
   */
  async syncGoogleCalendarToFirestore(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '인증이 필요합니다.' });
      }
      const user = await firestoreService.getUserById(req.user.userId);
      if (!user || !user.googleTokens) {
        return res.status(400).json({ success: false, error: 'Google Calendar 연동이 필요합니다.' });
      }
      // 구글 캘린더 이벤트 가져오기
      const events = await googleCalendarService.getEvents(user.googleTokens, { maxResults: 100 });
      // Firestore에 저장 (google_event_id 기준 upsert)
      const batch = db.batch();
      const companySchedulesRef = db.collection('CompanySchedule');
      for (const event of events) {
        if (!event.id) continue;
        const docRef = companySchedulesRef.doc(event.id);
        const data = {
          title: event.summary ?? '',
          description: event.description ?? '',
          location: event.location ?? '',
          start_time: event.start?.dateTime ?? event.start?.date ?? '',
          end_time: event.end?.dateTime ?? event.end?.date ?? '',
          attendees: event.attendees?.map((a) => a.email) ?? [],
          organizer: event.organizer && typeof event.organizer === 'object' ? event.organizer.email : '',
          created_at: new Date(),
          updated_at: new Date(),
          type: 'company',
        };
        batch.set(docRef, data, { merge: true });
      }
      await batch.commit();
      return res.status(200).json({
        success: true,
        message: `구글 캘린더에서 ${events.length}개 일정을 동기화했습니다.`,
        count: events.length,
      });
    } catch (error) {
      console.error('구글 캘린더 동기화 실패:', error);
      return res.status(500).json({
        success: false,
        error: '구글 캘린더 동기화에 실패했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }
  }
}

export default new CalendarController(); 