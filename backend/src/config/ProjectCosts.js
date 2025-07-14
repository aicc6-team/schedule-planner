const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const projectIds = ['project_001', 'project_002', 'project_003', 'project_004', 'project_005'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

async function seedProjectCosts() {
  for (const projectId of projectIds) {
    const time = [];
    const cum_cost = [];
    const daily_cost = [];
    const budget_variance = [];

    let cost = 0;
    let totalBudget = randomInt(50000000, 200000000); // 5천만원-2억원 총 예산
    let plannedDailyCost = totalBudget / 30; // 30일 기준 일일 계획 비용

    for (let i = 0; i < 30; i++) {
      const date = dayjs('2025-01-01').add(i, 'day');
      time.push(date.toDate());
      
      // 일일 비용 (계획 대비 ±20% 변동)
      const dailyVariation = randomFloat(0.8, 1.2, 2);
      const currentDailyCost = Math.floor(plannedDailyCost * dailyVariation);
      daily_cost.push(currentDailyCost);
      
      cost += currentDailyCost;
      cum_cost.push(cost);
      
      // 예산 대비 편차 (%)
      const variance = ((cost - (plannedDailyCost * (i + 1))) / (plannedDailyCost * (i + 1))) * 100;
      budget_variance.push(randomFloat(-15, 15, 1));
    }

    const doc = {
      project_id: projectId,
      time,
      cum_cost,
      daily_cost,
      budget_variance,
      total_budget: totalBudget,
      created_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now(),
    };

    const ref = db.collection('ProjectCosts').doc();
    await ref.set(doc);
    console.log(`✅ ${projectId} - 누적 비용 타임라인 삽입 완료!`);
  }

  console.log('🎉 모든 프로젝트 비용 데이터 삽입 완료!');
}

seedProjectCosts();
