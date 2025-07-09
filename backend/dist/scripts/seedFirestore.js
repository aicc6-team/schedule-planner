"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAllData = exports.seedAIConflictScheduleAnalyses = exports.seedComprehensiveAnalysisReports = exports.seedCompanyScheduleAnalyses = exports.seedProjectScheduleAnalyses = exports.seedDepartmentScheduleAnalyses = exports.seedPersonalScheduleAnalyses = exports.seedScheduleConflicts = exports.seedCompanySchedules = exports.seedProjectSchedules = exports.seedDepartmentSchedules = exports.seedPersonalSchedules = void 0;
const firebase_1 = require("../config/firebase");
require("dotenv/config");
const personalSchedules = [
    {
        title: "백엔드 API 구축",
        description: "백엔드 API 구축",
        date: "2025-07-04",
        start_time: "2025-07-04T13:10:00",
        end_time: "2025-07-04T13:40:00",
        duration_minutes: 30,
        status: "완료",
        tag: "개발",
        emotion: "보통",
        created_at: "2025-07-04T05:29:00.279Z",
        updated_at: "2025-07-04T05:29:00.279Z"
    },
];
const departmentSchedules = [
    {
        department_name: "개발팀",
        assignee: "김개발",
        date: "2025-07-04",
        title: "주간 회의",
        description: "주간 회의",
        start_time: "2025-07-04T13:10:00",
        end_time: "2025-07-04T14:10:00",
        delay_hours: 0,
        schedule_type: "회의",
        collaboration_pairs: [{ "member1": "김팀장", "member2": "이대리" }],
        duration_minutes: 60,
        quality: 4.5,
        status: "완료",
        created_at: "2025-07-04T05:29:00.279Z",
        updated_at: "2025-07-04T05:29:00.279Z"
    },
];
const projectSchedules = [
    {
        project_id: "project-001",
        project_name: "내 일정 프로젝트",
        project_description: "프로젝트 기획 정리",
        project_start_date: "2025-07-01",
        project_end_date: "2025-07-10",
        date: "2025-07-04",
        task_list: ["기획", "디자인", "개발"],
        start_dates: ["2025-07-01", "2025-07-03", "2025-07-05"],
        durations: [2, 3, 5],
        dependencies: { "디자인": "기획", "개발": "디자인" },
        planned_completion_dates: ["2025-07-03", "2025-07-06", "2025-07-10"],
        actual_completion_dates: ["2025-07-03", "2025-07-07", null],
        simulation_completion_dates: {},
        progress: { "기획": 100, "디자인": 100, "개발": 50 },
        delay_times: { "디자인": 1 },
        intervals: {},
        budget: { "total": 5000, "current": 2500 },
        status: "진행중",
        created_at: "2025-07-04T05:29:00.279Z",
        updated_at: "2025-07-04T05:29:00.279Z"
    }
];
const companySchedules = [
    {
        title: "전사 워크샵",
        description: "2025년 상반기 전사 워크샵",
        start_datetime: "2025-08-01T10:00:00",
        end_datetime: "2025-08-02T18:00:00",
        organizer: "인사팀",
        supporting_organizations: ["총무팀"],
        attendees: ["전직원"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
const scheduleConflicts = [
    {
        conflict_schedule1_id: "personal-schedule-id-1",
        conflict_schedule1_type: "PersonalSchedule",
        conflict_schedule2_id: "department-schedule-id-1",
        conflict_schedule2_type: "DepartmentSchedule",
        adjusted_schedule_id: "personal-schedule-id-1",
        adjusted_schedule_type: "PersonalSchedule",
        adjusted_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
const personalScheduleAnalyses = [
    {
        date: "2025-07-04",
        total_schedules: 10,
        completed_schedules: 8,
        start_time_distribution: { "09:00": 3, "10:00": 5, "14:00": 2 },
        end_time_distribution: { "10:00": 4, "11:00": 4, "15:00": 2 },
        completion_rate_by_tag: { "개발": 0.8, "기획": 0.9 },
        duration_distribution: { "30분": 5, "60분": 4, "120분": 1 },
        task_count_by_emotion: { "좋음": 3, "보통": 6, "나쁨": 1 },
        task_count_by_status: { "완료": 8, "지연": 1, "미이행": 1 },
        schedule_count_by_time_slot: { "오전": 8, "오후": 2 },
        cumulative_completions: { "2025-07-04": 8 }
    }
];
const departmentScheduleAnalyses = [
    {
        department_name: "개발팀",
        date: "2025-07-04",
        average_delay_per_member: { "김개발": 0.5, "이개발": 0.2 },
        schedule_type_ratio: { "회의": 0.4, "개발": 0.6 },
        bottleneck_time_slots: { "14:00-15:00": 5 },
        collaboration_network: {},
        workload_by_member_and_type: {},
        execution_time_stats: {},
        quality_stats: {},
        monthly_schedule_trends: {},
        issue_occurrence_rate: {}
    }
];
const projectScheduleAnalyses = [
    {
        project_id: "project-001",
        date: "2025-07-04",
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
const companyScheduleAnalyses = [
    {
        schedule_id: "company-schedule-id-1",
        analysis_start_date: "2025-07-01",
        analysis_end_date: "2025-07-31",
        total_schedules: 5,
        schedule_duration_distribution: {},
        time_slot_distribution: {},
        attendee_participation_counts: {},
        organizer_schedule_counts: {},
        supporting_organization_collaborations: {},
        monthly_schedule_counts: {},
        schedule_category_ratio: {},
        updated_at: new Date().toISOString()
    }
];
const comprehensiveAnalysisReports = [
    {
        report_type: "종합",
        related_id: "2025-07-04",
        created_at: new Date().toISOString(),
        analysis_start_date: "2025-07-01",
        analysis_end_date: "2025-07-31",
        summary: "7월 종합 분석 보고서 요약입니다.",
        chart_data: {},
        raw_data: {}
    }
];
const aiConflictScheduleAnalyses = [
    {
        conflict_id: "conflict-id-1",
        user_id: "user-id-1",
        request_datetime: new Date().toISOString(),
        request_params: {},
        status: "완료",
        completion_datetime: new Date().toISOString()
    }
];
const seedPersonalSchedules = async () => {
    console.log('🌱 개인 일정 시드 데이터 생성 중...');
    const batch = firebase_1.db.batch();
    personalSchedules.forEach((schedule) => {
        const docRef = firebase_1.db.collection('personal_schedules').doc();
        batch.set(docRef, schedule);
    });
    await batch.commit();
    console.log('✅ 개인 일정 시드 데이터 생성 완료');
};
exports.seedPersonalSchedules = seedPersonalSchedules;
const seedDepartmentSchedules = async () => {
    console.log('🌱 부서 일정 시드 데이터 생성 중...');
    const batch = firebase_1.db.batch();
    departmentSchedules.forEach((schedule) => {
        const docRef = firebase_1.db.collection('department_schedules').doc();
        batch.set(docRef, schedule);
    });
    await batch.commit();
    console.log('✅ 부서 일정 시드 데이터 생성 완료');
};
exports.seedDepartmentSchedules = seedDepartmentSchedules;
const seedProjectSchedules = async () => {
    console.log('🌱 프로젝트 일정 시드 데이터 생성 중...');
    const batch = firebase_1.db.batch();
    projectSchedules.forEach((schedule) => {
        const docRef = firebase_1.db.collection('project_schedules').doc();
        batch.set(docRef, schedule);
    });
    await batch.commit();
    console.log('✅ 프로젝트 일정 시드 데이터 생성 완료');
};
exports.seedProjectSchedules = seedProjectSchedules;
const seedCompanySchedules = async () => {
    console.log('🌱 회사 일정 시드 데이터 생성 중...');
    const batch = firebase_1.db.batch();
    companySchedules.forEach((schedule) => {
        const docRef = firebase_1.db.collection('company_schedules').doc();
        batch.set(docRef, schedule);
    });
    await batch.commit();
    console.log('✅ 회사 일정 시드 데이터 생성 완료');
};
exports.seedCompanySchedules = seedCompanySchedules;
const seedScheduleConflicts = async () => {
    console.log('🌱 일정 충돌 시드 데이터 생성 중...');
    const batch = firebase_1.db.batch();
    scheduleConflicts.forEach((conflict) => {
        const docRef = firebase_1.db.collection('schedule_conflicts').doc();
        batch.set(docRef, conflict);
    });
    await batch.commit();
    console.log('✅ 일정 충돌 시드 데이터 생성 완료');
};
exports.seedScheduleConflicts = seedScheduleConflicts;
const seedPersonalScheduleAnalyses = async () => {
    console.log('🌱 개인 일정 분석 시드 데이터 생성 중...');
    const batch = firebase_1.db.batch();
    personalScheduleAnalyses.forEach((analysis) => {
        const docRef = firebase_1.db.collection('personal_schedule_analyses').doc(analysis.date);
        batch.set(docRef, analysis);
    });
    await batch.commit();
    console.log('✅ 개인 일정 분석 시드 데이터 생성 완료');
};
exports.seedPersonalScheduleAnalyses = seedPersonalScheduleAnalyses;
const seedDepartmentScheduleAnalyses = async () => {
    console.log('🌱 부서 일정 분석 시드 데이터 생성 중...');
    const batch = firebase_1.db.batch();
    departmentScheduleAnalyses.forEach((analysis) => {
        const docRef = firebase_1.db.collection('department_schedule_analyses').doc(`${analysis.department_name}_${analysis.date}`);
        batch.set(docRef, analysis);
    });
    await batch.commit();
    console.log('✅ 부서 일정 분석 시드 데이터 생성 완료');
};
exports.seedDepartmentScheduleAnalyses = seedDepartmentScheduleAnalyses;
const seedProjectScheduleAnalyses = async () => {
    console.log('🌱 프로젝트 일정 분석 시드 데이터 생성 중...');
    const batch = firebase_1.db.batch();
    projectScheduleAnalyses.forEach((analysis) => {
        const docRef = firebase_1.db.collection('project_schedule_analyses').doc(`${analysis.project_id}_${analysis.date}`);
        batch.set(docRef, analysis);
    });
    await batch.commit();
    console.log('✅ 프로젝트 일정 분석 시드 데이터 생성 완료');
};
exports.seedProjectScheduleAnalyses = seedProjectScheduleAnalyses;
const seedCompanyScheduleAnalyses = async () => {
    console.log('🌱 회사 일정 분석 시드 데이터 생성 중...');
    const batch = firebase_1.db.batch();
    companyScheduleAnalyses.forEach((analysis) => {
        const docRef = firebase_1.db.collection('company_schedule_analyses').doc(analysis.schedule_id);
        batch.set(docRef, analysis);
    });
    await batch.commit();
    console.log('✅ 회사 일정 분석 시드 데이터 생성 완료');
};
exports.seedCompanyScheduleAnalyses = seedCompanyScheduleAnalyses;
const seedComprehensiveAnalysisReports = async () => {
    console.log('🌱 종합 분석 보고서 시드 데이터 생성 중...');
    const batch = firebase_1.db.batch();
    comprehensiveAnalysisReports.forEach((report) => {
        const docRef = firebase_1.db.collection('comprehensive_analysis_reports').doc();
        batch.set(docRef, report);
    });
    await batch.commit();
    console.log('✅ 종합 분석 보고서 시드 데이터 생성 완료');
};
exports.seedComprehensiveAnalysisReports = seedComprehensiveAnalysisReports;
const seedAIConflictScheduleAnalyses = async () => {
    console.log('🌱 AI 충돌 일정 분석 시드 데이터 생성 중...');
    const batch = firebase_1.db.batch();
    aiConflictScheduleAnalyses.forEach((analysis) => {
        const docRef = firebase_1.db.collection('ai_conflict_schedule_analyses').doc();
        batch.set(docRef, analysis);
    });
    await batch.commit();
    console.log('✅ AI 충돌 일정 분석 시드 데이터 생성 완료');
};
exports.seedAIConflictScheduleAnalyses = seedAIConflictScheduleAnalyses;
const seedAllData = async () => {
    try {
        console.log('🚀 Firestore 시드 데이터 생성 시작...');
        await (0, exports.seedPersonalSchedules)();
        await (0, exports.seedDepartmentSchedules)();
        await (0, exports.seedProjectSchedules)();
        await (0, exports.seedCompanySchedules)();
        await (0, exports.seedScheduleConflicts)();
        await (0, exports.seedPersonalScheduleAnalyses)();
        await (0, exports.seedDepartmentScheduleAnalyses)();
        await (0, exports.seedProjectScheduleAnalyses)();
        await (0, exports.seedCompanyScheduleAnalyses)();
        await (0, exports.seedComprehensiveAnalysisReports)();
        await (0, exports.seedAIConflictScheduleAnalyses)();
        console.log('🎉 모든 시드 데이터 생성 완료!');
    }
    catch (error) {
        console.error('❌ 시드 데이터 생성 실패:', error);
        throw error;
    }
};
exports.seedAllData = seedAllData;
if (require.main === module) {
    (0, exports.seedAllData)().catch(console.error);
}
//# sourceMappingURL=seedFirestore.js.map