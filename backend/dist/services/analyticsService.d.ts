export interface AnalyticsQuery {
    id?: string | undefined;
    project_id?: string | undefined;
    metric_name?: string | undefined;
    period?: 'daily' | 'weekly' | 'monthly' | 'current' | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
}
export interface PersonalScheduleAnalysis {
    date: string;
    total_schedules: number;
    completed_schedules: number;
    start_time_distribution: Record<string, number>;
    end_time_distribution: Record<string, number>;
    completion_rate_by_tag: Record<string, {
        completion_rate: number;
        avg_duration: number;
    }>;
    duration_distribution: Record<string, number>;
    task_count_by_emotion: Record<string, number>;
    task_count_by_status: Record<string, number>;
    schedule_count_by_time_slot: Record<string, number>;
    cumulative_completions: Record<string, number>;
}
export interface Analytics {
    id: string;
    project_id: string | null;
    metric_name: string;
    value: number;
    unit: string;
    period: 'daily' | 'weekly' | 'monthly' | 'current';
    date: Date;
    description: string;
}
export declare const getAnalytics: (query?: AnalyticsQuery) => Promise<Analytics[]>;
export declare function getRecentPersonalSchedule(): Promise<PersonalScheduleAnalysis[]>;
export declare function getKoreanAnalysis(summaryData: PersonalScheduleAnalysis[]): Promise<{
    summary: string;
    advice: string;
}>;
export declare function makeStatsForPrompt(scheduleData: PersonalScheduleAnalysis[]): {
    totalSchedules: number;
    completedSchedules: number;
    completionRate: number;
    averageDailySchedules: number;
};
export declare function getPeriodLabel(months: number): string;
export declare function makeKoreanReportDoc(summary: string, advice: string, statsTable: any, periodLabel: string): {
    content: {
        text: string;
        style: string;
    }[];
    styles: {
        header: {
            fontSize: number;
            bold: boolean;
            margin: number[];
        };
        subheader: {
            fontSize: number;
            bold: boolean;
            margin: number[];
        };
        body: {
            fontSize: number;
            margin: number[];
        };
    };
};
export declare function saveReportRecord(userId: string, summary: string, statsTable: any, scheduleData: PersonalScheduleAnalysis[], periodLabel: string): Promise<void>;
export declare function generatePDFBuffer(summary: string, advice: string, statsTable: any, scheduleData: any[], periodLabel: string, chartImages?: string[], chartDescriptions?: string[]): Promise<Buffer>;
//# sourceMappingURL=analyticsService.d.ts.map