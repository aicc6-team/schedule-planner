import express from 'express';
import { db } from '../config/firebase';
import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { 
  getRecentPersonalSchedule, 
  getKoreanAnalysis, 
  makeStatsForPrompt, 
  getPeriodLabel, 
  // makeKoreanReportDoc, 
  // saveReportRecord,
  generatePDFBuffer,
  getReportsByPeriodAndType
} from '../services/analyticsService';
import fs from 'fs';
import path from 'path';

// DepartmentScheduleAnalysis 인터페이스 정의
interface DepartmentScheduleAnalysis {
  department_name: string;           // 부서명
  date: string;                      // 분석 날짜
  average_delay_per_member: Record<string, number>; // 팀원별 평균 응답 및 지연 시간
  schedule_type_ratio: Record<string, number>;      // 일정 유형별 비율
  bottleneck_time_slots: Record<string, Record<string, number>>; // 시간대별 병목 현상 건수
  collaboration_network: Record<string, string[]>;  // 협업 네트워크 참여 횟수
  workload_by_member_and_type: Record<string, Record<string, number>>; // 팀원별 업무 유형별 투입 시간
  execution_time_stats: Record<string, { min: number; max: number; median: number }>; // 업무 수행시간 통계
  quality_stats: Record<string, { avg: number; min: number; max: number }>; // 업무 품질 통계
  monthly_schedule_trends: Record<string, number>;  // 월별 일정 건수 추이
  issue_occurrence_rate: Record<string, Record<string, number>>; // 태그별, 팀별 지연 건수
}

// CompanyScheduleAnalysis 인터페이스 정의
interface CompanyScheduleAnalysis {
  schedule_id: string;                                    // 회사 일정 고유 아이디
  analysis_start_date: string;                           // 분석 기간 시작일
  analysis_end_date: string;                             // 분석 기간 종료일
  total_schedules: number;                               // 총 일정 건수
  schedule_duration_distribution: Record<string, number>; // 일정 기간별 분포
  time_slot_distribution: Record<string, number>;        // 시간대별 분포
  attendee_participation_counts: Record<string, number>; // 참석자별 참여 횟수
  organizer_schedule_counts: Record<string, number>;     // 주최 기관별 일정 수
  supporting_organization_collaborations: Record<string, string[]>; // 협조 기관별 협력 횟수
  monthly_schedule_counts: Record<string, number>;       // 월별 일정 건수 추이
  schedule_category_ratio: Record<string, number>;       // 일정 카테고리별 비율
  updated_at: string;                                    // 갱신 일시
}

// ProjectScheduleAnalysis 인터페이스 정의
interface ProjectScheduleAnalysis {
  project_id: string;                           // 프로젝트 ID
  date: string;                                 // 분석 날짜
  task_list: string[];                          // 작업 리스트
  start_dates: Record<string, string>;          // 시작일 리스트
  durations: Record<string, number>;            // 단계별 기간
  dependencies: Record<string, string[]>;       // 작업 간 종속 관계
  planned_completion_dates: Record<string, string>; // 계획 완료일 리스트
  actual_completion_dates: Record<string, string>;  // 실제 완료일 리스트
  simulation_completion_dates: string[];        // 완료일 시뮬레이션
  progress: Record<string, number>;             // 단계별 진행률
  delay_times: Record<string, number>;          // 단계별 지연 시간
  intervals: Record<string, number>;            // 단계 간 간격
  cumulative_budget: Record<string, number>;    // 예산 누적 소모
  stage_status: Record<string, string>;         // 단계별 상태 (완료, 진행, 지연)
}

const router = express.Router();

// GET /api/analytics/personalTasks - PersonalScheduleAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/personalTasks', async (_req, res) => {
  try {
    // 오늘과 3개월 전 날짜 계산
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    const startTimestamp = Timestamp.fromDate(threeMonthsAgo);
    const endTimestamp = Timestamp.fromDate(today);

    const snapshot = await db.collection('PersonalScheduleAnalysis')
      .where('date', '>=', startTimestamp)
      .where('date', '<=', endTimestamp)
      .get();

    const tasks = snapshot.docs.map((doc: DocumentSnapshot) => {
      const data = doc.data();
      let dateString = '';
      if (data && data['date'] && typeof data['date'].toDate === 'function') {
        dateString = data['date'].toDate().toISOString().slice(0, 10);
      } else if (data && data['date'] && typeof data['date'] === 'string') {
        dateString = data['date'].slice(0, 10);
      } else {
        dateString = '';
      }
      return {
        id: doc.id,
        ...data,
        date: dateString,
      };
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching personal tasks:', error);
    res.status(500).json({ error: 'Failed to fetch personal tasks' });
  }
});

// GET /api/analytics/departmentTasks - DepartmentScheduleAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/departmentTasks', async (req, res) => {
  try {
    const { department_name, date } = req.query;
    
    // 오늘과 3개월 전 날짜 계산
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    const startTimestamp = Timestamp.fromDate(threeMonthsAgo);
    const endTimestamp = Timestamp.fromDate(today);

    let query: any = db.collection('DepartmentScheduleAnalysis');
    
    // 부서명 필터링
    if (department_name) {
      query = query.where('department_name', '==', department_name);
    }
    
    // 날짜 필터링 (쿼리 파라미터 우선, 없으면 3개월 조건)
    if (date) {
      query = query.where('date', '==', date);
    } else {
      query = query.where('date', '>=', startTimestamp).where('date', '<=', endTimestamp);
    }
    
    const snapshot = await query.get();
    
    const analysis = snapshot.docs.map((doc: DocumentSnapshot) => {
      const data = doc.data();
      let dateString = '';
      if (data && data['date'] && typeof data['date'].toDate === 'function') {
        dateString = data['date'].toDate().toISOString().slice(0, 10);
      } else if (data && data['date'] && typeof data['date'] === 'string') {
        dateString = data['date'].slice(0, 10);
      } else {
        dateString = '';
      }
      return {
        id: doc.id,
        ...data,
        date: dateString,
      };
    }) as DepartmentScheduleAnalysis[];

    // 데이터가 배열인지 확인하고 반환
    const analysisArray = Array.isArray(analysis) ? analysis : [];
    res.json(analysisArray);
  } catch (error) {
    console.error('Error fetching department analysis:', error);
    res.status(500).json({ error: 'Failed to fetch department analysis' });
  }
});

// GET /api/analytics/companyTasks - CompanyScheduleAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/companyTasks', async (req, res) => {
  try {
    const { schedule_id, analysis_start_date, analysis_end_date } = req.query;
    
    // 오늘과 3개월 전 날짜 계산
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    const startTimestamp = Timestamp.fromDate(threeMonthsAgo);
    const endTimestamp = Timestamp.fromDate(today);

    let query: any = db.collection('CompanyScheduleAnalysis');
    
    // schedule_id 필터링
    if (schedule_id) {
      query = query.where('schedule_id', '==', schedule_id);
    }
    
    // 분석 시작일/종료일 필터링 (파라미터 우선, 없으면 3개월 조건)
    if (analysis_start_date && analysis_end_date) {
      query = query.where('analysis_start_date', '==', analysis_start_date)
                   .where('analysis_end_date', '==', analysis_end_date);
    } else {
      query = query.where('analysis_start_date', '>=', startTimestamp)
                   .where('analysis_end_date', '<=', endTimestamp);
    }
    
    const snapshot = await query.get();
    const analysis = snapshot.docs.map((doc: DocumentSnapshot) => {
      const data = doc.data();
      let startDateStr = '';
      let endDateStr = '';
      if (data && data['analysis_start_date'] && typeof data['analysis_start_date'].toDate === 'function') {
        startDateStr = data['analysis_start_date'].toDate().toISOString().slice(0, 10);
      } else if (data && data['analysis_start_date'] && typeof data['analysis_start_date'] === 'string') {
        startDateStr = data['analysis_start_date'].slice(0, 10);
      }
      if (data && data['analysis_end_date'] && typeof data['analysis_end_date'].toDate === 'function') {
        endDateStr = data['analysis_end_date'].toDate().toISOString().slice(0, 10);
      } else if (data && data['analysis_end_date'] && typeof data['analysis_end_date'] === 'string') {
        endDateStr = data['analysis_end_date'].slice(0, 10);
      }
      return {
        id: doc.id,
        ...data,
        analysis_start_date: startDateStr,
        analysis_end_date: endDateStr,
      };
    }) as CompanyScheduleAnalysis[];

    // 데이터가 배열인지 확인하고 반환
    const analysisArray = Array.isArray(analysis) ? analysis : [];
    res.json(analysisArray);
  } catch (error) {
    console.error('Error fetching company analysis:', error);
    res.status(500).json({ error: 'Failed to fetch company analysis' });
  }
});

// GET /api/analytics/projectTasks - ProjectScheduleAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/projectTasks', async (req, res) => {
  try {
    const { project_id, date } = req.query;
    

    // 오늘과 3개월 전 날짜 계산
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    const startTimestamp = Timestamp.fromDate(threeMonthsAgo);
    const endTimestamp = Timestamp.fromDate(today);


    let query: any = db.collection('ProjectScheduleAnalysis');
    
    // project_id 필터링
    if (project_id) {
      query = query.where('project_id', '==', project_id);
    }
    

    // 날짜 필터링 (쿼리 파라미터 우선, 없으면 3개월 조건)
    if (date) {
      query = query.where('date', '==', date);
    } else {
      query = query.where('date', '>=', startTimestamp).where('date', '<=', endTimestamp);

    }
    
    const snapshot = await query.get();
    

    const analysis = snapshot.docs.map((doc: DocumentSnapshot) => {
      const data = doc.data();
      let dateString = '';
      if (data && data['date'] && typeof data['date'].toDate === 'function') {
        dateString = data['date'].toDate().toISOString().slice(0, 10);
      } else if (data && data['date'] && typeof data['date'] === 'string') {
        dateString = data['date'].slice(0, 10);
      } else {
        dateString = '';
      }
      return {
        id: doc.id,
        ...data,
        date: dateString,
      };
    }) as ProjectScheduleAnalysis[];


    // 데이터가 배열인지 확인하고 반환
    const analysisArray = Array.isArray(analysis) ? analysis : [];
    res.json(analysisArray);
  } catch (error) {
    console.error('Error fetching project analysis:', error);
    res.status(500).json({ error: 'Failed to fetch project analysis' });
  }
});

// GET /api/analytics/projectDependencies - ProjectDependenciesAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/projectDependencies', async (_req, res) => {
  try {
    const snapshot = await db.collection('ProjectDependenciesAnalysis').get();
    
    const dependencies = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(dependencies);
  } catch (error) {
    console.error('Error fetching project dependencies:', error);
    res.status(500).json({ error: 'Failed to fetch project dependencies' });
  }
});

// GET /api/analytics/projectSimulations - ProjectSimulationsAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/projectSimulations', async (_req, res) => {
  try {
    const snapshot = await db.collection('ProjectSimulationsAnalysis').get();
    
    const simulations = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(simulations);
  } catch (error) {
    console.error('Error fetching project simulations:', error);
    res.status(500).json({ error: 'Failed to fetch project simulations' });
  }
});

// GET /api/analytics/projectProgress - ProjectProgressAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/projectProgress', async (_req, res) => {
  try {
    const snapshot = await db.collection('ProjectProgressAnalysis').get();

    const progress = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(progress);
  } catch (error) {
    console.error('Error fetching project progress:', error);
    res.status(500).json({ error: 'Failed to fetch project progress' });
  }
});

// GET /api/analytics/projectCosts - projectCostsAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/projectCosts', async (_req, res) => {
  try {
    const snapshot = await db.collection('projectCostsAnalysis').get();  

    const costs = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(costs);  
  } catch (error) {
    console.error('Error fetching project costs:', error);
    res.status(500).json({ error: 'Failed to fetch project costs' });
  }
});

// GET /api/analytics/reports - ReportsAnalysis 컬렉션의 모든 데이터 가져오기
router.post('/reports', async (req, res) => {
  try {
    const { from, to, type } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: 'from, to are required' });
    }
    let reports: any[] = [];
    if (!type || type === 'all') {
      // 모든 타입을 병합해서 반환
      const types = ['personal', 'department', 'company', 'project'];
      for (const t of types) {
        const r = await getReportsByPeriodAndType(from as string, to as string, t);
        reports = reports.concat(r);
      }
    } else {
      reports = await getReportsByPeriodAndType(from as string, to as string, type as string);
    }
    return res.json({ reports });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST /api/analytics/generateReport - PDF 레포트 생성
router.post('/generateReport', async (req, res) => {
  try {
    // const { userId } = req.body;
    const userId = "user01";
    
    // if (!userId) {
    //   return res.status(400).json({ error: 'userId is required' });
    // }

    // (1) Firestore에서 3개월간 일정 데이터 조회
    const scheduleData = await getRecentPersonalSchedule();

    // (2) OpenAI 등 LLM으로 한글 요약/조언 생성
    const { summary, advice } = await getKoreanAnalysis(scheduleData);

    // (3) 통계표 등 시각 요약 데이터 준비
    const statsTable = makeStatsForPrompt(scheduleData);
    const periodLabel = `분석기간: ${getPeriodLabel(3)} (최근 3개월)`;

    // (4) 프론트에서 차트 이미지/설명 받기
    const { chartImages, chartDescriptions } = req.body;

    // (5) 실제 PDF 생성
    const pdfBuffer = await generatePDFBuffer(summary, advice, statsTable, scheduleData, periodLabel, chartImages, chartDescriptions);

    // (5-1) PDF 파일 저장
    const fileName = `report-${Date.now()}.pdf`;
    const uploadDir = path.join(__dirname, '../../kms');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    // (6) Firestore에 보고서 저장 (pdfUrl 추가)
    const pdfUrl = `/kms/${fileName}`;
    await db.collection('ComprehensiveAnalysisReport').add({
      userId,
      summary,
      statsTable,
      scheduleData,
      periodLabel,
      createdAt: new Date(),
      reportType: 'personal',
      pdfUrl,
    });

    // (7) PDF 파일 다운로드 응답
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(200).send(pdfBuffer);
  } catch (e) {
    console.error(e);
    res.status(500).send('보고서 생성 실패');
  }
});

export default router; 