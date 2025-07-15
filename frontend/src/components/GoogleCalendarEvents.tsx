'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

interface GoogleCalendarEventsProps {
  tokens?: any;
}

export default function GoogleCalendarEvents({ tokens }: GoogleCalendarEventsProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarEvents = async () => {
    if (!tokens) {
      setError('인증 토큰이 없습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/auth/google/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens: tokens,
          options: {
            maxResults: 10,
            timeMin: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEvents(data.data.events);
      } else {
        setError(data.error || '이벤트를 가져오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('캘린더 이벤트 조회 오류:', error);
      setError('캘린더 이벤트 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokens) {
      fetchCalendarEvents();
    }
  }, [tokens]);

  const formatDate = (dateTimeString?: string, dateString?: string) => {
    if (dateTimeString) {
      return new Date(dateTimeString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (dateString) {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return '날짜 없음';
  };

  if (!tokens) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          📅 Google Calendar 이벤트
        </h3>
        <div className="text-center py-8">
          <p className="text-secondary-500 mb-4">
            Google 캘린더 이벤트를 보려면 로그인이 필요합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary-900">
          📅 Google Calendar 이벤트
        </h3>
        <button
          onClick={fetchCalendarEvents}
          disabled={loading}
          className="btn-secondary text-sm"
        >
          {loading ? '새로고침 중...' : '새로고침'}
        </button>
      </div>

      {loading && <LoadingSpinner />}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-8">
          <p className="text-secondary-500">
            예정된 이벤트가 없습니다.
          </p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="space-y-3">
          {events.map((event, index) => (
            <div 
              key={event.id || index} 
              className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-secondary-900 mb-1">
                    {event.summary}
                  </h4>
                  
                  <div className="text-sm text-secondary-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-secondary-400">🕒</span>
                      <span>
                        {formatDate(event.start.dateTime, event.start.date)}
                        {event.end.dateTime !== event.start.dateTime && (
                          <> ~ {formatDate(event.end.dateTime, event.end.date)}</>
                        )}
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <span className="text-secondary-400">📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.description && (
                      <div className="flex items-start gap-2 mt-2">
                        <span className="text-secondary-400">📝</span>
                        <span className="text-xs">
                          {event.description.length > 100 
                            ? `${event.description.substring(0, 100)}...` 
                            : event.description
                          }
                        </span>
                      </div>
                    )}
                    
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-secondary-400">👥</span>
                        <span className="text-xs">
                          참석자 {event.attendees.length}명
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 