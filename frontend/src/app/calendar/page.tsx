'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Badge from '@/components/Badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Google Calendar 이벤트 타입
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

// 이벤트 타입별 색상
const eventColors = {
  default: 'bg-blue-100 text-blue-800 border-blue-200',
  meeting: 'bg-green-100 text-green-800 border-green-200',
  personal: 'bg-purple-100 text-purple-800 border-purple-200',
  work: 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<any>(null);

  // localStorage에서 토큰 확인
  useEffect(() => {
    const savedTokens = localStorage.getItem('google_tokens');
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens);
        setTokens(parsedTokens);
      } catch (error) {
        console.error('토큰 파싱 오류:', error);
        localStorage.removeItem('google_tokens');
      }
    }
  }, []);

  // Google Calendar 이벤트 가져오기
  const fetchCalendarEvents = async () => {
    if (!tokens) {
      setError('Google 로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 현재 월의 시작과 끝
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const response = await fetch('http://localhost:3001/api/auth/google/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens: tokens,
          options: {
            maxResults: 100,
            timeMin: startOfMonth.toISOString(),
            timeMax: endOfMonth.toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
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

  // 토큰이나 현재 날짜가 변경될 때 이벤트 가져오기
  useEffect(() => {
    if (tokens) {
      fetchCalendarEvents();
    }
  }, [tokens, currentDate]);

  // 현재 월의 첫 번째 날과 마지막 날
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // 달력 시작일 (이전 달의 날짜들 포함)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  // 달력 종료일 (다음 달의 날짜들 포함)
  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

  // 날짜 배열 생성
  const dates = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // 특정 날짜의 일정 가져오기
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = event.start.dateTime 
        ? new Date(event.start.dateTime)
        : new Date(event.start.date + 'T00:00:00');
      
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // 이벤트 타입 결정
  const getEventType = (event: CalendarEvent) => {
    const summary = event.summary.toLowerCase();
    if (summary.includes('미팅') || summary.includes('meeting')) return 'meeting';
    if (summary.includes('개인') || summary.includes('personal')) return 'personal';
    if (summary.includes('업무') || summary.includes('work')) return 'work';
    return 'default';
  };

  // 날짜 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatDay = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // 이벤트 시간 포맷팅
  const formatEventTime = (event: CalendarEvent) => {
    if (event.start.dateTime) {
      return new Date(event.start.dateTime).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return '종일';
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <main className="lg:pl-64">
        <div className="p-8">
          <header className="flex items-center justify-between pb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">캘린더</h3>
              <p className="text-gray-500 mb-4">Google Calendar 일정을 확인하세요</p>
            </div>

            <div className="flex rounded-md shadow-sm">
              <button 
                onClick={fetchCalendarEvents}
                disabled={loading || !tokens}
                className="btn-secondary"
              >
                {loading ? '새로고침 중...' : '새로고침'}
              </button>
              <button 
                onClick={() => router.push('/schedules/create')}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                새 일정
              </button>
            </div>
          </header>

          {/* 로그인 상태 확인 */}
          {!tokens && (
            <div className="card mb-6">
              <div className="text-center py-8">
                <CalendarDaysIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  Google 로그인이 필요합니다
                </h3>
                <p className="text-secondary-600 mb-4">
                  캘린더 이벤트를 보려면 좌측 하단의 Google 로그인 버튼을 클릭하세요.
                </p>
              </div>
            </div>
          )}

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* 토큰이 있을 때만 캘린더 표시 */}
          {tokens && (
            <>
              {/* 캘린더 컨트롤 */}
              <div className="card mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* 뷰 선택 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setView('month')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        view === 'month'
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                      }`}
                    >
                      월
                    </button>
                    <button
                      onClick={() => setView('week')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        view === 'week'
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                      }`}
                    >
                      주
                    </button>
                    <button
                      onClick={() => setView('day')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        view === 'day'
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                      }`}
                    >
                      일
                    </button>
                  </div>

                  {/* 날짜 네비게이션 */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
                    >
                      <ChevronLeftIcon className="h-5 w-5 text-secondary-600" />
                    </button>
                    
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-semibold text-secondary-900">
                        {formatDate(currentDate)}
                      </h2>
                      <button
                        onClick={goToToday}
                        className="px-3 py-1 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                      >
                        오늘
                      </button>
                    </div>

                    <button
                      onClick={goToNextMonth}
                      className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
                    >
                      <ChevronRightIcon className="h-5 w-5 text-secondary-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 로딩 스피너 */}
              {loading && (
                <div className="card mb-6">
                  <LoadingSpinner />
                </div>
              )}

              {/* 캘린더 그리드 */}
              {!loading && (
                <div className="card">
                  {/* 요일 헤더 */}
                  <div className="grid grid-cols-7 gap-px bg-secondary-200">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                      <div key={day} className="bg-white p-3 text-center">
                        <span className="text-sm font-medium text-secondary-900">{day}</span>
                      </div>
                    ))}
                  </div>

                  {/* 날짜 그리드 */}
                  <div className="grid grid-cols-7 gap-px bg-secondary-200">
                    {dates.map((date, index) => {
                      const dayEvents = getEventsForDate(date);
                      return (
                        <div
                          key={index}
                          className={`bg-white min-h-[120px] p-2 ${
                            !isCurrentMonth(date) ? 'bg-secondary-50' : ''
                          }`}
                        >
                          {/* 날짜 */}
                          <div className={`text-sm font-medium mb-2 ${
                            isToday(date)
                              ? 'bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                              : isCurrentMonth(date)
                              ? 'text-secondary-900'
                              : 'text-secondary-400'
                          }`}>
                            {formatDay(date)}
                          </div>

                          {/* 이벤트 */}
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event, eventIndex) => {
                              const eventType = getEventType(event);
                              return (
                                <div
                                  key={event.id || eventIndex}
                                  className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity ${
                                    eventColors[eventType as keyof typeof eventColors]
                                  }`}
                                  title={`${event.summary}${event.description ? ' - ' + event.description : ''}`}
                                >
                                  <div className="font-medium truncate">{event.summary}</div>
                                  <div className="text-xs opacity-75">
                                    {formatEventTime(event)}
                                  </div>
                                </div>
                              );
                            })}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-secondary-500 text-center">
                                +{dayEvents.length - 2}개 더
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 이벤트 통계 */}
              {!loading && events.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-secondary-900 mb-3">
                    이번 달 일정 ({events.length}개)
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(eventColors).map(([type, colors]) => {
                      const count = events.filter(event => getEventType(event) === type).length;
                      if (count === 0) return null;
                      
                      return (
                        <div key={type} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${colors.split(' ')[0]}`}></div>
                          <span className="text-sm text-secondary-600">
                            {type === 'default' && `기타 (${count})`}
                            {type === 'meeting' && `미팅 (${count})`}
                            {type === 'personal' && `개인 (${count})`}
                            {type === 'work' && `업무 (${count})`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
} 