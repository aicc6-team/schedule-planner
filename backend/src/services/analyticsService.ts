import { getCollection } from '../config/firebase';
import { db } from '../config/firebase';
import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
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
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    const startTimestamp = Timestamp.fromDate(threeMonthsAgo);
    const endTimestamp = Timestamp.fromDate(today);
    
    const snapshot = await db.collection('PersonalScheduleAnalysis')
      .where('date', '>=', startTimestamp)
      .where('date', '<=', endTimestamp)
      .orderBy('date', 'desc')
      .get();
    
    return snapshot.docs.map((doc: DocumentSnapshot) => {
      const data = doc.data();
      let dateString = '';
      
      // date 필드 처리: Firestore Timestamp 객체를 문자열로 변환
      if (data && data['date'] && typeof data['date'] === 'object' && data['date'].toDate) {
        // Firestore Timestamp 객체인 경우
        dateString = data['date'].toDate().toISOString().split('T')[0];
      } else if (data && data['date'] && typeof data['date'] === 'string') {
        // 이미 문자열인 경우
        dateString = data['date'];
      } else {
        // 기타 경우
        dateString = '';
      }
      
      return {
        id: doc.id,
        ...data,
        date: dateString,
      };
    }) as unknown as PersonalScheduleAnalysis[];
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
    model: 'gpt-4o-mini',
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
      `${periodLabel}`,
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
        // reportType이 company면 updated_at, 아니면 date 사용
        let dateString = '';
        let dateValue = item['date'];
        if (item.reportType === 'company') {
          dateValue = item['updated_at'];
        }
        if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
          dateString = dateValue.toDate().toISOString().split('T')[0];
        } else if (typeof dateValue === 'string') {
          dateString = dateValue;
        } else {
          dateString = '날짜 없음';
        }
        doc.text(`${dateString}: 총 ${item.total_schedules}, 완료 ${item.completed_schedules}`);
        if (idx < scheduleData.length - 1) doc.moveDown(0.2);
      });
      doc.moveDown(1);
    }

    // ======================= 5. 차트/표 =========================
    if (Array.isArray(chartImages) && Array.isArray(chartDescriptions)) {
      chartImages.forEach((img, idx) => {
        if (!img) return;
        const base64 = img.replace(/^data:image\/png;base64,/, '');
        const buf = Buffer.from(base64, 'base64');
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const imgWidth = Math.floor(pageWidth * 0.5); // 이미지 50%
        const imgHeight = 200;
        const descX = doc.page.margins.left + imgWidth + 20; // 이미지 오른쪽에 20px 여백
        const descWidth = Math.floor(pageWidth * 0.45); // 설명 45%
        let startY = doc.y;
        const descText = chartDescriptions[idx] || '';
        // 제목:설명 분리
        let title = descText;
        let body = '';
        if (descText.includes(':')) {
          const arr = descText.split(/:(.+)/);
          title = (arr[0] ?? '').trim();
          body = (arr[1] ?? '').trim();
        }
        // 설명 텍스트 높이 측정 (body가 있으면 개행 포함)
        const descTextHeight = doc.heightOfString(body ? title + '\n' + body : title, { width: descWidth });
        const blockHeight = Math.max(imgHeight, descTextHeight);
        // 블록 전체가 들어갈 공간이 남는지 체크
        if (startY + blockHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          startY = doc.y;
        }
        // 이미지 왼쪽에 출력
        doc.image(buf, doc.page.margins.left, startY, { fit: [imgWidth, imgHeight] });
        // 설명 오른쪽에 출력
        let descY = startY;
        if (body) {
          // 제목 bold, 설명은 개행 후 regular
          doc.font('Bold').fontSize(11).fillColor('#22223B');
          doc.text(title, descX, descY, { width: descWidth, align: 'left', continued: false });
          descY += doc.heightOfString(title, { width: descWidth });
          doc.font('Regular').fontSize(11).fillColor('#22223B');
          doc.text(body, descX, descY, { width: descWidth, align: 'left' });
        } else {
          // 전체를 regular로
          doc.font('Regular').fontSize(11).fillColor('#22223B');
          doc.text(title, descX, descY, { width: descWidth, align: 'left' });
        }
        // y좌표를 이미지/설명 중 더 큰 높이만큼 내림
        doc.y = startY + blockHeight + 10;
        // 구분선
        doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke('#e5e7eb');
        doc.moveDown(0.5);
      });
    }

    // ======================= 4. 분석 항목 안내 =========================
    doc.font('Bold').fontSize(13).fillColor('#22223B');
    doc.text('4. 분석 항목 안내', doc.page.margins.left, doc.y, { align: 'left' });
    doc.moveDown(0.3);

    doc.font('Regular').fontSize(11).fillColor('#22223B');
    const descriptionsToUse = Array.isArray(chartDescriptions) && chartDescriptions.length > 0
      ? chartDescriptions
      : [
          '• 일별 이행률',
          '• 요일×시간대 완료율',
          '• 태그별 완료율',
          '• 소요시간 분포',
          '• 소요시간 vs 감정 산점도',
          '• 태그별 시간 분포 비교',
          '• 상태 파이차트',
          '• 누적 완료 추이',
          '• 시작/종료 시간 분포',
        ];
    descriptionsToUse.forEach((item) => {
      let text = '';
      if (typeof item === 'string') {
        text = item.split(":")[0] ?? '';
      } else if (item != null) {
        text = String(item);
      }
      doc.text(text || '');
    });
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
      .where('createdAt', '<=', toDate)
      .orderBy('createdAt', 'desc'); // createdAt 기준 내림차순 정렬

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
