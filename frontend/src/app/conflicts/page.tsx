'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { CalendarIcon, ExclamationTriangleIcon, ArrowRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// API 호출 함수들
const API_BASE_URL = 'http://localhost:3001';

const fetchAllSchedules = async () => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/all`);
  if (!response.ok) {
    throw new Error('일정을 가져오는데 실패했습니다.');
  }
  const result = await response.json();
  return result.data;
};

// 타입 정의
interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  priority: 'high' | 'medium' | 'low';
  type: 'personal' | 'department' | 'project';
  status?: 'pending' | 'completed';
}

interface PersonalSchedule {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  durationMinutes: number;
  importance: string;
  emotion: string;
  status?: string;
}

interface DepartmentSchedule {
  id: string;
  title: string;
  objective: string;
  date: string;
  time: string;
  participants: string[];
  status?: string;
}

interface ProjectSchedule {
  id: string;
  projectName: string;
  objective: string;
  category: string;
  endDate: string;
  time: string;
  roles: any;
  status?: string;
}

// 데이터 변환 함수들
const transformPersonalSchedule = (personalSchedule: PersonalSchedule): Schedule => {
  const startDateTime = `${personalSchedule.date}T${personalSchedule.time}:00`;
  const endDateTime = new Date(new Date(startDateTime).getTime() + personalSchedule.durationMinutes * 60000).toISOString();
  
  return {
    id: personalSchedule.id,
    title: personalSchedule.title,
    description: personalSchedule.description,
    startTime: startDateTime,
    endTime: endDateTime,
    priority: personalSchedule.importance === '높음' ? 'high' : personalSchedule.importance === '보통' ? 'medium' : 'low',
    type: 'personal',
    status: personalSchedule.status as any || 'pending'
  };
};

const transformDepartmentSchedule = (departmentSchedule: DepartmentSchedule): Schedule => {
  const startDateTime = `${departmentSchedule.date}T${departmentSchedule.time}:00`;
  const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60000).toISOString();
  
  return {
    id: departmentSchedule.id,
    title: departmentSchedule.title,
    description: departmentSchedule.objective,
    startTime: startDateTime,
    endTime: endDateTime,
    priority: 'medium',
    type: 'department',
    status: departmentSchedule.status as any || 'pending'
  };
};

const transformProjectSchedule = (projectSchedule: ProjectSchedule): Schedule => {
  const startDateTime = `${projectSchedule.endDate}T${projectSchedule.time}:00`;
  const startTime = new Date(new Date(startDateTime).getTime() - 60 * 60000).toISOString();
  
  return {
    id: projectSchedule.id,
    title: projectSchedule.projectName,
    description: projectSchedule.objective,
    startTime: startTime,
    endTime: startDateTime,
    priority: 'high',
    type: 'project',
    status: projectSchedule.status as any || 'pending'
  };
};

const transformAllSchedules = (allSchedules: {personal: PersonalSchedule[], department: DepartmentSchedule[], project: ProjectSchedule[]}): Schedule[] => {
  const transformedSchedules: Schedule[] = [];
  
  allSchedules.personal.forEach(schedule => {
    transformedSchedules.push(transformPersonalSchedule(schedule));
  });
  
  allSchedules.department.forEach(schedule => {
    transformedSchedules.push(transformDepartmentSchedule(schedule));
  });
  
  allSchedules.project.forEach(schedule => {
    transformedSchedules.push(transformProjectSchedule(schedule));
  });
  
  return transformedSchedules;
};

// mock 충돌 일정 데이터
const conflictSchedules = [
  {
    id: '1',
    title: '팀 미팅',
    time: '2024-06-10 10:00~11:00',
    desc: '주간 팀 미팅',
  },
  {
    id: '2',
    title: '프로젝트 리뷰',
    time: '2024-06-10 10:30~11:30',
    desc: '웹사이트 리뉴얼 리뷰',
  },
  {
    id: '3',
    title: '고객 미팅',
    time: '2024-06-12 14:00~15:00',
    desc: '신규 고객사 미팅',
  },
  {
    id: '4',
    title: '디자인 회의',
    time: '2024-06-15 09:00~10:00',
    desc: 'UI/UX 디자인 논의',
  },
  {
    id: '5',
    title: '개발 스크럼',
    time: '2024-06-15 09:30~10:30',
    desc: '일일 개발 스크럼',
  },
];

// mock 캘린더 일정 데이터
const calendarSchedules = [
  { date: 3, title: '팀 미팅' },
  { date: 10, title: '프로젝트 리뷰' },
  { date: 15, title: '고객 미팅' },
];

const rowCardColors = [
  'bg-blue-200',
  'bg-green-200',
  'bg-yellow-200',
  'bg-purple-200',
  'bg-pink-200',
];

function renderCalendar(year: number, month: number) {
  // month: 0-indexed
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const weeks: number[][] = [];
  let week: number[] = [];
  let day = 1 - startDay;
  while (day <= daysInMonth) {
    week = [];
    for (let i = 0; i < 7; i++, day++) {
      week.push(day > 0 && day <= daysInMonth ? day : 0);
    }
    weeks.push(week);
  }
  return weeks;
}

export default function ConflictsPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const weeks = renderCalendar(year, month);
  const router = useRouter();
  
  // 상태 관리
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const allSchedules = await fetchAllSchedules();
        const transformedSchedules = transformAllSchedules(allSchedules);
        setSchedules(transformedSchedules);
      } catch (error) {
        console.error('일정 로드 실패:', error);
        setError(error instanceof Error ? error.message : '일정을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, []);

  // 하단: 2주치 시간표 캘린더 (한 줄에 한 주씩)
  const todayDate = new Date();
  const getWeekDates = (start: Date) => Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const week1Start = new Date(todayDate);
  const week2Start = new Date(todayDate);
  week2Start.setDate(week2Start.getDate() + 7);
  const week1 = getWeekDates(week1Start);
  const week2 = getWeekDates(week2Start);
  const hours = Array.from({ length: 10 }).map((_, i) => 9 + i); // 9~18시
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 충돌 검사 함수
  const findConflicts = (scheduleList: Schedule[]): Schedule[] => {
    const conflicts: Schedule[] = [];
    
    for (let i = 0; i < scheduleList.length; i++) {
      for (let j = i + 1; j < scheduleList.length; j++) {
        const a = scheduleList[i];
        const b = scheduleList[j];
        
        const aStart = new Date(a.startTime);
        const aEnd = new Date(a.endTime);
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        
        // 시간 겹침 검사
        if (aStart < bEnd && bStart < aEnd) {
          if (!conflicts.find(s => s.id === a.id)) conflicts.push(a);
          if (!conflicts.find(s => s.id === b.id)) conflicts.push(b);
        }
      }
    }
    
    return conflicts;
  };

  // 2주간 표시 범위의 일정들만 필터링
  const twoWeekSchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.startTime);
    const startOfRange = new Date(week1Start);
    const endOfRange = new Date(week2Start);
    endOfRange.setDate(endOfRange.getDate() + 6); // 두 번째 주의 마지막 날
    
    return scheduleDate >= startOfRange && scheduleDate <= endOfRange;
  });

  const conflictingSchedules = findConflicts(twoWeekSchedules);

  // 시간표에서 일정의 위치를 계산하는 함수
  const getSchedulePosition = (schedule: Schedule, weekDates: Date[], weekIndex: number) => {
    const startTime = new Date(schedule.startTime);
    const endTime = new Date(schedule.endTime);
    
    // 해당 주에 속하는지 확인
    const dayIndex = weekDates.findIndex(date => 
      date.getFullYear() === startTime.getFullYear() &&
      date.getMonth() === startTime.getMonth() &&
      date.getDate() === startTime.getDate()
    );
    
    if (dayIndex === -1) return null;
    
    // 시간 위치 계산 (9시부터 시작)
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();
    
    if (startHour < 9 || startHour >= 19) return null; // 9-18시 범위 밖
    
    const startPosition = (startHour - 9) + (startMinute / 60);
    const endPosition = Math.min((endHour - 9) + (endMinute / 60), 10); // 최대 18시까지
    const duration = endPosition - startPosition;
    
    return {
      dayIndex,
      startPosition,
      duration,
      isConflicting: conflictingSchedules.some(c => c.id === schedule.id)
    };
  };

  // 일정 카드 스타일
  const getScheduleCardStyle = (schedule: Schedule, position: any) => {
    const typeColors = {
      personal: 'bg-blue-100 border-blue-300 text-blue-800',
      department: 'bg-green-100 border-green-300 text-green-800',
      project: 'bg-orange-100 border-orange-300 text-orange-800'
    };
    
    const conflictStyle = position.isConflicting ? 'ring-2 ring-red-400 bg-red-50' : '';
    
    return `${typeColors[schedule.type]} ${conflictStyle} border rounded px-1 py-0.5 text-xs font-medium truncate cursor-pointer hover:opacity-80 transition-opacity`;
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-secondary-900">일정 충돌</h1>
            <button
              onClick={() => router.push('/schedules')}
              className="btn-secondary flex items-center gap-1 px-4 py-2 text-sm"
            >
              일정관리
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 상단 좌측: 충돌 일정 리스트 */}
            <div className="card min-h-[200px] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <span className="text-lg font-semibold text-secondary-800">충돌 일정</span>
              </div>
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-secondary-500">일정을 불러오는 중...</div>
                </div>
              ) : error ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : conflictingSchedules.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-secondary-500">충돌하는 일정이 없습니다.</div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: Math.ceil(conflictingSchedules.length / 2) }).map((_, rowIdx) => (
                    <div key={rowIdx} className="flex gap-3">
                      {conflictingSchedules.slice(rowIdx * 2, rowIdx * 2 + 2).map(item => (
                        <div key={item.id} className={`flex-1 rounded-lg shadow-sm border p-3 relative ${rowCardColors[rowIdx % rowCardColors.length]}`}>
                          <button
                            className="absolute top-2 right-2 p-1 rounded hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition"
                            style={{ fontSize: 0 }}
                            onClick={() => router.push(`/schedules/create?mode=edit&id=${item.id}&type=${item.type}`)}
                            title="수정"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <div className="font-medium text-secondary-900">{item.title}</div>
                          <div className="text-xs text-secondary-700">
                            {new Date(item.startTime).toLocaleString('ko-KR', { 
                              month: 'numeric', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} ~ {new Date(item.endTime).toLocaleString('ko-KR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className="text-xs text-secondary-800">{item.description}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* 상단 우측: AI 분석 결과 메시지 */}
            <div className="card min-h-[200px] flex flex-col justify-start items-start text-left">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="h-5 w-5 text-primary-500" />
                <span className="text-lg font-semibold text-secondary-800">AI 자동 분석 결과</span>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center w-full">
                <div className="text-secondary-700 text-center w-full">
                  {loading ? (
                    '일정을 분석하는 중...'
                  ) : error ? (
                    '일정 분석에 실패했습니다.'
                  ) : (
                    <>
                      총 <span className="font-bold text-primary-600">{conflictingSchedules.length}건</span>의 일정 충돌이 발견되었습니다.<br />
                      {conflictingSchedules.length > 0 ? (
                        <>
                          AI가 자동으로 충돌 원인과 조정 방안을 분석하여 아래와 같이 제안합니다.<br />
                          각 일정의 우선순위, 시간대, 참여자 정보를 종합적으로 고려하였으며,<br />
                          최적의 일정 배치를 위해 일부 일정의 시간이 자동으로 조정될 수 있습니다.<br />
                          조정 결과를 확인하고 필요시 직접 수정하실 수 있습니다.
                        </>
                      ) : (
                        <>
                          현재 2주간 일정에서 충돌이 발견되지 않았습니다.<br />
                          모든 일정이 원활하게 배치되어 있어 추가 조정이 필요하지 않습니다.<br />
                          새로운 일정을 추가하실 때는 기존 일정과의 충돌을 자동으로 검사합니다.
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* 하단: 2주치 시간표 캘린더 (한 줄에 한 주씩) */}
          <div className="card min-h-[200px] p-6">
            <div className="mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary-500" />
              <span className="font-semibold text-secondary-900">2주간 시간표</span>
            </div>
            <div className="overflow-x-auto space-y-8">
              {[week1, week2].map((week, wIdx) => (
                <div key={wIdx}>
                  <div className="mb-1 flex">
                    <div className="w-14" />
                    {week.map((d, idx) => {
                      const isToday = d.toDateString() === todayDate.toDateString();
                      return (
                        <div
                          key={idx}
                          className={`flex-1 flex flex-col items-center justify-center px-1 py-1 border rounded-lg mx-0.5
                            ${wIdx === 0 ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}
                            ${isToday ? 'bg-primary-100 border-primary-300 text-primary-700 shadow font-bold' : ''}
                          `}
                          style={{ minWidth: 0 }}
                        >
                          <span className="flex items-center gap-1">
                            <span className="text-base font-semibold leading-tight">{d.getMonth() + 1}/{d.getDate()}</span>
                            <span className="text-[11px] text-slate-400">{dayNames[d.getDay()]}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="relative">
                    {hours.map(hour => (
                      <div key={hour} className="flex border-b last:border-b-0">
                        <div className="w-14 text-xs font-semibold text-slate-500 py-1 text-right pr-2 bg-slate-50">{hour}:00</div>
                        {week.map((_, idx) => (
                          <div key={idx} className="flex-1 border-l min-w-[60px] h-8 bg-white relative"></div>
                        ))}
                      </div>
                    ))}
                    
                    {/* 일정 오버레이 */}
                    {twoWeekSchedules.map(schedule => {
                      const position = getSchedulePosition(schedule, week, wIdx);
                      if (!position) return null;
                      
                      const { dayIndex, startPosition, duration } = position;
                      
                      // 더 정확한 위치 계산 (시간표 셀에 맞춤)
                      const cellWidth = `calc((100% - 56px) / 7)`; // 56px은 시간 라벨 영역
                      const leftOffset = `calc(56px + ${cellWidth} * ${dayIndex} + 2px)`; // 2px 패딩
                      const width = `calc(${cellWidth} - 4px)`; // 4px 마진
                      const topOffset = startPosition * 32 + 2; // 각 시간당 32px (h-8) + 2px 패딩
                      const height = Math.max(duration * 32 - 4, 24); // 4px 마진, 최소 24px
                      
                      return (
                        <div
                          key={schedule.id}
                          className={getScheduleCardStyle(schedule, position)}
                          style={{
                            position: 'absolute',
                            left: leftOffset,
                            width: width,
                            top: `${topOffset}px`,
                            height: `${height}px`,
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            lineHeight: '11px',
                            padding: '2px',
                            boxSizing: 'border-box'
                          }}
                          onClick={() => router.push(`/schedules/create?mode=edit&id=${schedule.id}&type=${schedule.type}`)}
                          title={`${schedule.title} (${schedule.type})\n${new Date(schedule.startTime).toLocaleString('ko-KR')} ~ ${new Date(schedule.endTime).toLocaleString('ko-KR')}\n${schedule.description || ''}`}
                        >
                          <div className="text-center w-full">
                            <div className="font-medium truncate leading-tight">{schedule.title}</div>
                            {height > 30 && (
                              <div className="text-[8px] opacity-75 mt-0.5">
                                {new Date(schedule.startTime).toLocaleTimeString('ko-KR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 