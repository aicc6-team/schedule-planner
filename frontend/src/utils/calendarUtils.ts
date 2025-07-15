import { 
  Schedule, 
  PersonalSchedule, 
  DepartmentSchedule, 
  ProjectSchedule, 
  CompanySchedule,
  CalendarCell 
} from '@/types/calendar';

// 일정 fetch 및 변환 함수
const API_BASE_URL = '';
export const fetchAllSchedules = async (): Promise<{personal: PersonalSchedule[], department: DepartmentSchedule[], project: ProjectSchedule[], company: CompanySchedule[]}> => {
  const response = await fetch(`/api/schedules/all`);
  if (!response.ok) {
    throw new Error('전체 일정을 가져오는데 실패했습니다.');
  }
  const result = await response.json();
  console.log('API 응답 전체:', result.data);
  console.log('회사 일정 company:', result.data.company);
  return result.data;
};

export const transformPersonalSchedule = (schedule: PersonalSchedule): Schedule => {
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

export const transformDepartmentSchedule = (schedule: DepartmentSchedule): Schedule => {
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

export const transformProjectSchedule = (schedule: ProjectSchedule): Schedule => {
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
  
  // 종료일을 포함한 기간으로 표시하기 위해 종료일의 다음날 00:00:00으로 설정
  endTime.setHours(0, 0, 0, 0);
  endTime.setDate(endTime.getDate() + 1);
  
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

export const transformCompanySchedule = (schedule: CompanySchedule): Schedule => ({
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

export const transformAllSchedules = (allSchedules: {personal: PersonalSchedule[], department: DepartmentSchedule[], project: ProjectSchedule[], company: CompanySchedule[]}): Schedule[] => {
  const p = allSchedules.personal?.map(transformPersonalSchedule) || [];
  const d = allSchedules.department?.map(transformDepartmentSchedule) || [];
  const r = allSchedules.project?.map(transformProjectSchedule) || [];
  const c = allSchedules.company?.map(transformCompanySchedule) || [];
  return [...p, ...d, ...r, ...c].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
};

export function getMonthMatrix(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const matrix = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= lastDay || matrix.length < 42) {
    matrix.push({
      date: new Date(currentDate),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: currentDate.toDateString() === new Date().toDateString()
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return matrix;
}

// 일정 타입별 색상 매핑 (일정관리 페이지와 동일)
export const scheduleTypeColors = {
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

export const SCHEDULE_TYPE_LABELS = {
  personal: '개인',
  department: '부서',
  company: '회사',
  project: '프로젝트'
}; 