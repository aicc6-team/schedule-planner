import { db } from '../config/firebase';

// 타입 정의
export interface PersonalSchedule {
  id: string; // 일정 고유 아이디
  date: string; // 일정 날짜
  title: string; // 일정 제목
  description: string; // 일정 설명
  start_time: string; // 일정 시작 시간
  end_time: string; // 일정 종료 시간
  duration_minutes: number; // 업무 소요 시간 (분)
  status: string; // 일정 상태 (완료, 지연 등)
  tag: string; // 업무 태그
  emotion: string; // 감정 상태
  created_at: string; // 생성 일시
  updated_at: string; // 수정 일시
}

export interface DepartmentSchedule {
  id: string; // 일정 고유 아이디
  department_name: string; // 부서명
  assignee: string; // 담당자명
  date: string; // 일정 날짜
  title: string; // 일정 제목
  description: string; // 일정 설명
  start_time: string; // 일정 시작 시간
  end_time: string; // 일정 종료 시간
  delay_hours: number; // 응답 지연 시간 (시간 단위)
  schedule_type: string; // 일정 유형
  collaboration_pairs: any; // 협업 참여자 쌍 데이터
  duration_minutes: number; // 업무 소요 시간 (분)
  quality: number; // 업무 품질 점수
  status: string; // 일정 상태
  created_at: string; // 생성 일시
  updated_at: string; // 수정 일시
}

export interface ProjectSchedule {
  id: string; // 프로젝트 일정 고유 아이디
  project_id: string; // 프로젝트 고유 아이디
  project_name: string; // 프로젝트명 (일정 제목)
  project_description: string; // 프로젝트 설명 (일정 설명)
  project_start_date: string; // 프로젝트 시작일
  project_end_date: string; // 프로젝트 종료일
  date: string; // 분석 기준 날짜
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
  created_at: string; // 생성 일시
  updated_at: string; // 수정 일시
}

export interface CompanySchedule {
  schedule_id: string;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  organizer: string;
  supporting_organizations: any;
  attendees: any;
  created_at: string;
  updated_at: string;
}

export interface ScheduleConflict {
  conflict_id: string;
  conflict_schedule1_id: string;
  conflict_schedule1_type: string;
  conflict_schedule2_id: string;
  conflict_schedule2_type: string;
  adjusted_schedule_id: string;
  adjusted_schedule_type: string;
  adjusted_date: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalScheduleAnalysis {
  date: string;
  total_schedules: number;
  completed_schedules: number;
  start_time_distribution: any;
  end_time_distribution: any;
  completion_rate_by_tag: any;
  duration_distribution: any;
  task_count_by_emotion: any;
  task_count_by_status: any;
  schedule_count_by_time_slot: any;
  cumulative_completions: any;
}

export interface DepartmentScheduleAnalysis {
  department_name: string;
  date: string;
  average_delay_per_member: any;
  schedule_type_ratio: any;
  bottleneck_time_slots: any;
  collaboration_network: any;
  workload_by_member_and_type: any;
  execution_time_stats: any;
  quality_stats: any;
  monthly_schedule_trends: any;
  issue_occurrence_rate: any;
}

export interface ProjectScheduleAnalysis {
  project_id: string;
  date: string;
  task_list: any;
  start_dates: any;
  durations: any;
  dependencies: any;
  planned_completion_dates: any;
  actual_completion_dates: any;
  simulation_completion_dates: any;
  progress: any;
  delay_times: any;
  intervals: any;
  cumulative_budget: any;
  stage_status: any;
}

export interface CompanyScheduleAnalysis {
  schedule_id: string;
  analysis_start_date: string;
  analysis_end_date: string;
  total_schedules: number;
  schedule_duration_distribution: any;
  time_slot_distribution: any;
  attendee_participation_counts: any;
  organizer_schedule_counts: any;
  supporting_organization_collaborations: any;
  monthly_schedule_counts: any;
  schedule_category_ratio: any;
  updated_at: string;
}

export interface ComprehensiveAnalysisReport {
  report_id: string;
  report_type: string;
  related_id: string;
  created_at: string;
  analysis_start_date: string;
  analysis_end_date: string;
  summary: string;
  chart_data: any;
  raw_data: any;
}

export interface AIConflictScheduleAnalysis {
  request_id: string;
  conflict_id: string;
  user_id: string;
  request_datetime: string;
  request_params: any;
  status: string;
  completion_datetime: string;
}


// Firestore 서비스
export const firestoreService = {
  // 개인 일정 컬렉션 조회
  async getPersonalSchedules(): Promise<PersonalSchedule[]> {
    try {
      const snapshot = await db.collection('personal_schedules').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PersonalSchedule));
    } catch (error) {
      console.error('개인 일정 조회 실패:', error);
      throw new Error('개인 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // 부서 일정 컬렉션 조회
  async getDepartmentSchedules(): Promise<DepartmentSchedule[]> {
    try {
      const snapshot = await db.collection('department_schedules').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DepartmentSchedule));
    } catch (error) {
      console.error('부서 일정 조회 실패:', error);
      throw new Error('부서 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // 프로젝트 일정 컬렉션 조회
  async getProjectSchedules(): Promise<ProjectSchedule[]> {
    try {
      const snapshot = await db.collection('project_schedules').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProjectSchedule));
    } catch (error) {
      console.error('프로젝트 일정 조회 실패:', error);
      throw new Error('프로젝트 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // 모든 일정 조회 (통합)
  async getAllSchedules(): Promise<{
    personal: PersonalSchedule[];
    department: DepartmentSchedule[];
    project: ProjectSchedule[];
    company: CompanySchedule[];
  }> {
    try {
      const [personal, department, project, company] = await Promise.all([
        this.getPersonalSchedules(),
        this.getDepartmentSchedules(),
        this.getProjectSchedules(),
        this.getCompanySchedules()
      ]);

      return {
        personal,
        department,
        project,
        company
      };
    } catch (error) {
      console.error('전체 일정 조회 실패:', error);
      throw new Error('전체 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // === 개인 일정 CRUD ===
  // 개인 일정 생성
  async createPersonalSchedule(data: Omit<PersonalSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<PersonalSchedule> {
    try {
      const now = new Date().toISOString();
      const scheduleData = {
        ...data,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await db.collection('personal_schedules').add(scheduleData);
      return {
        id: docRef.id,
        ...scheduleData
      };
    } catch (error) {
      console.error('개인 일정 생성 실패:', error);
      throw new Error('개인 일정을 생성하는 중 오류가 발생했습니다.');
    }
  },

  // 개인 일정 상세 조회
  async getPersonalScheduleById(id: string): Promise<PersonalSchedule | null> {
    try {
      const doc = await db.collection('personal_schedules').doc(id).get();
      if (!doc.exists) return null;
      
      return {
        id: doc.id,
        ...doc.data()
      } as PersonalSchedule;
    } catch (error) {
      console.error('개인 일정 상세 조회 실패:', error);
      throw new Error('개인 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // 개인 일정 수정
  async updatePersonalSchedule(id: string, data: Partial<PersonalSchedule>): Promise<PersonalSchedule | null> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      await db.collection('personal_schedules').doc(id).update(updateData);
      return await this.getPersonalScheduleById(id);
    } catch (error) {
      console.error('개인 일정 수정 실패:', error);
      throw new Error('개인 일정을 수정하는 중 오류가 발생했습니다.');
    }
  },

  // 개인 일정 삭제
  async deletePersonalSchedule(id: string): Promise<boolean> {
    try {
      await db.collection('personal_schedules').doc(id).delete();
      return true;
    } catch (error) {
      console.error('개인 일정 삭제 실패:', error);
      throw new Error('개인 일정을 삭제하는 중 오류가 발생했습니다.');
    }
  },

  // === 부서 일정 CRUD ===
  // 부서 일정 생성
  async createDepartmentSchedule(data: Omit<DepartmentSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<DepartmentSchedule> {
    try {
      const now = new Date().toISOString();
      const scheduleData = {
        ...data,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await db.collection('department_schedules').add(scheduleData);
      return {
        id: docRef.id,
        ...scheduleData
      };
    } catch (error) {
      console.error('부서 일정 생성 실패:', error);
      throw new Error('부서 일정을 생성하는 중 오류가 발생했습니다.');
    }
  },

  // 부서 일정 상세 조회
  async getDepartmentScheduleById(id: string): Promise<DepartmentSchedule | null> {
    try {
      const doc = await db.collection('department_schedules').doc(id).get();
      if (!doc.exists) return null;
      
      return {
        id: doc.id,
        ...doc.data()
      } as DepartmentSchedule;
    } catch (error) {
      console.error('부서 일정 상세 조회 실패:', error);
      throw new Error('부서 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // 부서 일정 수정
  async updateDepartmentSchedule(id: string, data: Partial<DepartmentSchedule>): Promise<DepartmentSchedule | null> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      await db.collection('department_schedules').doc(id).update(updateData);
      return await this.getDepartmentScheduleById(id);
    } catch (error) {
      console.error('부서 일정 수정 실패:', error);
      throw new Error('부서 일정을 수정하는 중 오류가 발생했습니다.');
    }
  },

  // 부서 일정 삭제
  async deleteDepartmentSchedule(id: string): Promise<boolean> {
    try {
      await db.collection('department_schedules').doc(id).delete();
      return true;
    } catch (error) {
      console.error('부서 일정 삭제 실패:', error);
      throw new Error('부서 일정을 삭제하는 중 오류가 발생했습니다.');
    }
  },

  // === 프로젝트 일정 CRUD ===
  // 프로젝트 일정 생성
  async createProjectSchedule(data: Omit<ProjectSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectSchedule> {
    try {
      const now = new Date().toISOString();
      const scheduleData = {
        ...data,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await db.collection('project_schedules').add(scheduleData);
      return {
        id: docRef.id,
        ...scheduleData
      };
    } catch (error) {
      console.error('프로젝트 일정 생성 실패:', error);
      throw new Error('프로젝트 일정을 생성하는 중 오류가 발생했습니다.');
    }
  },

  // 프로젝트 일정 상세 조회
  async getProjectScheduleById(id: string): Promise<ProjectSchedule | null> {
    try {
      const doc = await db.collection('project_schedules').doc(id).get();
      if (!doc.exists) return null;
      
      return {
        id: doc.id,
        ...doc.data()
      } as ProjectSchedule;
    } catch (error) {
      console.error('프로젝트 일정 상세 조회 실패:', error);
      throw new Error('프로젝트 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // 프로젝트 일정 수정
  async updateProjectSchedule(id: string, data: Partial<ProjectSchedule>): Promise<ProjectSchedule | null> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      await db.collection('project_schedules').doc(id).update(updateData);
      return await this.getProjectScheduleById(id);
    } catch (error) {
      console.error('프로젝트 일정 수정 실패:', error);
      throw new Error('프로젝트 일정을 수정하는 중 오류가 발생했습니다.');
    }
  },

  // 프로젝트 일정 삭제
  async deleteProjectSchedule(id: string): Promise<boolean> {
    try {
      await db.collection('project_schedules').doc(id).delete();
      return true;
    } catch (error) {
      console.error('프로젝트 일정 삭제 실패:', error);
      throw new Error('프로젝트 일정을 삭제하는 중 오류가 발생했습니다.');
    }
  },

  // === 회사 일정 CRUD ===
  async getCompanySchedules(): Promise<CompanySchedule[]> {
    try {
      const snapshot = await db.collection('company_schedules').get();
      return snapshot.docs.map(doc => ({
        schedule_id: doc.id,
        ...doc.data()
      } as CompanySchedule));
    } catch (error) {
      console.error('회사 일정 조회 실패:', error);
      throw new Error('회사 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },
  async createCompanySchedule(_data: Omit<CompanySchedule, 'schedule_id' | 'created_at' | 'updated_at'>): Promise<CompanySchedule> {
    // TODO: 구현
    return {} as CompanySchedule;
  },
  async getCompanyScheduleById(_id: string): Promise<CompanySchedule | null> {
    // TODO: 구현
    return null;
  },
  async updateCompanySchedule(_id: string, _data: Partial<CompanySchedule>): Promise<CompanySchedule | null> {
    // TODO: 구현
    return null;
  },
  async deleteCompanySchedule(_id: string): Promise<boolean> {
    // TODO: 구현
    return false;
  },

  // === 일정 충돌 CRUD ===
  async getScheduleConflicts(): Promise<ScheduleConflict[]> {
    // TODO: 구현
    return [];
  },
  async createScheduleConflict(_data: Omit<ScheduleConflict, 'conflict_id' | 'created_at' | 'updated_at'>): Promise<ScheduleConflict> {
    // TODO: 구현
    return {} as ScheduleConflict;
  },
  async getScheduleConflictById(_id: string): Promise<ScheduleConflict | null> {
    // TODO: 구현
    return null;
  },
  async updateScheduleConflict(_id: string, _data: Partial<ScheduleConflict>): Promise<ScheduleConflict | null> {
    // TODO: 구현
    return null;
  },
  async deleteScheduleConflict(_id: string): Promise<boolean> {
    // TODO: 구현
    return false;
  },

  // === 분석 데이터 CRUD ===
  // 개인
  async getPersonalScheduleAnalysis(_date: string): Promise<PersonalScheduleAnalysis | null> {
    // TODO: 구현
    return null;
  },
  async createPersonalScheduleAnalysis(_data: PersonalScheduleAnalysis): Promise<PersonalScheduleAnalysis> {
    // TODO: 구현
    return {} as PersonalScheduleAnalysis;
  },
  async updatePersonalScheduleAnalysis(_date: string, _data: Partial<PersonalScheduleAnalysis>): Promise<PersonalScheduleAnalysis | null> {
    // TODO: 구현
    return null;
  },

  // 부서
  async getDepartmentScheduleAnalysis(_departmentName: string, _date: string): Promise<DepartmentScheduleAnalysis | null> {
    // TODO: 구현
    return null;
  },
  async createDepartmentScheduleAnalysis(_data: DepartmentScheduleAnalysis): Promise<DepartmentScheduleAnalysis> {
    // TODO: 구현
    return {} as DepartmentScheduleAnalysis;
  },
  async updateDepartmentScheduleAnalysis(_departmentName: string, _date: string, _data: Partial<DepartmentScheduleAnalysis>): Promise<DepartmentScheduleAnalysis | null> {
    // TODO: 구현
    return null;
  },

  // 프로젝트
  async getProjectScheduleAnalysis(_projectId: string, _date: string): Promise<ProjectScheduleAnalysis | null> {
    // TODO: 구현
    return null;
  },
  async createProjectScheduleAnalysis(_data: ProjectScheduleAnalysis): Promise<ProjectScheduleAnalysis> {
    // TODO: 구현
    return {} as ProjectScheduleAnalysis;
  },
  async updateProjectScheduleAnalysis(_projectId: string, _date: string, _data: Partial<ProjectScheduleAnalysis>): Promise<ProjectScheduleAnalysis | null> {
    // TODO: 구현
    return null;
  },

  // 회사
  async getCompanyScheduleAnalysis(_scheduleId: string): Promise<CompanyScheduleAnalysis | null> {
    // TODO: 구현
    return null;
  },
  async createCompanyScheduleAnalysis(_data: CompanyScheduleAnalysis): Promise<CompanyScheduleAnalysis> {
    // TODO: 구현
    return {} as CompanyScheduleAnalysis;
  },
  async updateCompanyScheduleAnalysis(_scheduleId: string, _data: Partial<CompanyScheduleAnalysis>): Promise<CompanyScheduleAnalysis | null> {
    // TODO: 구현
    return null;
  },

  // 종합분석보고서
  async getComprehensiveAnalysisReports(): Promise<ComprehensiveAnalysisReport[]> {
    // TODO: 구현
    return [];
  },
  async createComprehensiveAnalysisReport(_data: Omit<ComprehensiveAnalysisReport, 'report_id' | 'created_at'>): Promise<ComprehensiveAnalysisReport> {
    // TODO: 구현
    return {} as ComprehensiveAnalysisReport;
  },
  async getComprehensiveAnalysisReportById(_id: string): Promise<ComprehensiveAnalysisReport | null> {
    // TODO: 구현
    return null;
  },

  // AI 충돌일정분석 요청
  async getAIConflictScheduleAnalysisRequests(): Promise<AIConflictScheduleAnalysis[]> {
    // TODO: 구현
    return [];
  },
  async createAIConflictScheduleAnalysisRequest(_data: Omit<AIConflictScheduleAnalysis, 'request_id'>): Promise<AIConflictScheduleAnalysis> {
    // TODO: 구현
    return {} as AIConflictScheduleAnalysis;
  },
  async getAIConflictScheduleAnalysisRequestById(_id: string): Promise<AIConflictScheduleAnalysis | null> {
    // TODO: 구현
    return null;
  }
}; 