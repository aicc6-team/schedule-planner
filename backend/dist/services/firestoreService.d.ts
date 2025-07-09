export interface PersonalSchedule {
    id: string;
    date: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    status: string;
    tag: string;
    emotion: string;
    created_at: string;
    updated_at: string;
}
export interface DepartmentSchedule {
    id: string;
    department_name: string;
    assignee: string;
    date: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    delay_hours: number;
    schedule_type: string;
    collaboration_pairs: any;
    duration_minutes: number;
    quality: number;
    status: string;
    created_at: string;
    updated_at: string;
}
export interface ProjectSchedule {
    id: string;
    project_id: string;
    project_name: string;
    project_description: string;
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
    budget: any;
    status: any;
    created_at: string;
    updated_at: string;
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
export declare const firestoreService: {
    getPersonalSchedules(): Promise<PersonalSchedule[]>;
    getDepartmentSchedules(): Promise<DepartmentSchedule[]>;
    getProjectSchedules(): Promise<ProjectSchedule[]>;
    getAllSchedules(): Promise<{
        personal: PersonalSchedule[];
        department: DepartmentSchedule[];
        project: ProjectSchedule[];
    }>;
    createPersonalSchedule(data: Omit<PersonalSchedule, "id" | "created_at" | "updated_at">): Promise<PersonalSchedule>;
    getPersonalScheduleById(id: string): Promise<PersonalSchedule | null>;
    updatePersonalSchedule(id: string, data: Partial<PersonalSchedule>): Promise<PersonalSchedule | null>;
    deletePersonalSchedule(id: string): Promise<boolean>;
    createDepartmentSchedule(data: Omit<DepartmentSchedule, "id" | "created_at" | "updated_at">): Promise<DepartmentSchedule>;
    getDepartmentScheduleById(id: string): Promise<DepartmentSchedule | null>;
    updateDepartmentSchedule(id: string, data: Partial<DepartmentSchedule>): Promise<DepartmentSchedule | null>;
    deleteDepartmentSchedule(id: string): Promise<boolean>;
    createProjectSchedule(data: Omit<ProjectSchedule, "id" | "created_at" | "updated_at">): Promise<ProjectSchedule>;
    getProjectScheduleById(id: string): Promise<ProjectSchedule | null>;
    updateProjectSchedule(id: string, data: Partial<ProjectSchedule>): Promise<ProjectSchedule | null>;
    deleteProjectSchedule(id: string): Promise<boolean>;
    getCompanySchedules(): Promise<CompanySchedule[]>;
    createCompanySchedule(_data: Omit<CompanySchedule, "schedule_id" | "created_at" | "updated_at">): Promise<CompanySchedule>;
    getCompanyScheduleById(_id: string): Promise<CompanySchedule | null>;
    updateCompanySchedule(_id: string, _data: Partial<CompanySchedule>): Promise<CompanySchedule | null>;
    deleteCompanySchedule(_id: string): Promise<boolean>;
    getScheduleConflicts(): Promise<ScheduleConflict[]>;
    createScheduleConflict(_data: Omit<ScheduleConflict, "conflict_id" | "created_at" | "updated_at">): Promise<ScheduleConflict>;
    getScheduleConflictById(_id: string): Promise<ScheduleConflict | null>;
    updateScheduleConflict(_id: string, _data: Partial<ScheduleConflict>): Promise<ScheduleConflict | null>;
    deleteScheduleConflict(_id: string): Promise<boolean>;
    getPersonalScheduleAnalysis(_date: string): Promise<PersonalScheduleAnalysis | null>;
    createPersonalScheduleAnalysis(_data: PersonalScheduleAnalysis): Promise<PersonalScheduleAnalysis>;
    updatePersonalScheduleAnalysis(_date: string, _data: Partial<PersonalScheduleAnalysis>): Promise<PersonalScheduleAnalysis | null>;
    getDepartmentScheduleAnalysis(_departmentName: string, _date: string): Promise<DepartmentScheduleAnalysis | null>;
    createDepartmentScheduleAnalysis(_data: DepartmentScheduleAnalysis): Promise<DepartmentScheduleAnalysis>;
    updateDepartmentScheduleAnalysis(_departmentName: string, _date: string, _data: Partial<DepartmentScheduleAnalysis>): Promise<DepartmentScheduleAnalysis | null>;
    getProjectScheduleAnalysis(_projectId: string, _date: string): Promise<ProjectScheduleAnalysis | null>;
    createProjectScheduleAnalysis(_data: ProjectScheduleAnalysis): Promise<ProjectScheduleAnalysis>;
    updateProjectScheduleAnalysis(_projectId: string, _date: string, _data: Partial<ProjectScheduleAnalysis>): Promise<ProjectScheduleAnalysis | null>;
    getCompanyScheduleAnalysis(_scheduleId: string): Promise<CompanyScheduleAnalysis | null>;
    createCompanyScheduleAnalysis(_data: CompanyScheduleAnalysis): Promise<CompanyScheduleAnalysis>;
    updateCompanyScheduleAnalysis(_scheduleId: string, _data: Partial<CompanyScheduleAnalysis>): Promise<CompanyScheduleAnalysis | null>;
    getComprehensiveAnalysisReports(): Promise<ComprehensiveAnalysisReport[]>;
    createComprehensiveAnalysisReport(_data: Omit<ComprehensiveAnalysisReport, "report_id" | "created_at">): Promise<ComprehensiveAnalysisReport>;
    getComprehensiveAnalysisReportById(_id: string): Promise<ComprehensiveAnalysisReport | null>;
    getAIConflictScheduleAnalysisRequests(): Promise<AIConflictScheduleAnalysis[]>;
    createAIConflictScheduleAnalysisRequest(_data: Omit<AIConflictScheduleAnalysis, "request_id">): Promise<AIConflictScheduleAnalysis>;
    getAIConflictScheduleAnalysisRequestById(_id: string): Promise<AIConflictScheduleAnalysis | null>;
};
//# sourceMappingURL=firestoreService.d.ts.map