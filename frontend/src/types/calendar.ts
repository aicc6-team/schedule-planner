// 일정 데이터 타입 (공통 Schedule)
export interface Schedule {
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
export interface PersonalSchedule {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: string;
  [key: string]: any;
}

export interface DepartmentSchedule {
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

export interface ProjectSchedule {
  id: string;
  project_name: string;
  project_description: string;
  project_start_date: string;
  project_end_date: string;
  endDate?: string; // 실제 데이터에 있는 필드
  status: string;
  [key: string]: any;
}

export interface CompanySchedule {
  schedule_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  organizer: string;
  status: string;
  [key: string]: any;
}

export interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface ScheduleTypeColors {
  bg: string;
  text: string;
  border: string;
} 