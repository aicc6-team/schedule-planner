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

async function seedProjectProgress() {
  for (const projectId of projectIds) {
    const time = [];
    const pct_complete = [];
    const milestone_achievements = [];
    const resource_utilization = [];
    const quality_metrics = [];
    const risk_indicators = [];

    let cumulativeProgress = 0;

    for (let i = 0; i < 30; i++) {
      const date = dayjs('2025-01-01').add(i, 'day');
      time.push(date.toDate());
      
      // 진행률 (S자 곡선 + 변동성)
      const baseProgress = (i / 30) * 100;
      const variation = randomInt(-3, 3);
      const dailyProgress = Math.max(0, Math.min(100, baseProgress + variation));
      
      // 누적 진행률 계산
      if (dailyProgress > cumulativeProgress) {
        cumulativeProgress = dailyProgress;
      }
      pct_complete.push(cumulativeProgress);
      
      // 마일스톤 달성 여부
      const currentStep = steps[Math.floor((i / 30) * steps.length)];
      const milestoneAchieved = i % 6 === 0 && randomInt(0, 1) === 1;
      
      milestone_achievements.push({
        date: date.toDate(),
        milestone: currentStep,
        achieved: milestoneAchieved,
        planned_date: date.toDate(),
        actual_date: milestoneAchieved ? date.toDate() : null,
        delay_days: milestoneAchieved ? 0 : randomInt(0, 3),
      });
      
      // 자원 활용률 (70-95%)
      resource_utilization.push({
        date: date.toDate(),
        utilization_rate: randomFloat(0.7, 0.95, 2),
        team_size: randomInt(3, 8),
        hours_worked: randomInt(160, 200), // 8시간 * 20-25일
        overtime_hours: randomInt(0, 20),
      });
      
      // 품질 지표
      quality_metrics.push({
        date: date.toDate(),
        defect_rate: randomFloat(0.01, 0.05, 3), // 1-5%
        code_coverage: randomFloat(0.75, 0.95, 2), // 75-95%
        test_pass_rate: randomFloat(0.85, 0.98, 2), // 85-98%
        customer_satisfaction: randomFloat(3.5, 5.0, 1), // 3.5-5.0
      });
      
      // 리스크 지표
      risk_indicators.push({
        date: date.toDate(),
        schedule_risk: randomFloat(0.1, 0.8, 2), // 10-80%
        budget_risk: randomFloat(0.05, 0.6, 2), // 5-60%
        technical_risk: randomFloat(0.1, 0.7, 2), // 10-70%
        resource_risk: randomFloat(0.05, 0.5, 2), // 5-50%
        overall_risk_score: randomFloat(0.1, 0.7, 2), // 10-70%
      });
    }

    const doc = {
      project_id: projectId,
      time,
      pct_complete,
      milestone_achievements,
      resource_utilization,
      quality_metrics,
      risk_indicators,
      total_duration: 30,
      start_date: admin.firestore.Timestamp.fromDate(dayjs('2025-01-01').toDate()),
      end_date: admin.firestore.Timestamp.fromDate(dayjs('2025-01-30').toDate()),
      created_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now(),
    };

    const ref = db.collection('ProjectProgress').doc();
    await ref.set(doc);
    console.log(`✅ ${projectId} - 프로젝트 진행률 타임라인 삽입 완료!`);
  }

  console.log('🎉 모든 프로젝트 진행률 데이터 삽입 완료!');
}

seedProjectProgress();
