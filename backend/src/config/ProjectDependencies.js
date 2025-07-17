const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const projectIds = ['project_001', 'project_002', 'project_003', 'project_004', 'project_005'];
const steps = ['기획', '디자인', '개발', '테스트', '배포'];
const dependencyTypes = ['FS', 'SS', 'FF', 'SF']; // Finish-Start, Start-Start, Finish-Finish, Start-Finish

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

async function seedProjectDependencies() {
  for (const projectId of projectIds) {
    // 기본 순차 의존성 (기획 → 디자인 → 개발 → 테스트 → 배포)
    for (let i = 0; i < steps.length - 1; i++) {
      const from = steps[i];
      const to = steps[i + 1];

      const dependency = {
        project_id: projectId,
        from,
        to,
        planned_duration: randomInt(240, 480), // 4-8시간
        actual_duration: randomInt(200, 520), // 실제 소요시간 (계획 대비 ±20% 변동)
        dependency_type: 'FS', // Finish-Start (기본)
        lag: randomInt(0, 60), // 지연시간 (0-60분)
        critical_path: i === 0 || i === steps.length - 2, // 첫 번째와 마지막 의존성이 중요 경로
        risk_level: randomInt(1, 5), // 위험도 (1-5)
        created_at: admin.firestore.Timestamp.now(),
        updated_at: admin.firestore.Timestamp.now(),
      };

      const ref = db.collection('ProjectDependencies').doc();
      await ref.set(dependency);
      console.log(`🔗 ${projectId} - ${from} → ${to} 의존성 추가 완료`);
    }

    // 추가 크로스 의존성 (병렬 작업)
    const crossDependencies = [
      { from: '기획', to: '개발', type: 'SS' }, // 기획과 개발이 동시 시작
      { from: '디자인', to: '테스트', type: 'FF' }, // 디자인 완료 후 테스트 완료
    ];

    for (const crossDep of crossDependencies) {
      const dependency = {
        project_id: projectId,
        from: crossDep.from,
        to: crossDep.to,
        planned_duration: randomInt(120, 360), // 2-6시간
        actual_duration: randomInt(100, 400),
        dependency_type: crossDep.type,
        lag: randomInt(0, 30),
        critical_path: false,
        risk_level: randomInt(2, 4),
        created_at: admin.firestore.Timestamp.now(),
        updated_at: admin.firestore.Timestamp.now(),
      };

      const ref = db.collection('ProjectDependencies').doc();
      await ref.set(dependency);
      console.log(`🔗 ${projectId} - ${crossDep.from} → ${crossDep.to} (${crossDep.type}) 크로스 의존성 추가`);
    }
  }

  console.log('🎉 모든 프로젝트 의존성 데이터 삽입 완료!');
}

seedProjectDependencies();
