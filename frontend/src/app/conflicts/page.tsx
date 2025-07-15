'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { CalendarIcon, ExclamationTriangleIcon, ArrowRightIcon, PencilSquareIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { analyzeScheduleConflicts, testOpenAIConnection } from '@/app/ai-structure/actions';

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

// 일정 시간 업데이트 API 함수들
const updatePersonalScheduleTime = async (id: string, newDate: string, newTime: string) => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/personal/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: newDate, time: newTime })
  });
  if (!response.ok) throw new Error('개인 일정 업데이트 실패');
  return response.json();
};

const updateDepartmentScheduleTime = async (id: string, newDate: string, newTime: string) => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/department/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: newDate, time: newTime })
  });
  if (!response.ok) throw new Error('부서 일정 업데이트 실패');
  return response.json();
};

const updateProjectScheduleTime = async (id: string, newDate: string, newTime: string) => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/project/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endDate: newDate, time: newTime })
  });
  if (!response.ok) throw new Error('프로젝트 일정 업데이트 실패');
  return response.json();
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
  id?: string;
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
  id?: string;
  title: string;
  objective: string;
  date: string;
  time: string;
  participants: string[];
  status?: string;
}

interface ProjectSchedule {
  id?: string;
  projectName: string;
  objective: string;
  category: string;
  endDate: string;
  time: string;
  roles: any;
  status?: string;
}

// 데이터 변환 함수들
const transformPersonalSchedule = (personalSchedule: PersonalSchedule): Schedule | null => {
  if (!personalSchedule.date || !personalSchedule.time) return null;
  const startDateTime = `${personalSchedule.date}T${personalSchedule.time}:00`;
  const start = new Date(startDateTime);
  if (isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + (personalSchedule.durationMinutes || 60) * 60000);
  if (isNaN(end.getTime())) return null;
  return {
    id: personalSchedule.id || '',
    title: personalSchedule.title,
    description: personalSchedule.description,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    priority: personalSchedule.importance === '높음' ? 'high' : personalSchedule.importance === '보통' ? 'medium' : 'low',
    type: 'personal',
    status: personalSchedule.status as any || 'pending'
  };
};

const transformDepartmentSchedule = (departmentSchedule: DepartmentSchedule): Schedule | null => {
  if (!departmentSchedule.date || !departmentSchedule.time) return null;
  const startDateTime = `${departmentSchedule.date}T${departmentSchedule.time}:00`;
  const start = new Date(startDateTime);
  if (isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + 60 * 60000);
  if (isNaN(end.getTime())) return null;
  return {
    id: departmentSchedule.id || '',
    title: departmentSchedule.title,
    description: departmentSchedule.objective,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    priority: 'medium',
    type: 'department',
    status: departmentSchedule.status as any || 'pending'
  };
};

const transformProjectSchedule = (projectSchedule: ProjectSchedule): Schedule | null => {
  if (!projectSchedule.endDate || !projectSchedule.time) return null;
  const endDateTime = `${projectSchedule.endDate}T${projectSchedule.time}:00`;
  const end = new Date(endDateTime);
  if (isNaN(end.getTime())) return null;
  const start = new Date(end.getTime() - 60 * 60000);
  if (isNaN(start.getTime())) return null;
  return {
    id: projectSchedule.id || '',
    title: projectSchedule.projectName,
    description: projectSchedule.objective,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    priority: 'high',
    type: 'project',
    status: projectSchedule.status as any || 'pending'
  };
};

const transformAllSchedules = (allSchedules: {personal: PersonalSchedule[], department: DepartmentSchedule[], project: ProjectSchedule[]}): Schedule[] => {
  const p = allSchedules.personal?.map(transformPersonalSchedule).filter(Boolean) as Schedule[] || [];
  const d = allSchedules.department?.map(transformDepartmentSchedule).filter(Boolean) as Schedule[] || [];
  const r = allSchedules.project?.map(transformProjectSchedule).filter(Boolean) as Schedule[] || [];
  return [...p, ...d, ...r];
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

const CELL_HEIGHT = 48; // 1시간 셀의 실제 px 높이 (h-12)

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

// 일정 카드 스타일링 함수 (컴포넌트들보다 먼저 정의)
const getScheduleCardStyle = (schedule: Schedule, position: any) => {
  const typeColors = {
    personal: 'bg-blue-500 text-white',
    department: 'bg-green-500 text-white', 
    project: 'bg-orange-500 text-white'
  };
  
  let conflictStyle = '';
  if (position?.hasConflict) {
    conflictStyle = 'ring-2 ring-red-400 shadow-red-200';
  }
  
  return `${typeColors[schedule.type]} ${conflictStyle} border rounded px-1 py-0.5 text-xs font-medium truncate cursor-pointer hover:opacity-80 transition-opacity`;
};

// 드래그 가능한 일정 카드 컴포넌트
interface DraggableScheduleCardProps {
  schedule: Schedule;
  position: any;
  onEdit: (schedule: Schedule) => void;
}

function DraggableScheduleCard({ schedule, position, onEdit }: DraggableScheduleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: schedule.id,
    data: {
      type: 'schedule',
      schedule: schedule,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 20 : 10,
  } : {};

  const startTime = new Date(schedule.startTime);
  const endTime = new Date(schedule.endTime);
  const startHour = startTime.getHours();

  if (startHour < 9 || startHour >= 19) return null;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...(position?.style || {}) }}
      {...listeners}
      {...attributes}
      className={`${getScheduleCardStyle(schedule, position)} cursor-move hover:shadow-lg transition-shadow`}
      onDoubleClick={() => onEdit(schedule)}
      title={`${schedule.title} (${schedule.type})\n${new Date(schedule.startTime).toLocaleString('ko-KR')} ~ ${new Date(schedule.endTime).toLocaleString('ko-KR')}\n${schedule.description || ''}`}
    >
      <div className="text-center w-full pointer-events-none">
        <div className="font-semibold text-[13px] truncate leading-tight">{schedule.title}</div>
        <div className="text-[11px] opacity-80 mt-0.5">
          {new Date(schedule.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

// 드롭 가능한 시간대 셀 컴포넌트
interface DroppableTimeCellProps {
  weekIndex: number;
  dayIndex: number;
  hour: number;
  date: Date;
}

function DroppableTimeCell({ weekIndex, dayIndex, hour, date }: DroppableTimeCellProps) {
  const droppableId = `${weekIndex}-${dayIndex}-${hour}`;
  const cellDateTime = new Date(date);
  cellDateTime.setHours(hour, 0, 0, 0);
  const now = new Date();
  const isPast = cellDateTime < now;

  // 과거 셀은 droppable 비활성화
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    disabled: isPast,
    data: {
      type: 'timeslot',
      weekIndex,
      dayIndex,
      hour,
      date,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 border-l min-w-[60px] h-12 relative transition-colors
        ${isPast ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white'}
        ${isOver && !isPast ? 'bg-blue-100 border-blue-300' : ''}
      `}
    >
      {/* 드롭 하이라이트도 isPast가 아니어야만 표시 */}
      {isOver && !isPast && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 flex items-center justify-center">
          <span className="text-xs text-blue-600 font-medium">여기에 드롭</span>
        </div>
      )}
    </div>
  );
}

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
      if (aStart < bEnd && bStart < aEnd) {
        if (!conflicts.find(s => s.id === a.id)) conflicts.push(a);
        if (!conflicts.find(s => s.id === b.id)) conflicts.push(b);
      }
    }
  }
  return conflicts;
};

function getConflictGroups(schedules: Schedule[]): Schedule[][] {
  const groups: Schedule[][] = [];
  const visited = new Set<string>();
  for (let i = 0; i < schedules.length; i++) {
    if (visited.has(schedules[i].id)) continue;
    const group = [schedules[i]];
    visited.add(schedules[i].id);
    for (let j = i + 1; j < schedules.length; j++) {
      if (visited.has(schedules[j].id)) continue;
      const aStart = new Date(schedules[i].startTime);
      const aEnd = new Date(schedules[i].endTime);
      const bStart = new Date(schedules[j].startTime);
      const bEnd = new Date(schedules[j].endTime);
      if (aStart < bEnd && bStart < aEnd) {
        group.push(schedules[j]);
        visited.add(schedules[j].id);
      }
    }
    if (group.length > 1) {
      groups.push(group);
    }
  }
  return groups;
}

export default function ConflictsPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const weeks = renderCalendar(year, month);
  const router = useRouter();
  
  // 상태 관리
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // AI 분석 상태
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [parsedAnalysisData, setParsedAnalysisData] = useState<any>(null);
  const [isApplyingAdjustment, setIsApplyingAdjustment] = useState(false);
  // 자동 분석 제어 상태
  const [autoAnalyzed, setAutoAnalyzed] = useState(false);
  const [lastAnalyzedGroup, setLastAnalyzedGroup] = useState<number | null>(null);
  
  // Drag & Drop 상태
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Drag & Drop 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 데이터 로드
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const updatedSchedules = await fetchAllSchedules();
        const transformedSchedules = transformAllSchedules(updatedSchedules);
        setAllSchedules(transformedSchedules);
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

  // 2주간 표시 범위의 일정들만 필터링
  const twoWeekSchedules = allSchedules.filter(schedule => {
    const scheduleDate = new Date(schedule.startTime);
    const startOfRange = new Date(week1Start);
    const endOfRange = new Date(week2Start);
    endOfRange.setDate(endOfRange.getDate() + 6); // 두 번째 주의 마지막 날
    return scheduleDate >= startOfRange && scheduleDate <= endOfRange;
  });

  // 충돌 검사 및 그룹화
  const conflictingSchedules = findConflicts(twoWeekSchedules);
  const conflictGroups = getConflictGroups(conflictingSchedules);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const topGroup = conflictGroups[selectedGroupIndex];
  const otherGroupsWithIndex = conflictGroups
    .map((group, idx) => ({ group, idx }))
    .filter(({ idx }) => idx !== selectedGroupIndex);

  // 자동 AI 분석 실행 (페이지 진입 시 1회만)
  useEffect(() => {
    if (!loading && conflictingSchedules.length > 0 && !autoAnalyzed) {
      setAutoAnalyzed(true);
      handleAIAnalysis();
    }
  }, [loading, conflictingSchedules.length, autoAnalyzed]);

  // 충돌 그룹 변경 시 자동 AI 분석 (중복 실행 방지)
  useEffect(() => {
    if (
      !loading &&
      conflictingSchedules.length > 0 &&
      selectedGroupIndex !== lastAnalyzedGroup &&
      !isAnalyzing
    ) {
      setLastAnalyzedGroup(selectedGroupIndex);
      handleAIAnalysis();
    }
  }, [selectedGroupIndex, loading, conflictingSchedules.length, lastAnalyzedGroup, isAnalyzing]);

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

  // Drag & Drop 이벤트 핸들러
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const schedule = active.data.current?.schedule;
    if (schedule) {
      setActiveSchedule(schedule);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSchedule(null);
    
    if (!over || !active.data.current?.schedule) return;
    
    const schedule = active.data.current.schedule as Schedule;
    const overData = over.data.current;
    
    if (overData?.type !== 'timeslot') return;
    
    const { date, hour } = overData;
    const newDate = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const newTime = `${hour.toString().padStart(2, '0')}:00`; // HH:00
    
    try {
      setIsUpdating(true);
      
      // 타입별로 다른 API 호출
      if (schedule.type === 'personal') {
        await updatePersonalScheduleTime(schedule.id, newDate, newTime);
      } else if (schedule.type === 'department') {
        await updateDepartmentScheduleTime(schedule.id, newDate, newTime);
      } else if (schedule.type === 'project') {
        await updateProjectScheduleTime(schedule.id, newDate, newTime);
      }
      
      // 일정 목록 새로고침
      const updatedSchedules = await fetchAllSchedules();
      const transformedSchedules = transformAllSchedules(updatedSchedules);
      setAllSchedules(transformedSchedules);
      
      console.log(`일정 "${schedule.title}"이 ${newDate} ${newTime}로 이동되었습니다.`);
      
    } catch (error) {
      console.error('일정 업데이트 실패:', error);
      alert('일정 시간 변경에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 수정 페이지로 이동하는 함수
  const handleEditSchedule = (schedule: Schedule) => {
    router.push(`/schedules/create?mode=edit&id=${schedule.id}&type=${schedule.type}`);
  };

  // AI 분석 함수
  const handleAIAnalysis = async () => {
    if (conflictingSchedules.length === 0) {
      setAiAnalysis('충돌하는 일정이 없어 분석이 필요하지 않습니다.');
      return;
    }

    setIsAnalyzing(true);
    setAiError(null);
    
    try {
      // 선택된 충돌 그룹만 분석 대상으로 전달
      const result = await analyzeScheduleConflicts(conflictingSchedules, allSchedules, selectedGroupIndex);
      if (result.success && result.content) {
        setAiAnalysis(result.content);
        setParsedAnalysisData(result.data); // 분석 결과 데이터 저장
        
        // AI 분석 데이터를 백엔드에 저장
        await saveAIConflictAnalysis(result.data);
      } else {
        setAiError(result.error || 'AI 분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 분석 실패:', error);
      setAiError(error instanceof Error ? error.message : 'AI 분석에 실패했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI 충돌 분석 데이터 저장 함수
  const saveAIConflictAnalysis = async (analysisData: any) => {
    try {
      const requestData = {
        conflict_id: `conflict-group-${selectedGroupIndex}`, // 충돌 그룹 ID
        user_id: 'user01', // 임시 사용자 ID (실제로는 로그인된 사용자 ID 사용)
        request_params: {
          conflictingSchedules: conflictingSchedules.map((s: Schedule) => ({
            id: s.id,
            title: s.title,
            startTime: s.startTime,
            endTime: s.endTime,
            type: s.type
          })),
          selectedGroupIndex,
          analysisResult: analysisData,
          timestamp: new Date().toISOString()
        },
        status: '완료'
      };

      const response = await fetch(`${API_BASE_URL}/api/ai-conflict-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('AI 충돌 분석 데이터 저장에 실패했습니다.');
      }

      const result = await response.json();
      console.log('✅ AI 충돌 분석 데이터 저장 완료:', result.data.request_id);
      return result.data;
    } catch (error) {
      console.error('AI 충돌 분석 데이터 저장 실패:', error);
      // 저장 실패해도 분석 결과는 계속 표시
    }
  };

  // AI 연결 테스트 함수
  const handleAITest = async () => {
    setIsAnalyzing(true);
    setAiError(null);
    
    try {
      const result = await testOpenAIConnection();
      if (result.success && result.content) {
        setAiAnalysis(`✅ AI 연결 테스트 성공!\n\n${result.content}`);
      } else {
        setAiError(result.error || 'AI 연결 테스트에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 테스트 실패:', error);
      setAiError(error instanceof Error ? error.message : 'AI 연결 테스트에 실패했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 조정안 적용 함수
  const handleApplyAdjustment = async (adjustmentIndex: number) => {
    if (!parsedAnalysisData?.조정안?.[adjustmentIndex]) {
      alert('적용할 조정안을 찾을 수 없습니다.');
      return;
    }

    const adjustment = parsedAnalysisData.조정안[adjustmentIndex];
    setIsApplyingAdjustment(true);

    try {
      // 조정안 타입에 따른 처리
      if (adjustment.제안_유형?.includes('시간 변경')) {
        await applyTimeAdjustment(adjustment);
      } else if (adjustment.제안_유형?.includes('담당자 조정')) {
        await applyAssigneeAdjustment(adjustment);
      } else if (adjustment.제안_유형?.includes('일정 분할')) {
        await applySplitAdjustment(adjustment);
      } else {
        alert('지원하지 않는 조정 유형입니다.');
        return;
      }

      // 일정 목록 새로고침
      const updatedSchedules = await fetchAllSchedules();
      const transformedSchedules = transformAllSchedules(updatedSchedules);
      setAllSchedules(transformedSchedules);
      
      // AI 분석 결과 초기화
      setAiAnalysis('');
      setParsedAnalysisData(null);
      
      alert('조정안이 성공적으로 적용되었습니다!');
      
    } catch (error) {
      console.error('조정안 적용 실패:', error);
      alert('조정안 적용에 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setIsApplyingAdjustment(false);
    }
  };

  // 시간 변경 조정안 적용
  const applyTimeAdjustment = async (adjustment: any) => {
    const targetSchedule = allSchedules.find(s => 
      s.id === adjustment.대상_일정 || s.title === adjustment.대상_일정
    );
    
    if (!targetSchedule) {
      throw new Error('대상 일정을 찾을 수 없습니다.');
    }

    // 새로운 시간 추출 (예: "14:00" 또는 "오후 2시")
    const newTimeMatch = adjustment.구체적_조정?.match(/(\d{1,2}):(\d{2})/);
    if (!newTimeMatch) {
      throw new Error('새로운 시간을 파싱할 수 없습니다.');
    }

    const newHour = newTimeMatch[1];
    const newMinute = newTimeMatch[2];
    const newTime = `${newHour.padStart(2, '0')}:${newMinute}`;
    const newDate = new Date(targetSchedule.startTime).toISOString().slice(0, 10);

    // 타입별로 다른 API 호출
    if (targetSchedule.type === 'personal') {
      await updatePersonalScheduleTime(targetSchedule.id, newDate, newTime);
    } else if (targetSchedule.type === 'department') {
      await updateDepartmentScheduleTime(targetSchedule.id, newDate, newTime);
    } else if (targetSchedule.type === 'project') {
      await updateProjectScheduleTime(targetSchedule.id, newDate, newTime);
    }
  };

  // 담당자 조정안 적용 (현재는 기본 구현)
  const applyAssigneeAdjustment = async (adjustment: any) => {
    // TODO: 담당자 변경 API 구현 필요
    console.log('담당자 조정:', adjustment);
    throw new Error('담당자 조정 기능은 아직 구현되지 않았습니다.');
  };

  // 일정 분할 조정안 적용 (현재는 기본 구현)
  const applySplitAdjustment = async (adjustment: any) => {
    // TODO: 일정 분할 API 구현 필요
    console.log('일정 분할:', adjustment);
    throw new Error('일정 분할 기능은 아직 구현되지 않았습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="lg:pl-64">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="p-8">
            <header className="flex items-center pb-6">
              <div className="flex items-end justify-between w-full">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">일정 충돌</h3>
                  <p className="text-gray-500 mb-4">충돌한 일정을 쉽게 관리하세요</p>
                </div>
                <button
                  onClick={() => router.push('/schedules')}
                  className="btn-secondary flex items-center gap-1 px-4 py-2 text-sm"
                >
                  일정관리
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </header>

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
                ) : conflictGroups.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-secondary-500">충돌하는 일정이 없습니다.</div>
                  </div>
                ) : (
                  <>
                    {topGroup && (
                      <div className="p-3 rounded-lg border-2 border-red-400 bg-red-50 mb-4">
                        <div className="font-bold text-red-600 mb-2">충돌 그룹 {selectedGroupIndex + 1}</div>
                        <div className="flex gap-2">
                          {topGroup.map(schedule => (
                            <div key={schedule.id} className="bg-white rounded shadow p-2 flex-1">
                              <div className="font-semibold text-[13px] truncate">{schedule.title}</div>
                              <div className="text-[11px] opacity-80">
                                {new Date(schedule.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                ~
                                {new Date(schedule.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="text-xs text-gray-500 truncate">{schedule.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {otherGroupsWithIndex.length > 0 && (
                      <div className="flex flex-row gap-3 overflow-x-auto pb-2">
                        {otherGroupsWithIndex.map(({ group, idx }) => (
                          <div
                            key={idx}
                            className="min-w-[300px] max-w-[400px] p-1 rounded-lg border-2 border-red-400 bg-red-50 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary-400 transition"
                            onClick={() => setSelectedGroupIndex(idx)}
                          >
                            <div className="font-bold text-red-600 mb-1 text-[15px]">충돌 그룹 {idx + 1}</div>
                            <div className="flex gap-2">
                              {group.map(schedule => (
                                <div key={schedule.id} className="bg-white rounded shadow p-2 flex-1">
                                  <div className="font-semibold text-[13px] truncate">{schedule.title}</div>
                                  <div className="text-[11px] opacity-80">
                                    {new Date(schedule.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                    ~
                                    {new Date(schedule.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">{schedule.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* 상단 우측: AI 분석 결과 메시지 */}
              <div className="card flex flex-col h-[360px] pt-4 pr-4 pl-4 pb-2">
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary-500" />
                    <span className="text-lg font-semibold text-secondary-800">AI 자동 분석 결과</span>
                  </div>
                </div>
                <div className="flex-1 min-h-0 flex flex-col">
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                        <div className="text-secondary-600">AI가 일정을 분석하고 있습니다...</div>
                      </div>
                    </div>
                  ) : aiError ? (
                    <div className="text-red-500 text-sm p-3 bg-red-50 rounded border border-red-200">
                      <strong>오류:</strong> {aiError}
                    </div>
                  ) : aiAnalysis ? (
                    <div className="flex-1 min-h-0 overflow-y-auto bg-blue-50 rounded border border-blue-200 p-3 text-secondary-700 text-sm whitespace-pre-line">
                      {parsedAnalysisData ? (
                        <div className="space-y-6">
                          {/* 충돌 분석 요약 */}
                          {parsedAnalysisData.분석_요약 && (
                            <section className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                              <div className="font-bold text-yellow-700 text-lg flex items-center gap-2">
                                <span role="img" aria-label="분석">🧐</span> 충돌 분석 요약
                              </div>
                              <ul className="mt-2 text-sm text-gray-800">
                                <li>충돌 유형: <b>{parsedAnalysisData.분석_요약.충돌_유형?.join(', ')}</b></li>
                                <li>영향도: <b>{parsedAnalysisData.분석_요약.영향도}</b></li>
                                <li>긴급도: <b>{parsedAnalysisData.분석_요약.긴급도}</b></li>
                              </ul>
                            </section>
                          )}
                          {/* 실무적 조정안 */}
                          {parsedAnalysisData.조정안 && parsedAnalysisData.조정안.length > 0 && (
                            <section className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                              <div className="font-bold text-blue-700 text-lg flex items-center gap-2">
                                <span role="img" aria-label="조정안">💡</span> 실무적 조정안
                              </div>
                              {parsedAnalysisData.조정안.map((adj: any, i: number) => (
                                <div key={i} className="mt-3 p-3 rounded bg-white border border-blue-100">
                                  <div className="font-semibold text-blue-900">조정안 {i+1}: {adj.제안_유형}</div>
                                  <div className="text-sm text-gray-700 mt-1">
                                    <b>대상:</b> {adj.대상_일정}<br/>
                                    <b>조정 내용:</b> {adj.구체적_조정}<br/>
                                    {adj.조정_사유 && (<><b>사유:</b> {adj.조정_사유}<br/></>)}
                                    {adj.기대_효과 && (<><b>기대 효과:</b> {adj.기대_효과}<br/></>)}
                                    <b>적용 난이도:</b> {adj.적용_난이도}
                                  </div>
                                </div>
                              ))}
                            </section>
                          )}
                          {/* 추가 최적화 전략 */}
                          {parsedAnalysisData.추가_전략 && (
                            <section className="p-4 rounded-lg bg-green-50 border border-green-200">
                              <div className="font-bold text-green-700 text-lg flex items-center gap-2">
                                <span role="img" aria-label="전략">🚀</span> 추가 최적화 전략
                              </div>
                              <ul className="mt-2 text-sm text-gray-800 list-disc pl-5">
                                {parsedAnalysisData.추가_전략.일정_구성_개선 && <li>{parsedAnalysisData.추가_전략.일정_구성_개선}</li>}
                                {parsedAnalysisData.추가_전략.업무_프로세스_최적화 && <li>{parsedAnalysisData.추가_전략.업무_프로세스_최적화}</li>}
                                {parsedAnalysisData.추가_전략.예방_조치 && <li>{parsedAnalysisData.추가_전략.예방_조치}</li>}
                              </ul>
                            </section>
                          )}
                          {/* 우선순위별 권장사항 */}
                          {parsedAnalysisData.우선순위_권장사항 && (
                            <section className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                              <div className="font-bold text-purple-700 text-lg flex items-center gap-2">
                                <span role="img" aria-label="우선순위">📋</span> 우선순위별 권장사항
                              </div>
                              <ul className="mt-2 text-sm text-gray-800 list-disc pl-5">
                                {parsedAnalysisData.우선순위_권장사항.즉시_적용?.length > 0 && <li>즉시 적용: <b>{parsedAnalysisData.우선순위_권장사항.즉시_적용.join(', ')}</b></li>}
                                {parsedAnalysisData.우선순위_권장사항.단계적_적용?.length > 0 && <li>단계적 적용: <b>{parsedAnalysisData.우선순위_권장사항.단계적_적용.join(', ')}</b></li>}
                                {parsedAnalysisData.우선순위_권장사항.장기_검토?.length > 0 && <li>장기 검토: <b>{parsedAnalysisData.우선순위_권장사항.장기_검토.join(', ')}</b></li>}
                              </ul>
                            </section>
                          )}
                        </div>
                      ) : (
                        aiAnalysis && typeof aiAnalysis === 'string' ? aiAnalysis : ''
                      )}
                      {parsedAnalysisData?.조정안 && parsedAnalysisData.조정안.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-blue-300">
                          <h4 className="font-semibold text-blue-800 mb-3">💡 조정안 적용</h4>
                          <div className="space-y-2">
                            {parsedAnalysisData.조정안.map((adjustment: any, index: number) => (
                              <div key={index} className="bg-white rounded p-3 border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-blue-900">
                                    조정안 {index + 1}: {adjustment.제안_유형}
                                  </span>
                                  <button
                                    onClick={() => handleApplyAdjustment(index)}
                                    disabled={isApplyingAdjustment}
                                    className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isApplyingAdjustment ? '적용 중...' : '제안 반영'}
                                  </button>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div><strong>대상:</strong> {adjustment.대상_일정}</div>
                                  <div><strong>조정 내용:</strong> {adjustment.구체적_조정}</div>
                                  <div><strong>적용 난이도:</strong> {adjustment.적용_난이도}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
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
                              <strong>🤖 AI가 자동으로 충돌을 분석하고 있습니다...</strong><br />
                              충돌하는 일정을 감지하면 즉시 AI 분석이 시작됩니다.<br />
                              분석이 완료되면 최적의 해결책이 제시됩니다.<br />
                              또는 수동으로 'AI 분석' 버튼을 클릭하여 재분석할 수 있습니다.
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
                  )}
                </div>
              </div>
            </div>
            {/* 하단: 2주치 시간표 캘린더 (한 줄에 한 주씩) */}
            <div className="card min-h-[200px] p-6">
              <div className="mb-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary-500" />
                <span className="font-semibold text-secondary-900">2주간 시간표 (드래그 & 드롭 가능)</span>
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
                          <div className="w-14 text-xs font-semibold text-slate-500 py-1 text-right pr-2 bg-slate-50 h-12 flex items-center justify-end">{hour}:00</div>
                          {week.map((date, idx) => (
                            <DroppableTimeCell
                              key={`${wIdx}-${idx}-${hour}`}
                              weekIndex={wIdx}
                              dayIndex={idx}
                              hour={hour}
                              date={date}
                            />
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
                        const topOffset = startPosition * CELL_HEIGHT;
                        const height = duration * CELL_HEIGHT;
                        
                        return (
                          <DraggableScheduleCard
                            key={schedule.id}
                            schedule={schedule}
                            position={{
                              ...position,
                              style: {
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
                                fontSize: '13px',
                                lineHeight: '15px',
                                boxSizing: 'border-box'
                              }
                            }}
                            onEdit={handleEditSchedule}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DragOverlay>
            {activeSchedule ? (
              <div className="bg-blue-500 text-white border rounded px-2 py-1 text-xs font-medium shadow-lg">
                {activeSchedule.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
} 

// ff