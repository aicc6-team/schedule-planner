import { google, calendar_v3 } from 'googleapis';
import googleAuthService, { GoogleAuthTokens } from './googleAuthService';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string | undefined;
  location?: string | undefined;
  start: {
    dateTime?: string | undefined;
    date?: string | undefined;
    timeZone?: string | undefined;
  };
  end: {
    dateTime?: string | undefined;
    date?: string | undefined;
    timeZone?: string | undefined;
  };
  attendees?: Array<{
    email: string;
    displayName?: string | undefined;
  }> | undefined;
  organizer?: { email: string } | undefined;
}

export interface CalendarListOptions {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  singleEvents?: boolean;
  orderBy?: 'startTime' | 'updated';
}

class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;

  constructor() {
    this.calendar = google.calendar({ version: 'v3' });
  }

  /**
   * 사용자 토큰으로 Calendar API 인증 설정
   */
  private setAuth(tokens: GoogleAuthTokens) {
    const oauth2Client = googleAuthService.getOAuth2Client();
    googleAuthService.setCredentials(tokens);
    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  }

  /**
   * 캘린더 이벤트 목록 조회
   */
  async getEvents(tokens: GoogleAuthTokens, options: CalendarListOptions = {}): Promise<CalendarEvent[]> {
    try {
      this.setAuth(tokens);

      const defaultOptions = {
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime' as const
      };

      const queryOptions = { ...defaultOptions, ...options };

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        ...queryOptions
      });

      const events = response.data.items || [];
      
      return events.map((event: calendar_v3.Schema$Event) => ({
        id: event.id || '',
        summary: event.summary || '제목 없음',
        description: event.description || undefined,
        location: event.location || undefined,
        start: {
          dateTime: event.start?.dateTime || undefined,
          date: event.start?.date || undefined,
          timeZone: event.start?.timeZone || undefined
        },
        end: {
          dateTime: event.end?.dateTime || undefined,
          date: event.end?.date || undefined,
          timeZone: event.end?.timeZone || undefined
        },
        attendees: event.attendees?.map((attendee: calendar_v3.Schema$EventAttendee) => ({
          email: attendee.email || '',
          displayName: attendee.displayName ?? undefined
        }))
      }));

    } catch (error) {
      console.error('캘린더 이벤트 조회 실패:', error);
      throw new Error('캘린더 이벤트를 가져오는데 실패했습니다.');
    }
  }

  /**
   * 캘린더 이벤트 생성
   */
  async createEvent(tokens: GoogleAuthTokens, eventData: CalendarEvent): Promise<CalendarEvent> {
    try {
      this.setAuth(tokens);

      const requestBody: any = {
        summary: eventData.summary,
        start: eventData.start,
        end: eventData.end
      };

      if (eventData.description) requestBody.description = eventData.description;
      if (eventData.location) requestBody.location = eventData.location;
      if (eventData.attendees && eventData.attendees.length > 0) requestBody.attendees = eventData.attendees;

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: requestBody
      }) as any;

      const createdEvent = response.data;
      
      return {
        id: createdEvent.id || '',
        summary: createdEvent.summary || '',
        description: createdEvent.description || undefined,
        location: createdEvent.location || undefined,
        start: {
          dateTime: createdEvent.start?.dateTime || undefined,
          date: createdEvent.start?.date || undefined,
          timeZone: createdEvent.start?.timeZone || undefined
        },
        end: {
          dateTime: createdEvent.end?.dateTime || undefined,
          date: createdEvent.end?.date || undefined,
          timeZone: createdEvent.end?.timeZone || undefined
        },
        attendees: createdEvent.attendees?.map((attendee: calendar_v3.Schema$EventAttendee) => ({
          email: attendee.email || '',
          displayName: attendee.displayName ?? undefined
        }))
      };

    } catch (error) {
      console.error('캘린더 이벤트 생성 실패:', error);
      throw new Error('캘린더 이벤트 생성에 실패했습니다.');
    }
  }

  /**
   * 캘린더 이벤트 수정
   */
  async updateEvent(tokens: GoogleAuthTokens, eventId: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      this.setAuth(tokens);

      const requestBody: any = {};

      if (eventData.summary) requestBody.summary = eventData.summary;
      if (eventData.description) requestBody.description = eventData.description;
      if (eventData.location) requestBody.location = eventData.location;
      if (eventData.start) requestBody.start = eventData.start;
      if (eventData.end) requestBody.end = eventData.end;
      if (eventData.attendees && eventData.attendees.length > 0) requestBody.attendees = eventData.attendees;

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: requestBody
      }) as any;

      const updatedEvent = response.data;
      
      return {
        id: updatedEvent.id || '',
        summary: updatedEvent.summary || '',
        description: updatedEvent.description || undefined,
        location: updatedEvent.location || undefined,
        start: {
          dateTime: updatedEvent.start?.dateTime || undefined,
          date: updatedEvent.start?.date || undefined,
          timeZone: updatedEvent.start?.timeZone || undefined
        },
        end: {
          dateTime: updatedEvent.end?.dateTime || undefined,
          date: updatedEvent.end?.date || undefined,
          timeZone: updatedEvent.end?.timeZone || undefined
        },
        attendees: updatedEvent.attendees?.map((attendee: calendar_v3.Schema$EventAttendee) => ({
          email: attendee.email || '',
          displayName: attendee.displayName ?? undefined
        }))
      };

    } catch (error) {
      console.error('캘린더 이벤트 수정 실패:', error);
      throw new Error('캘린더 이벤트 수정에 실패했습니다.');
    }
  }

  /**
   * 캘린더 이벤트 삭제
   */
  async deleteEvent(tokens: GoogleAuthTokens, eventId: string): Promise<void> {
    try {
      this.setAuth(tokens);

      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });

    } catch (error) {
      console.error('캘린더 이벤트 삭제 실패:', error);
      throw new Error('캘린더 이벤트 삭제에 실패했습니다.');
    }
  }

  /**
   * 사용자의 캘린더 목록 조회
   */
  async getCalendarList(tokens: GoogleAuthTokens) {
    try {
      this.setAuth(tokens);

      const response = await this.calendar.calendarList.list();
      
      return response.data.items?.map((calendar: calendar_v3.Schema$CalendarListEntry) => ({
        id: calendar.id ?? undefined,
        summary: calendar.summary ?? undefined,
        description: calendar.description ?? undefined,
        primary: calendar.primary ?? undefined,
        accessRole: calendar.accessRole ?? undefined
      })) || [];

    } catch (error) {
      console.error('캘린더 목록 조회 실패:', error);
      throw new Error('캘린더 목록을 가져오는데 실패했습니다.');
    }
  }
}

export default new GoogleCalendarService(); 