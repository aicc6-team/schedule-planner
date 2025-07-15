const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const projectIds = ['project_001', 'project_002', 'project_003', 'project_004', 'project_005'];
const steps = ['기획', '디자인', '개발', '테스트', '배포'];
const statuses = ['completed', 'in_progress', 'delayed'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

async function seedProjectTasks() {
  const startDate = dayjs('2025-01-01');
  
  // 월별 데이터 생성
  for (let month = 0; month < 12; month++) {
    const currentDate = startDate.add(month, 'month');
    const monthStr = currentDate.format('YYYY-MM');
    
    for (const projectId of projectIds) {
      // 작업 리스트
      const taskList = steps.map(step => `${step} 단계`);
      
      // 시작일 리스트 (각 단계별로 2-3일 간격)
      const startDates = [];
      let currentStartDate = currentDate;
      for (let i = 0; i < steps.length; i++) {
        startDates.push(currentStartDate.format('YYYY-MM-DD'));
        currentStartDate = currentStartDate.add(randomInt(2, 3), 'day');
      }
      
      // 단계별 기간 (2-5일)
      const durations = steps.map(() => randomInt(2, 5));
      
      // 작업 간 종속 관계
      const dependencies = [];
      for (let i = 1; i < steps.length; i++) {
        dependencies.push({
          from: steps[i-1],
          to: steps[i],
          planned_duration: randomInt(1, 3)
        });
      }
      
      // 계획 완료일 리스트
      const plannedCompletionDates = [];
      let plannedDate = currentDate;
      for (let i = 0; i < steps.length; i++) {
        plannedDate = plannedDate.add(durations[i], 'day');
        plannedCompletionDates.push(plannedDate.format('YYYY-MM-DD'));
      }
      
      // 실제 완료일 리스트 (계획보다 0-3일 지연)
      const actualCompletionDates = plannedCompletionDates.map(date => {
        const delay = randomInt(0, 3);
        return dayjs(date).add(delay, 'day').format('YYYY-MM-DD');
      });
      
      // 완료일 시뮬레이션 (몬테카를로 시뮬레이션 결과)
      const simulationCompletionDates = [];
      for (let i = 0; i < 10; i++) {
        const simDate = dayjs(plannedCompletionDates[plannedCompletionDates.length - 1])
          .add(randomInt(-2, 5), 'day')
          .format('YYYY-MM-DD');
        simulationCompletionDates.push(simDate);
      }
      
      // 단계별 진행률 (0-100%)
      const progress = steps.map(() => randomInt(0, 100));
      
      // 단계별 지연 시간 (0-120분)
      const delayTimes = steps.map(() => randomInt(0, 120));
      
      // 단계 간 간격 (0-2일)
      const intervals = [];
      for (let i = 1; i < steps.length; i++) {
        intervals.push(randomInt(0, 2));
      }
      
      // 예산 누적 소모 (단계별로 증가)
      const cumulativeBudget = [];
      let totalBudget = 0;
      for (let i = 0; i < steps.length; i++) {
        const stepBudget = randomInt(1000000, 3000000); // 100만원-300만원
        totalBudget += stepBudget;
        cumulativeBudget.push(totalBudget);
      }
      
      // 단계별 상태
      const stageStatus = steps.map(() => statuses[randomInt(0, statuses.length - 1)]);
      
      const data = {
        project_id: projectId,
        date: admin.firestore.Timestamp.fromDate(currentDate.toDate()),
        task_list: taskList,
        start_dates: startDates,
        durations: durations,
        dependencies: dependencies,
        planned_completion_dates: plannedCompletionDates,
        actual_completion_dates: actualCompletionDates,
        simulation_completion_dates: simulationCompletionDates,
        progress: progress,
        delay_times: delayTimes,
        intervals: intervals,
        cumulative_budget: cumulativeBudget,
        stage_status: stageStatus,
      };

      const ref = db.collection('ProjectScheduleAnalysis').doc();
      await ref.set(data);
    }

    console.log(`📅 ${monthStr} - 프로젝트 ${projectIds.length}개 데이터 추가 완료`);
  }

  console.log('✅ 모든 프로젝트 일정 분석 데이터 삽입 완료!');
}

seedProjectTasks();
