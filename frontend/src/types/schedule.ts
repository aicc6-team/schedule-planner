// 백엔드와 일치하는 타입 정의
export interface PersonalSchedule {
  id: string; // 일정 고유 아이디
  date: Date; // 일정 날짜
  title: string; // 일정 제목
  description: string; // 일정 설명
  start_time: Date; // 일정 시작 시간
  end_time: Date; // 일정 종료 시간
  duration_minutes: number; // 업무 소요 시간 (분)
  status: string; // 일정 상태 (완료, 지연 등)
  tag: string; // 업무 태그
  emotion: string; // 감정 상태
  created_at: Date; // 생성 일시
  updated_at: Date; // 수정 일시
}

export interface DepartmentSchedule {
  id: string; // 일정 고유 아이디
  department_name: string; // 부서명
  assignee: string; // 담당자명
  date: Date; // 일정 날짜
  title: string; // 일정 제목
  description: string; // 일정 설명
  start_time: Date; // 일정 시작 시간
  end_time: Date; // 일정 종료 시간
  delay_hours: number; // 응답 지연 시간 (시간 단위)
  schedule_type: string; // 일정 유형
  collaboration_pairs: any; // 협업 참여자 쌍 데이터
  duration_minutes: number; // 업무 소요 시간 (분)
  quality: number; // 업무 품질 점수
  status: string; // 일정 상태
  created_at: Date; // 생성 일시
  updated_at: Date; // 수정 일시
}

export interface ProjectSchedule {
  id: string; // 프로젝트 일정 고유 아이디
  project_id: string; // 프로젝트 고유 아이디
  project_name: string; // 프로젝트명 (일정 제목)
  project_description: string; // 프로젝트 설명 (일정 설명)
  project_start_date: Date; // 프로젝트 시작일
  project_end_date: Date; // 프로젝트 종료일
  date: Date; // 분석 기준 날짜
  task_list: any; // 작업 단계 리스트
  start_dates: any; // 작업별 시작일 리스트
  durations: any; // 작업별 기간(일 단위)
  dependencies: any; // 단계별 종속 관계
  planned_completion_dates: any; // 계획 완료일 리스트
  actual_completion_dates: any; // 실제 완료일 리스트
  simulation_completion_dates: any; // 완료일 시뮬레이션 데이터
  progress: any; // 단계별 진행률
  delay_times: any; // 단계별 지연 시간
  intervals: any; // 단계 간 간격
  budget: any; // 누적 예산 소모
  status: any; // 단계별 상태 (완료, 진행, 지연)
  created_at: Date; // 생성 일시
  updated_at: Date; // 수정 일시
}

export interface CompanySchedule {
  schedule_id: string;
  title: string;
  description: string;
  start_datetime: Date;
  end_datetime: Date;
  organizer: string;
  supporting_organizations: any;
  attendees: any;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  user_id: string; // 유저 고유 아이디 (문서 ID)
  name: string; // 이름
  department: string; // 부서
  position: string; // 직책
  role: string; // 직무
}

// 기존 프론트엔드용 타입 (호환성 유지)
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
  adjusted?: boolean;
  status: 'completed' | 'pending' | 'overdue';
} 