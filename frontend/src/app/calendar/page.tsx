'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Badge from '@/components/Badge';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// 임시 데이터
const mockSchedules = [
  {
    id: '1',
    title: '팀 미팅',
    description: '주간 팀 미팅',
    startTime: '2024-01-15T09:00:00',
    endTime: '2024-01-15T10:00:00',
    type: 'department',
    priority: 'high',
  },
  {
    id: '2',
    title: '프로젝트 리뷰',
    description: '웹사이트 리뉴얼 프로젝트 리뷰',
    startTime: '2024-01-15T14:00:00',
    endTime: '2024-01-15T16:00:00',
    type: 'project',
    priority: 'medium',
  },
  {
    id: '3',
    title: '고객 미팅',
    description: '신규 고객사 미팅',
    startTime: '2024-01-16T11:00:00',
    endTime: '2024-01-16T12:00:00',
    type: 'company',
    priority: 'high',
  },
];

const typeColors = {
  personal: 'bg-blue-100 text-blue-800 border-blue-200',
  department: 'bg-green-100 text-green-800 border-green-200',
  project: 'bg-orange-100 text-orange-800 border-orange-200',
  company: 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

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
  const getSchedulesForDate = (date: Date) => {
    return mockSchedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return scheduleDate.toDateString() === date.toDateString();
    });
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

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">캘린더</h1>
              <p className="text-secondary-600">일정을 시각적으로 관리하세요</p>
            </div>
            <button 
              onClick={() => router.push('/schedules/create')}
              className="btn-primary mt-4 sm:mt-0"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              새 일정
            </button>
          </div>

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

          {/* 캘린더 그리드 */}
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
                const schedules = getSchedulesForDate(date);
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

                    {/* 일정 */}
                    <div className="space-y-1">
                      {schedules.slice(0, 2).map(schedule => (
                        <div
                          key={schedule.id}
                          className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity ${
                            typeColors[schedule.type as keyof typeof typeColors]
                          }`}
                          title={`${schedule.title} - ${schedule.description}`}
                        >
                          <div className="font-medium truncate">{schedule.title}</div>
                          <div className="text-xs opacity-75">
                            {new Date(schedule.startTime).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ))}
                      {schedules.length > 2 && (
                        <div className="text-xs text-secondary-500 text-center">
                          +{schedules.length - 2}개 더
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 범례 */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-secondary-900 mb-3">범례</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(typeColors).map(([type, colors]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${colors.split(' ')[0]}`}></div>
                  <span className="text-sm text-secondary-600">
                    {type === 'personal' && '개인'}
                    {type === 'department' && '부서'}
                    {type === 'project' && '프로젝트'}
                    {type === 'company' && '회사'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 