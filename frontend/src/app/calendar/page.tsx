'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import CalendarHeader from '@/components/CalendarHeader';
import CalendarSidebar from '@/components/CalendarSidebar';
import { useRouter } from 'next/navigation';

// 일정 데이터 타입
interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  priority: 'high' | 'medium' | 'low';
  type: 'personal' | 'department' | 'project' | 'company';
  assignee?: string;
  project?: string;
  status: 'completed' | 'pending' | 'overdue';
}

// 백엔드 원본 타입들
interface PersonalSchedule {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: string;
  [key: string]: any;
}

interface DepartmentSchedule {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: string;
  assignee: string;
  department_name: string;
  [key: string]: any;
}

interface ProjectSchedule {
  id: string;
  project_name: string;
  project_description: string;
  project_start_date: string;
  project_end_date: string;
  endDate?: string;
  status: string;
  [key: string]: any;
}

interface CompanySchedule {
  schedule_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  organizer: string;
  status: string;
  [key: string]: any;
}

// 일정 변환 함수들
const transformPersonalSchedule = (schedule: PersonalSchedule): Schedule => {
  let startTime, endTime;
  if (schedule.date && schedule.time) {
    startTime = new Date(`${schedule.date}T${schedule.time}`);
    if (isNaN(startTime.getTime())) {
      console.warn('유효하지 않은 개인 일정 날짜/시간:', schedule.date, schedule.time);
      startTime = new Date();
    }
    endTime = new Date(startTime.getTime() + (schedule.durationMinutes || 60) * 60 * 1000);
  } else {
    startTime = new Date();
    endTime = new Date();
  }
  return {
    id: schedule.id,
    title: schedule.title || '제목 없음',
    description: schedule.description,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    priority: 'medium',
    type: 'personal',
    assignee: '개인',
    project: '개인 일정',
    status: schedule.status === '완료' ? 'completed' : 'pending'
  };
};

const transformDepartmentSchedule = (schedule: DepartmentSchedule): Schedule => {
  let startTime, endTime;
  if (schedule.date && schedule.time) {
    startTime = new Date(`${schedule.date}T${schedule.time}`);
    if (isNaN(startTime.getTime())) {
      console.warn('유효하지 않은 부서 일정 날짜/시간:', schedule.date, schedule.time);
      startTime = new Date();
    }
    endTime = new Date(startTime.getTime() + (schedule.durationMinutes || 60) * 60 * 1000);
  } else {
    startTime = new Date();
    endTime = new Date();
  }
  return {
    id: schedule.id,
    title: schedule.title || '제목 없음',
    description: schedule.description,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    priority: 'medium',
    type: 'department',
    assignee: schedule.assignee,
    project: schedule.department_name,
    status: schedule.status === '완료' ? 'completed' : 'pending'
  };
};

const transformProjectSchedule = (schedule: ProjectSchedule): Schedule => {
  let endTime: Date;
  let startTime: Date;
  
  // endDate를 우선적으로 사용하고, 없으면 project_end_date 사용
  if (schedule.endDate) {
    endTime = new Date(schedule.endDate);
    // 유효하지 않은 날짜인지 확인
    if (isNaN(endTime.getTime())) {
      console.warn('유효하지 않은 endDate:', schedule.endDate);
      endTime = new Date();
    }
  } else if (schedule.project_end_date) {
    endTime = new Date(schedule.project_end_date);
    // 유효하지 않은 날짜인지 확인
    if (isNaN(endTime.getTime())) {
      console.warn('유효하지 않은 project_end_date:', schedule.project_end_date);
      endTime = new Date();
    }
  } else {
    endTime = new Date();
  }
  
  // 종료일을 해당 날짜의 마지막 시간(23:59:59)으로 설정
  endTime.setHours(23, 59, 59, 999);
  
  // 시작일 설정: project_start_date가 있으면 사용, 없으면 종료일과 동일하게 설정
  if (schedule.project_start_date) {
    startTime = new Date(schedule.project_start_date);
    // 유효하지 않은 날짜인지 확인
    if (isNaN(startTime.getTime())) {
      console.warn('유효하지 않은 project_start_date:', schedule.project_start_date);
      startTime = new Date(endTime);
      startTime.setHours(0, 0, 0, 0);
    } else {
      startTime.setHours(0, 0, 0, 0); // 시작일은 해당 날짜의 시작 시간으로 설정
    }
  } else {
    // 시작일이 없으면 종료일과 동일한 날짜로 설정 (하루 일정)
    startTime = new Date(endTime);
    startTime.setHours(0, 0, 0, 0);
  }
  

  
  return {
    id: schedule.id,
    title: schedule.project_name || '제목 없음',
    description: schedule.project_description,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    priority: 'high',
    type: 'project',
    assignee: 'PM',
    project: schedule.project_name,
    status: schedule.status === '완료' ? 'completed' : 'pending'
  };
};

const transformCompanySchedule = (schedule: CompanySchedule): Schedule => ({
  id: schedule.schedule_id,
  title: schedule.title || '제목 없음',
  description: schedule.description,
  startTime: schedule.start_time,
  endTime: schedule.end_time,
  priority: 'high',
  type: 'company',
  assignee: schedule.organizer,
  project: '전사 일정',
  status: schedule.status === '완료' ? 'completed' : 'pending'
});

const transformAllSchedules = (allSchedules: {personal: PersonalSchedule[], department: DepartmentSchedule[], project: ProjectSchedule[], company: CompanySchedule[]}): Schedule[] => {
  const p = allSchedules.personal?.map(transformPersonalSchedule) || [];
  const d = allSchedules.department?.map(transformDepartmentSchedule) || [];
  const r = allSchedules.project?.map(transformProjectSchedule) || [];
  const c = allSchedules.company?.map(transformCompanySchedule) || [];
  return [...p, ...d, ...r, ...c].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
};

// 일정 타입별 색상 매핑
const scheduleTypeColors = {
  personal: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  department: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  company: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200'
  },
  project: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200'
  }
};

const SCHEDULE_TYPE_LABELS = {
  personal: '개인',
  department: '부서',
  company: '회사',
  project: '프로젝트'
};

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const matrix = [];
  const currentDate = new Date(startDate);
  
  // 해당 월의 마지막 날짜까지 또는 다음 달의 첫 주가 끝날 때까지
  while (currentDate <= lastDay || currentDate.getDay() !== 0) {
    matrix.push({
      date: new Date(currentDate),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: currentDate.toDateString() === new Date().toDateString()
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return matrix;
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<Array<'personal' | 'department' | 'company' | 'project'>>(['personal', 'department', 'company', 'project']);
  const [popup, setPopup] = useState<{
    open: boolean;
    date: Date | null;
    anchor: DOMRect | null;
    schedules: Schedule[];
  }>({ open: false, date: null, anchor: null, schedules: [] });
  const [deleteConfirm, setDeleteConfirm] = useState<{open: boolean; schedule: Schedule | null}>({open: false, schedule: null});
  const popupRef = useRef<HTMLDivElement>(null);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type as any) 
        ? prev.filter(t => t !== type)
        : [...prev, type as any]
    );
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup({ open: false, date: null, anchor: null, schedules: [] });
      }
    }

    const loadSchedules = async () => {
      try {
        const response = await fetch(`/api/schedules/all`);
        if (!response.ok) {
          throw new Error('전체 일정을 가져오는데 실패했습니다.');
        }
        const result = await response.json();
        const transformedSchedules = transformAllSchedules(result.data);
        setSchedules(transformedSchedules);
      } catch (error) {
        console.error('일정 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const goToPrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(prevYear => prevYear - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(prevYear => prevYear + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  function getSchedulesForDate(date: Date) {
    return schedules.filter(sch => {
      const schStart = new Date(sch.startTime);
      const schEnd = new Date(sch.endTime);
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
      

      
      // 일정이 해당 날짜에 겹치는지 확인
      // 시작일이 다음날보다 이전이고, 종료일이 해당 날짜보다 이후이거나 같으면 표시
      return schStart < nextDate && schEnd >= targetDate && selectedTypes.includes(sch.type);
    });
  }

  function isTodayCell(date: Date) {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }

  const deleteSchedule = async (sch: Schedule) => {
    const url = `/api/schedules/${sch.type}/${sch.id}`;
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) throw new Error('일정 삭제에 실패했습니다.');
  };

  const monthMatrix = getMonthMatrix(currentYear, currentMonth);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-row">
        <div className="w-64 bg-white min-h-screen flex flex-col">
          <Navigation />
        </div>
        <div className="flex-1 min-h-screen flex items-center justify-center bg-white">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-row">
      <div className="w-64 bg-white min-h-screen flex flex-col">
        <Navigation />
      </div>
      <div className="flex-1 min-h-screen flex items-center justify-center bg-white">
        <div 
          className="min-w-[1300px] max-w-[1600px] w-full rounded-lg shadow p-8 flex flex-col items-center justify-start overflow-hidden"
          style={{
            minHeight: `${200 + Math.max(5, monthMatrix.length / 7) * 120}px`,
            maxHeight: `${200 + Math.max(5, monthMatrix.length / 7) * 140}px`
          }}
        >
          {/* 상단 툴바 */}
          <div className="w-full flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button onClick={goToToday} className="bg-primary-600 text-white rounded px-3 py-1 font-bold shadow hover:bg-primary-700 transition">오늘</button>
              <button onClick={goToPrevMonth} className="rounded p-1 hover:bg-gray-100">&lt;</button>
              <button onClick={goToNextMonth} className="rounded p-1 hover:bg-gray-100">&gt;</button>
              <span className="ml-4 text-xl font-bold text-gray-800">{currentYear}년 {currentMonth + 1}월</span>
            </div>
            <div className="flex items-center gap-2">
              {(['personal','department','company','project'] as const).map(type => {
                const colors = scheduleTypeColors[type];
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1 rounded font-semibold border transition text-sm
                      ${selectedTypes.includes(type) ? `${colors.bg} ${colors.text} border-2 ${colors.border}` : 'bg-white text-gray-400 border-gray-200'}
                    `}
                  >
                    {SCHEDULE_TYPE_LABELS[type]}
                  </button>
                );
              })}
              <button onClick={() => router.push('/schedules/create')} className="bg-blue-600 text-white rounded px-4 py-2 font-bold shadow hover:bg-blue-700 transition ml-2">+ 새 일정</button>
            </div>
          </div>



          {/* 달력 그리드 */}
          <div
            className="grid grid-cols-7 w-full rounded-b-xl overflow-hidden"
            style={{ 
              gridTemplateRows: `repeat(${monthMatrix.length / 7}, minmax(120px, 1fr))`,
              minHeight: `${Math.max(5, monthMatrix.length / 7) * 120}px`,
              maxHeight: `${Math.max(5, monthMatrix.length / 7) * 140}px`
            }}
          >
            {monthMatrix.map((cell, idx) => {
              const schedulesForDate = cell.isCurrentMonth ? getSchedulesForDate(cell.date) : [];
              const showMore = schedulesForDate.length > 3;
              
              const handleCellClick = (e: React.MouseEvent) => {
                if (!cell.isCurrentMonth) return;
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                setPopup({
                  open: true,
                  date: cell.date,
                  anchor: {
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height,
                  } as DOMRect,
                  schedules: schedulesForDate,
                });
              };

              return (
                <div
                  key={idx}
                  className={`border border-gray-100 flex flex-col h-full p-1 relative
                    ${cell.isCurrentMonth ? '' : 'bg-gray-50'}
                    ${cell.isCurrentMonth ? '' : 'text-gray-400'}
                    ${cell.isCurrentMonth && isTodayCell(cell.date) ? 'z-10' : ''}`}
                  style={{overflow: 'hidden', cursor: cell.isCurrentMonth ? 'pointer' : 'default'}}
                  onClick={handleCellClick}
                >
                  {/* 날짜 숫자 및 오늘 하이라이트 */}
                  <div className="flex items-center justify-between flex-shrink-0 mb-0.5">
                    <span className={`inline-block w-6 h-6 text-center leading-6 font-bold text-[15px]
                      ${cell.isCurrentMonth && isTodayCell(cell.date) ? 'bg-blue-500 text-white rounded-full' : cell.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}`}>
                      {cell.date.getDate()}
                    </span>
                    {cell.isCurrentMonth && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        {['일', '월', '화', '수', '목', '금', '토'][cell.date.getDay()]}
                      </span>
                    )}
                  </div>
                  
                  {/* 일정 목록 */}
                  <div className="overflow-hidden flex flex-col gap-[2px]">
                    {cell.isCurrentMonth && schedulesForDate.slice(0, 3).map(sch => {
                      const colors = scheduleTypeColors[sch.type] || scheduleTypeColors.personal;
                      return (
                        <div 
                          key={sch.id} 
                          className={`truncate ${colors.bg} ${colors.text} text-[11px] font-medium rounded px-1 py-0.5 cursor-pointer hover:opacity-80 transition-opacity`} 
                          style={{marginTop: '1px', marginBottom: '1px', lineHeight: '1.2'}}
                        >
                          {sch.title}
                        </div>
                      );
                    })}
                    
                    {/* +N 버튼 */}
                    {cell.isCurrentMonth && showMore && (
                      <button
                        className="text-[11px] text-blue-600 font-semibold hover:underline focus:outline-none mt-0.5"
                        onClick={e => {
                          e.stopPropagation();
                          const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                          setPopup({
                            open: true,
                            date: cell.date,
                            anchor: rect,
                            schedules: schedulesForDate.slice(3),
                          });
                        }}
                        style={{lineHeight: '1.2'}}
                      >
                        +{schedulesForDate.length - 3}개 일정 더보기
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 날짜 팝업 카드 */}
          {popup.open && popup.anchor && (
            <div
              ref={popupRef}
              className="absolute z-50 bg-white rounded-xl shadow-lg p-4 min-w-[220px] max-w-xs border border-gray-200"
              style={{
                top: popup.anchor.top + popup.anchor.height + 8,
                left: popup.anchor.left,
              }}
            >
              <div className="font-bold text-gray-800 mb-2 text-base">
                {popup.date?.getFullYear()}년 {popup.date && popup.date.getMonth() + 1}월 {popup.date && popup.date.getDate()}일
              </div>
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {popup.schedules.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">추가 일정이 없습니다.</div>
                ) : (
                  popup.schedules.map(sch => {
                    const colors = scheduleTypeColors[sch.type] || scheduleTypeColors.personal;
                    return (
                      <div key={sch.id} className={`${colors.bg} rounded px-2 py-1 flex items-center justify-between gap-2`}>
                        <div>
                          <div className={`font-medium ${colors.text} text-sm`}>{sch.title}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(sch.startTime).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })} ~ {new Date(sch.endTime).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {sch.type === 'company' ? (
                            <button
                              className="text-xs text-gray-400 bg-gray-100 cursor-not-allowed px-1 py-0.5 rounded"
                              title="회사 일정은 수정할 수 없습니다. 구글 캘린더에서 직접 수정하세요."
                              disabled
                            >수정불가</button>
                          ) : (
                            <button
                              className="text-xs text-blue-600 hover:underline px-1 py-0.5"
                              onClick={() => router.push(`/schedules/create?mode=edit&id=${sch.id}&type=${sch.type}`)}
                              title="수정"
                            >수정</button>
                          )}
                          <button
                            className="text-xs text-red-500 hover:underline px-1 py-0.5"
                            onClick={() => setDeleteConfirm({open: true, schedule: sch})}
                            title="삭제"
                          >삭제</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteConfirm.open && deleteConfirm.schedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-xs w-full relative">
            <div className="text-lg font-bold text-gray-800 mb-3">일정 삭제</div>
            <div className="mb-4 text-gray-700 text-sm">
              정말 <span className="font-semibold text-red-600">{deleteConfirm.schedule.title}</span> 일정을 삭제하시겠습니까?
            </div>
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" 
                onClick={() => setDeleteConfirm({open: false, schedule: null})}
              >
                취소
              </button>
              <button 
                className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700 font-semibold" 
                onClick={async () => {
                  try {
                    await deleteSchedule(deleteConfirm.schedule!);
                    setSchedules(prev => prev.filter(s => s.id !== deleteConfirm.schedule!.id));
                    setPopup(prev => ({ ...prev, schedules: prev.schedules.filter(s => s.id !== deleteConfirm.schedule!.id) }));
                    setDeleteConfirm({open: false, schedule: null});
                  } catch (err) {
                    alert('삭제에 실패했습니다.');
                  }
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 