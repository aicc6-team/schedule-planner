"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
exports.getRecentPersonalSchedule = getRecentPersonalSchedule;
exports.getKoreanAnalysis = getKoreanAnalysis;
exports.makeStatsForPrompt = makeStatsForPrompt;
exports.getPeriodLabel = getPeriodLabel;
exports.makeKoreanReportDoc = makeKoreanReportDoc;
exports.saveReportRecord = saveReportRecord;
exports.generatePDFBuffer = generatePDFBuffer;
const firebase_1 = require("../config/firebase");
const firebase_2 = require("../config/firebase");
const openai_1 = __importDefault(require("openai"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const getAnalytics = async (query = {}) => {
    try {
        let collectionRef = (0, firebase_1.getCollection)('personal_tasks');
        if (query.id) {
            collectionRef = collectionRef.where('id', '==', query.id);
        }
        const snapshot = await collectionRef.get();
        const analytics = [];
        snapshot.forEach((doc) => {
            analytics.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return analytics;
    }
    catch (error) {
        console.error('Analytics 데이터 조회 실패:', error);
        throw error;
    }
};
exports.getAnalytics = getAnalytics;
async function getRecentPersonalSchedule() {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const snapshot = await firebase_2.db.collection('PersonalScheduleAnalysis')
            .where('date', '>=', threeMonthsAgo.toISOString().split('T')[0])
            .orderBy('date', 'desc')
            .get();
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    catch (error) {
        console.error('Error fetching recent personal schedule analysis:', error);
        throw error;
    }
}
async function getKoreanAnalysis(summaryData) {
    const openai = new openai_1.default({
        apiKey: process.env['OPENAI_API_KEY'],
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
        messages: [
            { role: 'system', content: '너는 일정 데이터를 분석하는 전문 어시스턴트야.' },
            { role: 'user', content: prompt }
        ]
    });
    const text = response.choices[0]?.message?.content ?? '';
    const parts = text.split(/\n[2-3]\./);
    const summary = parts[0] || '분석 데이터가 부족합니다.';
    const advice = parts[1] || '더 많은 데이터를 수집한 후 다시 분석해주세요.';
    return { summary, advice };
}
function makeStatsForPrompt(scheduleData) {
    const totalSchedules = scheduleData.reduce((sum, item) => sum + item.totalSchedules, 0);
    const completedSchedules = scheduleData.reduce((sum, item) => sum + item.completedSchedules, 0);
    return {
        totalSchedules,
        completedSchedules,
        completionRate: totalSchedules > 0 ? (completedSchedules / totalSchedules) * 100 : 0,
        averageDailySchedules: scheduleData.length > 0 ? totalSchedules / scheduleData.length : 0
    };
}
function getPeriodLabel(months) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    return `${startDate.toISOString().split('T')[0]} ~ ${endDate.toISOString().split('T')[0]}`;
}
function makeKoreanReportDoc(summary, advice, statsTable, periodLabel) {
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
async function saveReportRecord(userId, summary, statsTable, scheduleData, periodLabel) {
    try {
        await firebase_2.db.collection('ComprehensiveAnalysisReport').add({
            userId,
            summary,
            statsTable,
            scheduleData,
            periodLabel,
            createdAt: new Date(),
            reportType: 'personal'
        });
    }
    catch (error) {
        console.error('Error saving report record:', error);
    }
}
function generatePDFBuffer(summary, advice, statsTable, scheduleData, periodLabel, chartImages, chartDescriptions) {
    return new Promise((resolve) => {
        const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
        const buffers = [];
        doc.registerFont('Regular', path_1.default.resolve(__dirname, '../../fonts/NotoSansKR-Regular.ttf'));
        doc.registerFont('Bold', path_1.default.resolve(__dirname, '../../fonts/NotoSansKR-Bold.ttf'));
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.font('Bold').fontSize(22).fillColor('#22223B');
        doc.text('일정 분석 리포트', { align: 'left' });
        doc.moveDown(0.2);
        doc.font('Regular').fontSize(11).fillColor('#6c757d');
        doc.text(`분석기간: ${periodLabel}`, { align: 'left' });
        doc.moveDown(0.7);
        doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#E5E7EB').lineWidth(1.2).stroke();
        doc.moveDown(1.2);
        doc.font('Bold').fontSize(13).fillColor('#22223B');
        doc.text('1. 요약');
        doc.moveDown(0.5);
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
        if (summary) {
            doc.font('Bold').fontSize(13).fillColor('#22223B').text('2. 분석 요약');
            doc.moveDown(0.3);
            doc.font('Regular').fontSize(11).fillColor('#22223B').text(summary);
            doc.moveDown(1);
        }
        if (advice) {
            doc.font('Bold').fontSize(13).fillColor('#22223B').text('3. 개선 조언');
            doc.moveDown(0.3);
            doc.font('Regular').fontSize(11).fillColor('#22223B').text(advice);
            doc.moveDown(1);
        }
        if (scheduleData && scheduleData.length > 0) {
            doc.font('Bold').fontSize(13).fillColor('#22223B').text('4. 상세 일정');
            doc.moveDown(0.3);
            doc.font('Regular').fontSize(10).fillColor('#22223B');
            scheduleData.forEach((item, idx) => {
                doc.text(`${item.date}: 총 ${item.totalSchedules}, 완료 ${item.completedSchedules}`);
                if (idx < scheduleData.length - 1)
                    doc.moveDown(0.2);
            });
            doc.moveDown(1);
        }
        if (Array.isArray(chartImages) && Array.isArray(chartDescriptions)) {
            chartImages.forEach((img, idx) => {
                if (!img)
                    return;
                doc.font('Bold').fontSize(12).fillColor('#22223B').text(chartDescriptions[idx] || '', { align: 'left' });
                doc.moveDown(0.2);
                try {
                    const base64 = img.replace(/^data:image\/png;base64,/, '');
                    const buf = Buffer.from(base64, 'base64');
                    doc.image(buf, { fit: [300, 150], align: 'center', valign: 'center' });
                }
                catch (e) {
                    doc.font('Regular').fontSize(10).fillColor('red').text('차트 이미지를 불러올 수 없습니다.');
                }
                doc.moveDown(0.5);
                doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#e5e7eb');
                doc.moveDown(0.5);
            });
        }
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
        doc.font('Regular').fontSize(10).fillColor('#868E96');
        doc.text('※ 차트/표는 실제 데이터 발생 시 자동 생성됩니다.', { align: 'left' });
        doc.moveDown(2);
        doc.font('Regular').fontSize(8).fillColor('#ADB5BD');
        doc.text('ⓒ 2025. Onlyint. All Rights Reserved.', 40, 780, { align: 'left' });
        doc.text('Page 1 / 1', 0, 780, { align: 'right' });
        const pageRange = doc.bufferedPageRange();
        for (let i = pageRange.start; i < pageRange.start + pageRange.count; i++) {
            doc.switchToPage(i);
            doc
                .fontSize(10)
                .font('Regular')
                .fillColor('#60a5fa')
                .text(`Page ${i - pageRange.start + 1} / ${pageRange.count}`, doc.page.margins.left, doc.page.height - doc.page.margins.bottom - 20, { align: 'center' });
        }
        doc.end();
    });
}
//# sourceMappingURL=analyticsService.js.map