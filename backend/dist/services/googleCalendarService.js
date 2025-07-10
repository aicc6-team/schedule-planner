"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const googleAuthService_1 = __importDefault(require("./googleAuthService"));
class GoogleCalendarService {
    constructor() {
        this.calendar = googleapis_1.google.calendar({ version: 'v3' });
    }
    setAuth(tokens) {
        const oauth2Client = googleAuthService_1.default.getOAuth2Client();
        googleAuthService_1.default.setCredentials(tokens);
        this.calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
    }
    async getEvents(tokens, options = {}) {
        try {
            this.setAuth(tokens);
            const defaultOptions = {
                timeMin: new Date().toISOString(),
                maxResults: 50,
                singleEvents: true,
                orderBy: 'startTime'
            };
            const queryOptions = { ...defaultOptions, ...options };
            const response = await this.calendar.events.list({
                calendarId: 'primary',
                ...queryOptions
            });
            const events = response.data.items || [];
            return events.map(event => ({
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
                attendees: event.attendees?.map((attendee) => ({
                    email: attendee.email || '',
                    displayName: attendee.displayName
                }))
            }));
        }
        catch (error) {
            console.error('캘린더 이벤트 조회 실패:', error);
            throw new Error('캘린더 이벤트를 가져오는데 실패했습니다.');
        }
    }
    async createEvent(tokens, eventData) {
        try {
            this.setAuth(tokens);
            const requestBody = {
                summary: eventData.summary,
                start: eventData.start,
                end: eventData.end
            };
            if (eventData.description)
                requestBody.description = eventData.description;
            if (eventData.location)
                requestBody.location = eventData.location;
            if (eventData.attendees && eventData.attendees.length > 0)
                requestBody.attendees = eventData.attendees;
            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                requestBody: requestBody
            });
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
                attendees: createdEvent.attendees?.map((attendee) => ({
                    email: attendee.email || '',
                    displayName: attendee.displayName
                }))
            };
        }
        catch (error) {
            console.error('캘린더 이벤트 생성 실패:', error);
            throw new Error('캘린더 이벤트 생성에 실패했습니다.');
        }
    }
    async updateEvent(tokens, eventId, eventData) {
        try {
            this.setAuth(tokens);
            const requestBody = {};
            if (eventData.summary)
                requestBody.summary = eventData.summary;
            if (eventData.description)
                requestBody.description = eventData.description;
            if (eventData.location)
                requestBody.location = eventData.location;
            if (eventData.start)
                requestBody.start = eventData.start;
            if (eventData.end)
                requestBody.end = eventData.end;
            if (eventData.attendees && eventData.attendees.length > 0)
                requestBody.attendees = eventData.attendees;
            const response = await this.calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                requestBody: requestBody
            });
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
                attendees: updatedEvent.attendees?.map((attendee) => ({
                    email: attendee.email || '',
                    displayName: attendee.displayName
                }))
            };
        }
        catch (error) {
            console.error('캘린더 이벤트 수정 실패:', error);
            throw new Error('캘린더 이벤트 수정에 실패했습니다.');
        }
    }
    async deleteEvent(tokens, eventId) {
        try {
            this.setAuth(tokens);
            await this.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId
            });
        }
        catch (error) {
            console.error('캘린더 이벤트 삭제 실패:', error);
            throw new Error('캘린더 이벤트 삭제에 실패했습니다.');
        }
    }
    async getCalendarList(tokens) {
        try {
            this.setAuth(tokens);
            const response = await this.calendar.calendarList.list();
            return response.data.items?.map(calendar => ({
                id: calendar.id,
                summary: calendar.summary,
                description: calendar.description,
                primary: calendar.primary,
                accessRole: calendar.accessRole
            })) || [];
        }
        catch (error) {
            console.error('캘린더 목록 조회 실패:', error);
            throw new Error('캘린더 목록을 가져오는데 실패했습니다.');
        }
    }
}
exports.default = new GoogleCalendarService();
//# sourceMappingURL=googleCalendarService.js.map