import { getCollection } from '../config/firebase';
import { Analytics } from '../types/database';
import { getFirestoreDB } from '../config/firebase';
import { DocumentSnapshot } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import PDFDocument from 'pdfkit';

export interface AnalyticsQuery {
  id?: string | undefined;
  project_id?: string | undefined;
  metric_name?: string | undefined;
  period?: 'daily' | 'weekly' | 'monthly' | 'current' | undefined;
  start_date?: Date | undefined;
  end_date?: Date | undefined;
}

// PersonalScheduleAnalysis 인터페이스 정의
export interface PersonalScheduleAnalysis {
  date: string;
  total_schedules: number;
  completed_schedules: number;
  start_time_distribution: Record<string, number>;
  end_time_distribution: Record<string, number>;
  completion_rate_by_tag: Record<string, { completion_rate: number; avg_duration: number }>;
  duration_distribution: Record<string, number>;
  task_count_by_emotion: Record<string, number>;
  task_count_by_status: Record<string, number>;
  schedule_count_by_time_slot: Record<string, number>;
  cumulative_completions: Record<string, number>;
}

export const getAnalytics = async (query: AnalyticsQuery = {}): Promise<Analytics[]> => {
  try {
    let collectionRef: any = getCollection('personal_tasks');
    if (query.id) {
      collectionRef = collectionRef.where('id', '==', query.id);
    }
    // if (query.metric_name) {
    //   collectionRef = collectionRef.where('metric_name', '==', query.metric_name);
    // }
    // if (query.period) {
    //   collectionRef = collectionRef.where('period', '==', query.period);
    // }
    // if (query.start_date) {
    //   collectionRef = collectionRef.where('date', '>=', query.start_date);
    // }
    // if (query.end_date) {
    //   collectionRef = collectionRef.where('date', '<=', query.end_date);
    // }
    const snapshot = await collectionRef.get();
    const analytics: Analytics[] = [];
    snapshot.forEach((doc: any) => {
      analytics.push({
        id: doc.id,
        ...doc.data()
      } as Analytics);
    });
    return analytics;
  } catch (error) {
    console.error('Analytics 데이터 조회 실패:', error);
    throw error;
  }
};

// 최근 3개월간 개인 일정 분석 데이터 조회 함수
export async function getRecentPersonalSchedule(): Promise<PersonalScheduleAnalysis[]> {
  try {
    const db = getFirestoreDB();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const snapshot = await db.collection('PersonalScheduleAnalysis')
      .where('date', '>=', threeMonthsAgo.toISOString().split('T')[0])
      .orderBy('date', 'desc')
      .get();
    
    return snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as unknown as PersonalScheduleAnalysis[];
  } catch (error) {
    console.error('Error fetching recent personal schedule analysis:', error);
    throw error;
  }
}

// LLM 요약/조언 (OpenAI 예시)
export async function getKoreanAnalysis(summaryData: PersonalScheduleAnalysis[]): Promise<{ summary: string, advice: string }> {

  // OpenAI 객체 생성 (v4)
  const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']!, // `.env.local`에서 가져와야 함
  });

  const stats = makeStatsForPrompt(summaryData);
  const prompt = `
아래는 최근 3개월간 사용자의 일정 데이터 통계입니다.
${JSON.stringify(stats, null, 2)}
1. 일정 관리 경향을 한글로 요약해줘.
2. 더 잘 실천하거나 개선할 수 있는 팁/조언을 2~3가지 제시해줘.
(모두 자연스러운 한국어로!)`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'system', content: '너는 일정 데이터를 분석하는 전문 어시스턴트야.' },
               { role: 'user', content: prompt }]
  });
  const text = response.choices[0]?.message?.content ?? '';
  const parts = text.split(/\n[2-3]\./);
  const summary = parts[0] || '분석 데이터가 부족합니다.';
  const advice = parts[1] || '더 많은 데이터를 수집한 후 다시 분석해주세요.';
  return { summary, advice };
}

// 통계 데이터 생성 함수
export function makeStatsForPrompt(scheduleData: PersonalScheduleAnalysis[]) {
  const totalSchedules = scheduleData.reduce((sum, item) => sum + item.total_schedules, 0);
  const completedSchedules = scheduleData.reduce((sum, item) => sum + item.completed_schedules, 0);
  
  return {
    totalSchedules,
    completedSchedules,
    completionRate: totalSchedules > 0 ? (completedSchedules / totalSchedules) * 100 : 0,
    averageDailySchedules: scheduleData.length > 0 ? totalSchedules / scheduleData.length : 0
  };
}

// 기간 라벨 생성 함수
export function getPeriodLabel(months: number): string {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  return `${startDate.toISOString().split('T')[0]} ~ ${endDate.toISOString().split('T')[0]}`;
}

// 한국어 PDF 문서 정의 생성 함수 (임시 구현)
export function makeKoreanReportDoc(summary: string, advice: string, statsTable: any, periodLabel: string) {
  return {
    content: [
      { text: '개인 일정 분석 레포트', style: 'header' },
      { text: periodLabel, style: 'subheader' },
      { text: summary, style: 'body' },
      { text: '조언:', style: 'subheader' },
      { text: advice, style: 'body' },
      { text: '통계 요약:', style: 'subheader' },
      { text: `총 일정: ${statsTable.totalSchedules}개`, style: 'body' },
      { text: `완료 일정: ${statsTable.completedSchedules}개`, style: 'body' },
      { text: `완료율: ${statsTable.completionRate.toFixed(1)}%`, style: 'body' }
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
      body: { fontSize: 12, margin: [0, 5, 0, 5] }
    }
  };
}

// 보고서 기록 저장 함수
export async function saveReportRecord(userId: string, summary: string, statsTable: any, scheduleData: PersonalScheduleAnalysis[], periodLabel: string) {
  try {
    const db = getFirestoreDB();
    await db.collection('ComprehensiveAnalysisReport').add({
      userId,
      summary,
      statsTable,
      scheduleData,
      periodLabel,
      createdAt: new Date(),
      reportType: 'personal'
    });
  } catch (error) {
    console.error('Error saving report record:', error);
    // 보고서 저장 실패는 전체 프로세스를 중단하지 않음
  }
}

// PDF 생성 함수
export function generatePDFBuffer(summary: string, advice: string, statsTable: any, scheduleData: PersonalScheduleAnalysis[], periodLabel: string): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      font: 'Helvetica' // 기본 폰트 설정
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });

    // 한글 폰트 등록 (시스템 폰트 사용)
    doc.font('Helvetica');

    // PDF 내용 작성
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Personal Schedule Analysis Report', { align: 'center' })
      .moveDown(2);

    doc
      .fontSize(14)
      .font('Helvetica')
      .text(periodLabel, { align: 'center' })
      .moveDown(2);

    // 요약 섹션
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Analysis Summary')
      .moveDown(1);

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(summary)
      .moveDown(2);

    // 조언 섹션
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Improvement Suggestions')
      .moveDown(1);

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(advice)
      .moveDown(2);

    // 통계 요약 섹션
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Statistics Summary')
      .moveDown(1);

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`• Total Schedules: ${statsTable.totalSchedules}`)
      .text(`• Completed Schedules: ${statsTable.completedSchedules}`)
      .text(`• Completion Rate: ${statsTable.completionRate.toFixed(1)}%`)
      .text(`• Average Daily Schedules: ${statsTable.averageDailySchedules.toFixed(1)}`)
      .moveDown(2);

    // 상세 분석 섹션
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Daily Detailed Analysis')
      .moveDown(1);

    scheduleData.forEach((item, index) => {
      const completionRate = item.total_schedules > 0 
        ? ((item.completed_schedules / item.total_schedules) * 100).toFixed(1) 
        : '0';
      
      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`${item.date}: Total ${item.total_schedules}, Completed ${item.completed_schedules} (${completionRate}%)`);
      
      if (index < scheduleData.length - 1) {
        doc.moveDown(0.5);
      }
    });

    // 페이지 번호
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(
          `Page ${i + 1} / ${pageCount}`,
          doc.page.margins.left,
          doc.page.height - doc.page.margins.bottom - 20,
          { align: 'center' }
        );
    }

    doc.end();
  });
} 
