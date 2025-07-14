import { db } from '../config/firebase';
import 'dotenv/config';
import {
  PersonalSchedule, 
  DepartmentSchedule,
  ProjectSchedule,
  CompanySchedule,
  ScheduleConflict,
  PersonalScheduleAnalysis,
  DepartmentScheduleAnalysis,
  ProjectScheduleAnalysis,
  CompanyScheduleAnalysis,
  ComprehensiveAnalysisReport,
  AIConflictScheduleAnalysis,
  User,
} from '../services/firestoreService';

// 시드 데이터
const personalSchedules: Omit<PersonalSchedule, 'id'>[] = [
  {
    title: "백엔드 API 구축",
    description: "백엔드 API 구축",
    date: new Date("2025-07-04"),
    start_time: new Date("2025-07-04T13:10:00"),
    end_time: new Date("2025-07-04T13:40:00"),
    duration_minutes: 30,
    status: "완료",
    tag: "개발",
    emotion: "보통",
    created_at: new Date("2025-07-04T05:29:00.279Z"),
    updated_at: new Date("2025-07-04T05:29:00.279Z")
  },
];

const departmentSchedules: Omit<DepartmentSchedule, 'id'>[] = [
  {
    department_name: "개발팀",
    assignee: "김개발",
    date: new Date("2025-07-04"),
    title: "주간 회의",
    description: "주간 회의",
    start_time: new Date("2025-07-04T13:10:00"),
    end_time: new Date("2025-07-04T14:10:00"),
    delay_hours: 0,
    schedule_type: "회의",
    collaboration_pairs: [{ "member1": "김팀장", "member2": "이대리" }],
    duration_minutes: 60,
    quality: 4.5,
    status: "완료",
    created_at: new Date("2025-07-04T05:29:00.279Z"),
    updated_at: new Date("2025-07-04T05:29:00.279Z")
  },
];

const projectSchedules: Omit<ProjectSchedule, 'id'>[] = [
  {
    project_id: "project-001",
    project_name: "내 일정 프로젝트",
    project_description: "프로젝트 기획 정리",
    project_start_date: new Date("2025-07-01"),
    project_end_date: new Date("2025-07-10"),
    date: new Date("2025-07-04"),
    task_list: ["기획", "디자인", "개발"],
    start_dates: ["2025-07-01", "2025-07-03", "2025-07-05"],
    durations: [2, 3, 5],
    dependencies: {"디자인": "기획", "개발": "디자인"},
    planned_completion_dates: ["2025-07-03", "2025-07-06", "2025-07-10"],
    actual_completion_dates: ["2025-07-03", "2025-07-07", null],
    simulation_completion_dates: {},
    progress: {"기획": 100, "디자인": 100, "개발": 50},
    delay_times: {"디자인": 1},
    intervals: {},
    budget: {"total": 5000, "current": 2500},
    status: "진행중",
    created_at: new Date("2025-07-04T05:29:00.279Z"),
    updated_at: new Date("2025-07-04T05:29:00.279Z")
  }
];

const companySchedules: Omit<CompanySchedule, 'schedule_id'>[] = [
  {
    title: "전사 워크샵",
    description: "2025년 상반기 전사 워크샵",
    start_datetime: new Date("2025-08-01T10:00:00"),
    end_datetime: new Date("2025-08-02T18:00:00"),
    organizer: "인사팀",
    supporting_organizations: ["총무팀"],
    attendees: ["전직원"],
    created_at: new Date(),
    updated_at: new Date()
  }
];

const scheduleConflicts: Omit<ScheduleConflict, 'conflict_id'>[] = [
  {
    conflict_schedule1_id: "personal-schedule-id-1", // 예시 ID
    conflict_schedule1_type: "PersonalSchedule",
    conflict_schedule2_id: "department-schedule-id-1", // 예시 ID
    conflict_schedule2_type: "DepartmentSchedule",
    adjusted_schedule_id: "personal-schedule-id-1",
    adjusted_schedule_type: "PersonalSchedule",
    adjusted_date: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  }
];

const personalScheduleAnalyses: PersonalScheduleAnalysis[] = [
    {
        date: new Date("2025-07-04"),
        total_schedules: 10,
        completed_schedules: 8,
        start_time_distribution: {"09:00": 3, "10:00": 5, "14:00": 2},
        end_time_distribution: {"10:00": 4, "11:00": 4, "15:00": 2},
        completion_rate_by_tag: {"개발": 0.8, "기획": 0.9},
        duration_distribution: {"30분": 5, "60분": 4, "120분": 1},
        task_count_by_emotion: {"좋음": 3, "보통": 6, "나쁨": 1},
        task_count_by_status: {"완료": 8, "지연": 1, "미이행": 1},
        schedule_count_by_time_slot: {"오전": 8, "오후": 2},
        cumulative_completions: {"2025-07-04": 8}
    }
];

const departmentScheduleAnalyses: DepartmentScheduleAnalysis[] = [
    {
        department_name: "개발팀",
        date: new Date("2025-07-04"),
        average_delay_per_member: {"김개발": 0.5, "이개발": 0.2},
        schedule_type_ratio: {"회의": 0.4, "개발": 0.6},
        bottleneck_time_slots: {"14:00-15:00": 5},
        collaboration_network: {},
        workload_by_member_and_type: {},
        execution_time_stats: {},
        quality_stats: {},
        monthly_schedule_trends: {},
        issue_occurrence_rate: {}
    }
];

const projectScheduleAnalyses: ProjectScheduleAnalysis[] = [
    {
        project_id: "project-001",
        date: new Date("2025-07-04"),
        task_list: [],
        start_dates: [],
        durations: [],
        dependencies: [],
        planned_completion_dates: [],
        actual_completion_dates: [],
        simulation_completion_dates: [],
        progress: {},
        delay_times: {},
        intervals: {},
        cumulative_budget: {},
        stage_status: {}
    }
];

const companyScheduleAnalyses: CompanyScheduleAnalysis[] = [
    {
        schedule_id: "company-schedule-id-1", // 예시 ID
        analysis_start_date: new Date("2025-07-01"),
        analysis_end_date: new Date("2025-07-31"),
        total_schedules: 5,
        schedule_duration_distribution: {},
        time_slot_distribution: {},
        attendee_participation_counts: {},
        organizer_schedule_counts: {},
        supporting_organization_collaborations: {},
        monthly_schedule_counts: {},
        schedule_category_ratio: {},
        updated_at: new Date()
    }
];

const comprehensiveAnalysisReports: Omit<ComprehensiveAnalysisReport, 'report_id'>[] = [
    {
        report_type: "종합",
        related_id: "2025-07-04",
        created_at: new Date(),
        analysis_start_date: new Date("2025-07-01"),
        analysis_end_date: new Date("2025-07-31"),
        summary: "7월 종합 분석 보고서 요약입니다.",
        chart_data: {},
        raw_data: {}
    }
];

const aiConflictScheduleAnalyses: Omit<AIConflictScheduleAnalysis, 'request_id'>[] = [
    {
        conflict_id: "conflict-id-1", // 예시 ID
        user_id: "user-id-1",
        request_datetime: new Date(),
        request_params: {},
        status: "완료",
        completion_datetime: new Date()
    }
];

const users: Omit<User, 'user_id'>[] = [
  { name: '문성훈', department: '개발팀', position: '팀장', role: '백엔드 개발자' },
  { name: '서민지', department: '기획팀', position: '매니저', role: '프로덕트 매니저' },
  { name: '남윤동', department: '디자인팀', position: '팀원', role: 'UI/UX 디자이너' },
  { name: '홍세준', department: '개발팀', position: '팀원', role: '프론트엔드 개발자' },
  { name: '홍원섭', department: '마케팅팀', position: '팀장', role: '마케팅 리더' }
];

// 시드 함수들
export const seedPersonalSchedules = async () => {
  console.log('🌱 개인 일정 시드 데이터 생성 중...');
  const batch = db.batch();
  
  personalSchedules.forEach((schedule) => {
    const docRef = db.collection('PersonalSchedule').doc();
    batch.set(docRef, schedule);
  });
  
  await batch.commit();
  console.log('✅ 개인 일정 시드 데이터 생성 완료');
};

export const seedDepartmentSchedules = async () => {
  console.log('🌱 부서 일정 시드 데이터 생성 중...');
  const batch = db.batch();
  
  departmentSchedules.forEach((schedule) => {
    const docRef = db.collection('DepartmentSchedule').doc();
    batch.set(docRef, schedule);
  });
  
  await batch.commit();
  console.log('✅ 부서 일정 시드 데이터 생성 완료');
};

export const seedProjectSchedules = async () => {
  console.log('🌱 프로젝트 일정 시드 데이터 생성 중...');
  const batch = db.batch();
  
  projectSchedules.forEach((schedule) => {
    const docRef = db.collection('ProjectSchedule').doc();
    batch.set(docRef, schedule);
  });
  
  await batch.commit();
  console.log('✅ 프로젝트 일정 시드 데이터 생성 완료');
};

export const seedCompanySchedules = async () => {
    console.log('🌱 회사 일정 시드 데이터 생성 중...');
    const batch = db.batch();
    companySchedules.forEach((schedule) => {
        const docRef = db.collection('CompanySchedule').doc();
        batch.set(docRef, schedule);
    });
    await batch.commit();
    console.log('✅ 회사 일정 시드 데이터 생성 완료');
};

export const seedScheduleConflicts = async () => {
    console.log('🌱 일정 충돌 시드 데이터 생성 중...');
    const batch = db.batch();
    scheduleConflicts.forEach((conflict) => {
        const docRef = db.collection('ScheduleConflict').doc();
        batch.set(docRef, conflict);
    });
    await batch.commit();
    console.log('✅ 일정 충돌 시드 데이터 생성 완료');
};

export const seedPersonalScheduleAnalyses = async () => {
    console.log('🌱 개인 일정 분석 시드 데이터 생성 중...');
    const batch = db.batch();
    personalScheduleAnalyses.forEach((analysis) => {
        const docRef = db.collection('PersonalScheduleAnalysis').doc(analysis.date.toISOString());
        batch.set(docRef, analysis);
    });
    await batch.commit();
    console.log('✅ 개인 일정 분석 시드 데이터 생성 완료');
};

export const seedDepartmentScheduleAnalyses = async () => {
    console.log('🌱 부서 일정 분석 시드 데이터 생성 중...');
    const batch = db.batch();
    departmentScheduleAnalyses.forEach((analysis) => {
        const docRef = db.collection('DepartmentScheduleAnalysis').doc(`${analysis.department_name}_${analysis.date.toISOString()}`);
        batch.set(docRef, analysis);
    });
    await batch.commit();
    console.log('✅ 부서 일정 분석 시드 데이터 생성 완료');
};

export const seedProjectScheduleAnalyses = async () => {
    console.log('🌱 프로젝트 일정 분석 시드 데이터 생성 중...');
    const batch = db.batch();
    projectScheduleAnalyses.forEach((analysis) => {
        const docRef = db.collection('ProjectScheduleAnalysis').doc(`${analysis.project_id}_${analysis.date.toISOString()}`);
        batch.set(docRef, analysis);
    });
    await batch.commit();
    console.log('✅ 프로젝트 일정 분석 시드 데이터 생성 완료');
};

export const seedCompanyScheduleAnalyses = async () => {
    console.log('🌱 회사 일정 분석 시드 데이터 생성 중...');
    const batch = db.batch();
    companyScheduleAnalyses.forEach((analysis) => {
        const docRef = db.collection('CompanyScheduleAnalysis').doc(analysis.schedule_id);
        batch.set(docRef, analysis);
    });
    await batch.commit();
    console.log('✅ 회사 일정 분석 시드 데이터 생성 완료');
};

export const seedComprehensiveAnalysisReports = async () => {
    console.log('🌱 종합 분석 보고서 시드 데이터 생성 중...');
    const batch = db.batch();
    comprehensiveAnalysisReports.forEach((report) => {
        const docRef = db.collection('ComprehensiveAnalysisReport').doc();
        batch.set(docRef, report);
    });
    await batch.commit();
    console.log('✅ 종합 분석 보고서 시드 데이터 생성 완료');
};

export const seedAIConflictScheduleAnalyses = async () => {
    console.log('🌱 AI 충돌 일정 분석 시드 데이터 생성 중...');
    const batch = db.batch();
    aiConflictScheduleAnalyses.forEach((analysis) => {
        const docRef = db.collection('AIConflictScheduleAnalysis').doc();
        batch.set(docRef, analysis);
    });
    await batch.commit();
    console.log('✅ AI 충돌 일정 분석 시드 데이터 생성 완료');
};

export const seedUsers = async () => {
  console.log('🌱 유저 시드 데이터 생성 중...');
  const batch = db.batch();
  users.forEach((user) => {
    const docRef = db.collection('Users').doc();
    batch.set(docRef, user);
  });
  await batch.commit();
  console.log('✅ 유저 시드 데이터 생성 완료');
};

// 모든 시드 데이터 생성
export const seedAllData = async () => {
  try {
    console.log('🚀 Firestore 시드 데이터 생성 시작...');
    
    await seedUsers();
    await seedPersonalSchedules();
    await seedDepartmentSchedules();
    await seedProjectSchedules();
    await seedCompanySchedules();
    await seedScheduleConflicts();
    await seedPersonalScheduleAnalyses();
    await seedDepartmentScheduleAnalyses();
    await seedProjectScheduleAnalyses();
    await seedCompanyScheduleAnalyses();
    await seedComprehensiveAnalysisReports();
    await seedAIConflictScheduleAnalyses();
    
    console.log('🎉 모든 시드 데이터 생성 완료!');
  } catch (error) {
    console.error('❌ 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 스크립트 실행
if (require.main === module) {
  seedAllData().catch(console.error);
} 