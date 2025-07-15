'use client';

import React, { useState, useEffect, Fragment, useRef } from 'react';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';

// 일정 데이터 타입 (공통 Schedule)
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
  endDate?: string; // 실제 데이터에 있는 필드
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

// 일정 fetch 및 변환 함수
const API_BASE_URL = '';
const fetchAllSchedules = async (): Promise<{personal: PersonalSchedule[], department: DepartmentSchedule[], project: ProjectSchedule[], company: CompanySchedule[]}> => {
  const response = await fetch(`/api/schedules/all`);
  if (!response.ok) {
    throw new Error('전체 일정을 가져오는데 실패했습니다.');
  }
  const result = await response.json();
  console.log('API 응답 전체:', result.data);
  console.log('회사 일정 company:', result.data.company);
  return result.data;
};
const transformPersonalSchedule = (schedule: PersonalSchedule): Schedule => {
  let startTime, endTime;
  if (schedule.date && schedule.time) {
    startTime = new Date(`${schedule.date}T${schedule.time}`);
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
  // 실제 Firestore 데이터 구조에 맞게 매핑
  let endTime: Date;
  let startTime: Date;
  
  // endDate 필드 사용 (실제 데이터에는 endDate가 있음)
  if (schedule.endDate) {
    endTime = new Date(schedule.endDate);
    console.log('프로젝트 endDate 변환:', schedule.endDate, '→', endTime);
  } else if (schedule.project_end_date) {
    endTime = new Date(schedule.project_end_date);
  } else {
    endTime = new Date();
  }
  
  // 종료일을 포함한 기간으로 표시하기 위해 종료일의 마지막 시간(23:59:59)으로 설정
  endTime.setHours(23, 59, 59, 999);
  
  // startDate가 없으므로 endDate에서 1일을 빼서 시작일로 설정
  if (schedule.project_start_date) {
    startTime = new Date(schedule.project_start_date);
  } else {
    startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // 1일 전
  }
  
  if (isNaN(startTime.getTime())) startTime = new Date();
  if (isNaN(endTime.getTime())) endTime = new Date();
  
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

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 일정 타입별 색상 매핑 (일정관리 페이지와 동일)
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

// 6x7 달력 매트릭스(이전/다음 달 날짜 포함)
function getMonthMatrix(year: number, month: number) {
  // month: 0-indexed
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevMonthLastDay = new Date(year, month, 0);
  const matrix: {
    date: Date;
    isCurrentMonth: boolean;
    isPrevMonth: boolean;
    isNextMonth: boolean;
  }[][] = [];
  let week: any[] = [];
  let dayOfWeek = firstDay.getDay();
  // 앞 빈칸: 이전 달 날짜
  for (let i = 0; i < dayOfWeek; i++) {
    week.push({
      date: new Date(year, month - 1, prevMonthLastDay.getDate() - dayOfWeek + i + 1),
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false,
    });
  }
  // 이번달 날짜
  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false,
    });
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  // 뒷 빈칸: 다음 달 날짜
  let nextMonthDay = 1;
  if (week.length > 0) {
    while (week.length < 7) {
      week.push({
        date: new Date(year, month + 1, nextMonthDay++),
        isCurrentMonth: false,
        isPrevMonth: false,
        isNextMonth: true,
      });
    }
    matrix.push(week);
  }
  // 마지막 행이 모두 다음 달 날짜(isNextMonth)라면 제거
  while (
    matrix.length > 5 &&
    matrix[matrix.length - 1].every(cell => cell.isNextMonth)
  ) {
    matrix.pop();
  }
  return matrix.flat();
}

const SCHEDULE_TYPE_LABELS = {
  personal: '개인',
  department: '부서',
  company: '회사',
  project: '프로젝트',
};

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 오늘 날짜 및 현재 월 상태
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  const router = useRouter();

  // 모달 상태: 선택된 날짜와 일정
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [modalSchedules, setModalSchedules] = useState<Schedule[]>([]);

  // 날짜 팝업 상태
  const [popup, setPopup] = useState<{
    open: boolean;
    date: Date | null;
    anchor: { top: number; left: number; width: number; height: number } | null;
    schedules: Schedule[];
  }>({ open: false, date: null, anchor: null, schedules: [] });
  const popupRef = useRef<HTMLDivElement>(null);

  // 삭제 확인 모달 상태 추가
  const [deleteConfirm, setDeleteConfirm] = useState<{open: boolean; schedule: Schedule | null}>({open: false, schedule: null});

  // 팝업 내 일정 리스트 상태 및 수정 중인 일정 id 상태 추가
  const [popupSchedules, setPopupSchedules] = useState<Schedule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{title: string; startTime: string; endTime: string; description?: string}>({title: '', startTime: '', endTime: '', description: ''});

  const [selectedTypes, setSelectedTypes] = useState(['personal', 'department', 'company', 'project']);

  // 일정 타입 필터 토글 함수
  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // 외부 클릭 시 팝업 닫기
  useEffect(() => {
    if (!popup.open) return;
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup({ open: false, date: null, anchor: null, schedules: [] });
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [popup.open]);

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        const allSchedules = await fetchAllSchedules();
        const transformed = transformAllSchedules(allSchedules);
        console.log('transformAllSchedules 결과:', transformed);
        setSchedules(transformed);
      } catch (error) {
        setError(error instanceof Error ? error.message : '일정을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadSchedules();
  }, []);

  // 월 이동/오늘 이동
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(y => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(y => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };
  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // 달력 데이터 생성
  const monthMatrix = getMonthMatrix(currentYear, currentMonth);

  // 일정 필터링 적용 (날짜별 일정 반환)
  function getSchedulesForDate(date: Date) {
    return schedules.filter(sch => {
      const d = new Date(sch.startTime);
      return d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate() &&
        selectedTypes.includes(sch.type);
    });
  }

  // 오늘 날짜 판별
  function isTodayCell(date: Date) {
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  // 모달 오픈 핸들러
  const openScheduleModal = (date: Date, schedules: Schedule[]) => {
    setModalDate(date);
    setModalSchedules(schedules);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalDate(null);
    setModalSchedules([]);
  };

  // 팝업 열릴 때마다 일정 리스트 상태 초기화
  useEffect(() => {
    if (popup.open) {
      setPopupSchedules(popup.schedules);
      setEditingId(null);
    }
  }, [popup.open, popup.schedules]);

  // 일정 수정 API
  const updateSchedule = async (sch: Schedule, data: any) => {
    const url = `${API_BASE_URL}/api/schedules/${sch.type}/${sch.id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('일정 수정에 실패했습니다.');
    return (await response.json()).data;
  };
  // 일정 삭제 API
  const deleteSchedule = async (sch: Schedule) => {
    const url = `${API_BASE_URL}/api/schedules/${sch.type}/${sch.id}`;
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) throw new Error('일정 삭제에 실패했습니다.');
  };

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
        <div className="min-w-[1300px] max-w-[1600px] w-full rounded-lg shadow p-8 flex flex-col items-center justify-start overflow-hidden" style={{ height: 1000 }}>
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
            className="grid grid-cols-7 h-full w-full rounded-b-xl overflow-hidden"
            style={{ gridTemplateRows: `repeat(${monthMatrix.length / 7}, 1fr)`, height: '100%' }}
          >
            {monthMatrix.map((cell, idx) => {
              const schedulesForDate = cell.isCurrentMonth ? getSchedulesForDate(cell.date) : [];
              const showMore = schedulesForDate.length > 3;
              // 셀 클릭 핸들러: anchor 위치 계산
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
                  },
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
                  <div className="flex items-center gap-1 flex-shrink-0 mb-0.5">
                    <span className={`inline-block w-6 h-6 text-center leading-6 font-bold text-[15px]
                      ${cell.isCurrentMonth && isTodayCell(cell.date) ? 'bg-blue-500 text-white rounded-full' : cell.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}`}>{cell.date.getDate()}</span>
                  </div>
                  {/* 일정 목록: 셀 높이 고정, 내부 overflow-hidden */}
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
                          setPopup({
                            open: true,
                            date: cell.date,
                            anchor: (e.currentTarget as HTMLButtonElement).getBoundingClientRect(),
                            schedules: schedulesForDate.slice(3), // 4번째 이후 일정만 전달
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
                top: popup.anchor.top + popup.anchor.height + 8 - document.querySelector('.min-h-screen')!.getBoundingClientRect().top,
                left: popup.anchor.left - document.querySelector('.min-h-screen')!.getBoundingClientRect().left,
              }}
            >
              <div className="font-bold text-gray-800 mb-2 text-base">{popup.date?.getFullYear()}년 {popup.date && popup.date.getMonth() + 1}월 {popup.date && popup.date.getDate()}일</div>
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {popupSchedules.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">추가 일정이 없습니다.</div>
                ) : (
                  popupSchedules.map(sch => {
                    const colors = scheduleTypeColors[sch.type] || scheduleTypeColors.personal;
                    return (
                      <div key={sch.id} className={`${colors.bg} rounded px-2 py-1 flex items-center justify-between gap-2`}>
                        <div>
                          <div className={`font-medium ${colors.text} text-sm`}>{sch.title}</div>
                          <div className="text-xs text-gray-500">{sch.startTime.slice(11, 16)} ~ {sch.endTime.slice(11, 16)}</div>
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

      {/* 일정 모달 */}
      {modalOpen && modalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-xs w-full relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl" onClick={closeModal}>&times;</button>
            <div className="mb-3">
              <div className="text-lg font-bold text-gray-800 mb-1">{modalDate.getFullYear()}년 {modalDate.getMonth() + 1}월 {modalDate.getDate()}일</div>
              <div className="text-sm text-gray-500">{['일','월','화','수','목','금','토'][modalDate.getDay()]}요일</div>
            </div>
            <div className="divide-y divide-gray-200">
              {modalSchedules.map(sch => (
                <div key={sch.id} className="py-2">
                  <div className="font-medium text-gray-800">{sch.title}</div>
                  <div className="text-xs text-gray-500">{sch.startTime.slice(11, 16)} ~ {sch.endTime.slice(11, 16)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteConfirm.open && deleteConfirm.schedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-xs w-full relative">
            <div className="text-lg font-bold text-gray-800 mb-3">일정 삭제</div>
            <div className="mb-4 text-gray-700 text-sm">정말 <span className="font-semibold text-red-600">{deleteConfirm.schedule.title}</span> 일정을 삭제하시겠습니까?</div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => setDeleteConfirm({open: false, schedule: null})}>취소</button>
              <button className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700 font-semibold" onClick={async () => {
                try {
                  await deleteSchedule(deleteConfirm.schedule!);
                  setPopupSchedules(prev => prev.filter(s => s.id !== deleteConfirm.schedule!.id));
                  setDeleteConfirm({open: false, schedule: null});
                } catch (err) {
                  alert('삭제에 실패했습니다.');
                }
              }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 