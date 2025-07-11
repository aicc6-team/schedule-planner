export interface AnalyticsQuery {
    id?: string | undefined;
    projectId?: string | undefined;
    metricName?: string | undefined;
    period?: 'daily' | 'weekly' | 'monthly' | 'current' | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
}
export interface PersonalScheduleAnalysis {
    date: string;
    totalSchedules: number;
    completedSchedules: number;
    startTimeDistribution: Record<string, number>;
    endTimeDistribution: Record<string, number>;
    completionRateByTag: Record<string, {
        completionRate: number;
        avgDuration: number;
    }>;
    durationDistribution: Record<string, number>;
    taskCountByEmotion: Record<string, number>;
    taskCountByStatus: Record<string, number>;
    scheduleCountByTimeSlot: Record<string, number>;
    cumulativeCompletions: Record<string, number>;
}
export interface Analytics {
    id: string;
    projectId: string | null;
    metricName: string;
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