const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const projectIds = ['project_001', 'project_002', 'project_003', 'project_004', 'project_005'];
const steps = ['기획', '디자인', '개발', '테스트', '배포'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

// 정규분포를 시뮬레이션하는 함수
function normalDistribution(mean, stdDev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

async function seedProjectSimulations() {
  for (const projectId of projectIds) {
    // 시뮬레이션 설정
    const simulationCount = 1000; // 1000회 시뮬레이션
    const baseCompletionDate = dayjs('2025-01-01').add(25, 'day'); // 기본 완료일
    
    // 시뮬레이션 완료일 생성 (정규분포 기반)
    const sim_dates = [];
    for (let i = 0; i < simulationCount; i++) {
      const variation = normalDistribution(0, 3); // 평균 0, 표준편차 3일
      const completionDate = baseCompletionDate.add(Math.round(variation), 'day');
      sim_dates.push(completionDate.toDate());
    }
    
    // 단계별 지연 데이터 (각 단계별로 다른 특성)
    const step_delays = steps.map((step, index) => {
      const baseDelay = [10, 15, 30, 20, 10][index]; // 각 단계별 기본 지연시간
      const delays = [];
      
      for (let i = 0; i < 100; i++) {
        // 각 단계별로 다른 지연 패턴
        let delay;
        switch (step) {
          case '기획':
            delay = Math.max(0, normalDistribution(baseDelay, 5)); // 안정적
            break;
          case '디자인':
            delay = Math.max(0, normalDistribution(baseDelay, 8)); // 중간 변동성
            break;
          case '개발':
            delay = Math.max(0, normalDistribution(baseDelay, 15)); // 높은 변동성
            break;
          case '테스트':
            delay = Math.max(0, normalDistribution(baseDelay, 10)); // 중간 변동성
            break;
          case '배포':
            delay = Math.max(0, normalDistribution(baseDelay, 5)); // 안정적
            break;
          default:
            delay = Math.max(0, normalDistribution(baseDelay, 10));
        }
        delays.push(Math.round(delay));
      }
      
      return {
        step,
        delays,
        avg_delay: Math.round(delays.reduce((a, b) => a + b, 0) / delays.length),
        max_delay: Math.max(...delays),
        min_delay: Math.min(...delays),
        std_deviation: Math.round(
          Math.sqrt(
            delays.reduce((sum, delay) => sum + Math.pow(delay - baseDelay, 2), 0) / delays.length
          )
        ),
      };
    });
    
    // 리스크 분석 결과
    const completionDates = sim_dates.map(date => dayjs(date));
    const sortedDates = completionDates.sort((a, b) => a.unix() - b.unix());
    
    const risk_analysis = {
      completion_probability: randomFloat(0.75, 0.95, 2),
      expected_completion_date: sortedDates[Math.floor(simulationCount * 0.5)].toDate(), // 중앙값
      confidence_interval: {
        lower: sortedDates[Math.floor(simulationCount * 0.1)].toDate(), // 10% 분위수
        upper: sortedDates[Math.floor(simulationCount * 0.9)].toDate(), // 90% 분위수
      },
      risk_level: randomInt(1, 5), // 1-5 위험도
      critical_path_probability: randomFloat(0.6, 0.9, 2),
    };
    
    // 시뮬레이션 메타데이터
    const simulation_metadata = {
      total_simulations: simulationCount,
      simulation_date: admin.firestore.Timestamp.now(),
      base_completion_date: admin.firestore.Timestamp.fromDate(baseCompletionDate.toDate()),
      confidence_level: 0.9, // 90% 신뢰수준
      monte_carlo_iterations: simulationCount,
      risk_threshold: 0.8, // 80% 위험 임계값
    };
    
    // 시나리오 분석
    const scenario_analysis = {
      best_case: {
        probability: randomFloat(0.05, 0.15, 2),
        completion_date: sortedDates[Math.floor(simulationCount * 0.05)].toDate(),
        description: "모든 단계가 계획대로 진행되는 경우"
      },
      most_likely: {
        probability: randomFloat(0.6, 0.8, 2),
        completion_date: sortedDates[Math.floor(simulationCount * 0.5)].toDate(),
        description: "일반적인 진행 상황"
      },
      worst_case: {
        probability: randomFloat(0.05, 0.15, 2),
        completion_date: sortedDates[Math.floor(simulationCount * 0.95)].toDate(),
        description: "모든 단계에서 지연이 발생하는 경우"
      }
    };

    const doc = {
      project_id: projectId,
      sim_dates,
      step_delays,
      risk_analysis,
      simulation_metadata,
      scenario_analysis,
      created_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now(),
    };

    const ref = db.collection('ProjectSimulations').doc();
    await ref.set(doc);
    console.log(`✅ ${projectId} - 몬테카를로 시뮬레이션 데이터 삽입 완료!`);
  }

  console.log('🎉 모든 프로젝트 시뮬레이션 데이터 삽입 완료!');
}

seedProjectSimulations();
