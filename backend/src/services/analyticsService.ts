import { getCollection } from '../config/firebase';
import { db } from '../config/firebase';
import { DocumentSnapshot } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import PDFDocument from 'pdfkit';
import path from 'path';

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

// PDF 생성 함수 (차트 이미지+설명 지원)
export function generatePDFBuffer(
  summary: string,
  advice: string,
  statsTable: any,
  scheduleData: any[],
  periodLabel: string,
  chartImages?: string[],
  chartDescriptions?: string[]
): Promise<Buffer> {
  console.log('PDF 생성용 statsTable:', statsTable);
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const buffers: Buffer[] = [];

     // ★★★★★ 한글 ttf 폰트 등록
    doc.registerFont('Regular', path.resolve(__dirname, '../../fonts/NotoSansKR-Regular.ttf'));
    doc.registerFont('Bold', path.resolve(__dirname, '../../fonts/NotoSansKR-Bold.ttf'));

    // 스트림 연결
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // ======================= 타이틀 =========================
    doc.font('Bold').fontSize(22).fillColor('#22223B');
    doc.text('일정 분석 리포트', { align: 'left' });

    doc.moveDown(0.2);
    doc.font('Regular').fontSize(11).fillColor('#6c757d');
    doc.text(
      `분석기간: ${periodLabel}`,
      { align: 'left' }
    );
    doc.moveDown(0.7);

    // 구분선
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#E5E7EB').lineWidth(1.2).stroke();
    doc.moveDown(1.2);

    /*
    // ======================= 1. 요약 =========================
    doc.font('Bold').fontSize(13).fillColor('#22223B');
    doc.text('1. 요약');
    doc.moveDown(0.5);

    // summary rows
    const summaryRows = [
      ['총 일정', `${statsTable?.totalSchedules ?? 0}건`],
      ['완료 일정', `${statsTable?.completedSchedules ?? 0}건`],
      ['완료율', `${typeof statsTable?.completionRate === 'number' ? statsTable.completionRate.toFixed(1) : '0.0'}%`],
      ['일평균 일정', `${typeof statsTable?.averageDailySchedules === 'number' ? statsTable.averageDailySchedules.toFixed(1) : '0.0'}건`],
      ['참석자', statsTable?.totalAttendees ?? '-'],
      ['주최 기관', statsTable?.totalOrganizers ?? '-'],
    ];

    summaryRows.forEach(([label, value]) => {
      doc.font('Bold').fontSize(11).fillColor('#22223B').text(label, { continued: true, width: 100 });
      doc.font('Regular').fontSize(11).fillColor('#22223B').text(' : ', { continued: true });
      doc.font('Regular').fontSize(11).fillColor('#1D4ED8').text(value);
    });

    doc.moveDown(1);
    */

    // ======================= 2. 분석 요약 =========================
    if (summary) {
      doc.font('Bold').fontSize(13).fillColor('#22223B').text('1. 분석 요약');
      doc.moveDown(0.3);
      doc.font('Regular').fontSize(11).fillColor('#22223B').text(summary);
      doc.moveDown(1);
    }

    // ======================= 3. 개선 조언 =========================
    if (advice) {
      doc.font('Bold').fontSize(13).fillColor('#22223B').text('2. 개선 조언');
      doc.moveDown(0.3);
      doc.font('Regular').fontSize(11).fillColor('#22223B').text(advice);
      doc.moveDown(1);
    }

    // ======================= 4. 상세 일정 =========================
    if (scheduleData && scheduleData.length > 0) {
      doc.font('Bold').fontSize(13).fillColor('#22223B').text('3. 상세 일정');
      doc.moveDown(0.3);
      doc.font('Regular').fontSize(10).fillColor('#22223B');
      scheduleData.forEach((item, idx) => {
        doc.text(`${item.date}: 총 ${item.total_schedules}, 완료 ${item.completed_schedules}`);
        if (idx < scheduleData.length - 1) doc.moveDown(0.2);
      });
      doc.moveDown(1);
    }

    // ======================= 5. 차트/표 =========================
    if (Array.isArray(chartImages) && Array.isArray(chartDescriptions)) {
      chartImages.forEach((img, idx) => {
        if (!img) return;
        doc.font('Bold').fontSize(12).fillColor('#22223B').text(chartDescriptions[idx] || '', { align: 'left' });
        doc.moveDown(0.2);
        try {
          const base64 = img.replace(/^data:image\/png;base64,/, '');
          const buf = Buffer.from(base64, 'base64');
          doc.image(buf, { fit: [300, 150], align: 'center', valign: 'center' });
        } catch (e) {
          doc.font('Regular').fontSize(10).fillColor('red').text('차트 이미지를 불러올 수 없습니다.');
        }
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#e5e7eb');
        doc.moveDown(0.5);
      });
    }

    // ======================= 4. 분석 항목 안내 =========================
    doc.font('Bold').fontSize(13).fillColor('#22223B');
    doc.text('4. 분석 항목 안내');
    doc.moveDown(0.3);

    doc.font('Regular').fontSize(11).fillColor('#22223B');
    [
      '• 일별 이행률',
      '• 태그별 완료율',
      '• 소요시간 분포',
      '• 감정 상태별 업무 수',
      '• 상태별 업무 수',
      '• 시간대별 일정 건수',
      '• 누적 완료 추이',
      '• 시작/종료 시간 분포',
    ].forEach((item) => doc.text(item));
    doc.moveDown(1);

    // ======================= 5. 차트/표 안내 =========================
    doc.font('Regular').fontSize(10).fillColor('#868E96');
    doc.text('※ 차트/표는 실제 데이터 발생 시 자동 생성됩니다.', { align: 'left' });
    doc.moveDown(2);

    // ======================= 하단 문구, 페이지 =========================
    doc.font('Regular').fontSize(8).fillColor('#ADB5BD');
    doc.text('ⓒ 2025. Onlyint. All Rights Reserved.', 40, 780, { align: 'left' });
    doc.text('Page 1 / 1', 0, 780, { align: 'right' });


    // 페이지 번호는 모든 페이지가 추가된 후에 붙인다
    const pageRange = doc.bufferedPageRange();
    for (let i = pageRange.start; i < pageRange.start + pageRange.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(10)
        .font('Regular')
        .fillColor('#60a5fa')
        .text(
          `Page ${i - pageRange.start + 1} / ${pageRange.count}`,
          doc.page.margins.left,
          doc.page.height - doc.page.margins.bottom - 20,
          { align: 'center' }
        );
    }

    doc.end();
  });
}

export async function getReportsByPeriodAndType(from: string, to: string, type: string): Promise<any[]> {
  try {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999); // to 날짜의 끝까지 포함
    const query = db.collection('ComprehensiveAnalysisReport')
      .where('reportType', '==', type)
      .where('createdAt', '>=', fromDate)
      .where('createdAt', '<=', toDate);
    const snapshot = await query.get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
} 
