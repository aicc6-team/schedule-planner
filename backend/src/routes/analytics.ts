import express from 'express';
import { db } from '../config/firebase';
import { DocumentSnapshot } from 'firebase-admin/firestore';
import { 
  getRecentPersonalSchedule, 
  getKoreanAnalysis, 
  makeStatsForPrompt, 
  getPeriodLabel, 
  // makeKoreanReportDoc, 
  saveReportRecord,
  generatePDFBuffer
} from '../services/analyticsService';

// DepartmentScheduleAnalysis 인터페이스 정의 (camelCase 적용)
interface DepartmentScheduleAnalysis {
  departmentName: string;           // 부서명
  date: string;                     // 분석 날짜
  averageDelayPerMember: Record<string, number>; // 팀원별 평균 응답 및 지연 시간
  scheduleTypeRatio: Record<string, number>;     // 일정 유형별 비율
  bottleneckTimeSlots: Record<string, Record<string, number>>; // 시간대별 병목 현상 건수
  collaborationNetwork: Record<string, string[]>; // 협업 네트워크 참여 횟수
  workloadByMemberAndType: Record<string, Record<string, number>>; // 팀원별 업무 유형별 투입 시간
  executionTimeStats: Record<string, { min: number; max: number; median: number }>; // 업무 수행시간 통계
  qualityStats: Record<string, { avg: number; min: number; max: number }>; // 업무 품질 통계
  monthlyScheduleTrends: Record<string, number>; // 월별 일정 건수 추이
  issueOccurrenceRate: Record<string, Record<string, number>>; // 태그별, 팀별 지연 건수
}

// CompanyScheduleAnalysis 인터페이스 정의 (camelCase 적용)
interface CompanyScheduleAnalysis {
  scheduleId: string;                                     // 회사 일정 고유 아이디
  analysisStartDate: string;                              // 분석 기간 시작일
  analysisEndDate: string;                                // 분석 기간 종료일
  totalSchedules: number;                                 // 총 일정 건수
  scheduleDurationDistribution: Record<string, number>;   // 일정 기간별 분포
  timeSlotDistribution: Record<string, number>;           // 시간대별 분포
  attendeeParticipationCounts: Record<string, number>;    // 참석자별 참여 횟수
  organizerScheduleCounts: Record<string, number>;        // 주최 기관별 일정 수
  supportingOrganizationCollaborations: Record<string, string[]>; // 협조 기관별 협력 횟수
  monthlyScheduleCounts: Record<string, number>;          // 월별 일정 건수 추이
  scheduleCategoryRatio: Record<string, number>;          // 일정 카테고리별 비율
  updatedAt: string;                                      // 갱신 일시
}

// ProjectScheduleAnalysis 인터페이스 정의 (camelCase 적용)
interface ProjectScheduleAnalysis {
  projectId: string;                           // 프로젝트 ID
  date: string;                                // 분석 날짜
  taskList: string[];                          // 작업 리스트
  startDates: Record<string, string>;          // 시작일 리스트
  durations: Record<string, number>;           // 단계별 기간
  dependencies: Record<string, string[]>;      // 작업 간 종속 관계
  plannedCompletionDates: Record<string, string>; // 계획 완료일 리스트
  actualCompletionDates: Record<string, string>;  // 실제 완료일 리스트
  simulationCompletionDates: string[];        // 완료일 시뮬레이션
  progress: Record<string, number>;            // 단계별 진행률
  delayTimes: Record<string, number>;          // 단계별 지연 시간
  intervals: Record<string, number>;           // 단계 간 간격
  cumulativeBudget: Record<string, number>;    // 예산 누적 소모
  stageStatus: Record<string, string>;         // 단계별 상태 (완료, 진행, 지연)
}

const router = express.Router();

// GET /api/analytics/personalTasks - PersonalScheduleAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/personalTasks', async (_req, res) => {
  try {
    const snapshot = await db.collection('PersonalScheduleAnalysis').get();
    
    const tasks = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching personal tasks:', error);
    res.status(500).json({ error: 'Failed to fetch personal tasks' });
  }
});

// GET /api/analytics/departmentTasks - DepartmentScheduleAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/departmentTasks', async (req, res) => {
  try {
    const { departmentName, date } = req.query;
    
    let query: any = db.collection('DepartmentScheduleAnalysis');
    
    // 부서명 필터링
    if (departmentName) {
      query = query.where('department_name', '==', departmentName);
    }
    
    // 날짜 필터링
    if (date) {
      query = query.where('date', '==', date);
    }
    
    const snapshot = await query.get();
    
    const analysis = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as unknown as DepartmentScheduleAnalysis[];

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
    const { scheduleId, analysisStartDate, analysisEndDate } = req.query;
    
    let query: any = db.collection('CompanyScheduleAnalysis');
    
    // schedule_id 필터링
    if (scheduleId) {
      query = query.where('schedule_id', '==', scheduleId);
    }
    
    // 분석 시작일 필터링
    if (analysisStartDate) {
      query = query.where('analysis_start_date', '==', analysisStartDate);
    }
    
    // 분석 종료일 필터링
    if (analysisEndDate) {
      query = query.where('analysis_end_date', '==', analysisEndDate);
    }
    
    const snapshot = await query.get();
    
    const analysis = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as unknown as CompanyScheduleAnalysis[];

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
    const { projectId, date } = req.query;
    
    let query: any = db.collection('ProjectScheduleAnalysis');
    
    // project_id 필터링
    if (projectId) {
      query = query.where('project_id', '==', projectId);
    }
    
    // 날짜 필터링
    if (date) {
      query = query.where('date', '==', date);
    }
    
    const snapshot = await query.get();
    
    const analysis = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as unknown as ProjectScheduleAnalysis[];

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

    // (6) Firestore에 보고서 저장
    await saveReportRecord(userId, summary, statsTable, scheduleData, periodLabel);

    // (7) PDF 파일 다운로드 응답
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="personal-analytics-report-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.status(200).send(pdfBuffer);
  } catch (e) {
    console.error(e);
    res.status(500).send('보고서 생성 실패');
  }
});

export default router; 