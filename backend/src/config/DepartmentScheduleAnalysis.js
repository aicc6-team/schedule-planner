const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const departments = ['스마트앱개발팀', 'AI팀', '디자인팀', '기획팀', '영업팀'];
const members = ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_008'];
const scheduleTypes = ['회의', '개발', '검토', '기획', '디자인', '테스트'];
const timeSlots = ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

async function seedDepartmentTasks() {
  const startDate = dayjs('2025-01-01');
  
  // 월별 데이터 생성
  for (let month = 0; month < 12; month++) {
    const currentDate = startDate.add(month, 'month');
    const monthStr = currentDate.format('YYYY-MM');
    
    for (const department of departments) {
      // 팀원별 평균 응답 및 지연 시간
      const averageDelayPerMember = {};
      members.forEach(member => {
        averageDelayPerMember[member] = {
          response_time: randomInt(5, 30), // 분
          delay_time: randomInt(0, 60)     // 분
        };
      });
      
      // 일정 유형별 비율
      const scheduleTypeRatio = {};
      scheduleTypes.forEach(type => {
        scheduleTypeRatio[type] = randomFloat(0.05, 0.35, 2);
      });
      
      // 시간대별 병목 현상 건수
      const bottleneckTimeSlots = {};
      timeSlots.forEach(slot => {
        bottleneckTimeSlots[slot] = randomInt(0, 5);
      });
      
      // 협업 네트워크 참여 횟수
      const collaborationNetwork = {};
      members.forEach(member => {
        collaborationNetwork[member] = randomInt(10, 50);
      });
      
      // 팀원별 업무 유형별 투입 시간
      const workloadByMemberAndType = {};
      members.forEach(member => {
        workloadByMemberAndType[member] = {};
        scheduleTypes.forEach(type => {
          workloadByMemberAndType[member][type] = randomInt(20, 120); // 분
        });
      });
      
      // 업무 수행시간 통계
      const executionTimeStats = {
        min: randomInt(15, 45),
        max: randomInt(120, 300),
        median: randomInt(60, 120)
      };
      
      // 업무 품질 통계
      const qualityStats = {
        average: randomFloat(3.5, 4.8, 1),
        min: randomInt(2, 4),
        max: randomInt(4, 5)
      };
      
      // 월별 일정 건수 추이 (이전 6개월)
      const monthlyScheduleTrends = {};
      for (let i = 5; i >= 0; i--) {
        const prevMonth = currentDate.subtract(i, 'month').format('YYYY-MM');
        monthlyScheduleTrends[prevMonth] = randomInt(50, 150);
      }
      
      // 태그별, 팀별 지연 건수
      const issueOccurrenceRate = {};
      scheduleTypes.forEach(type => {
        issueOccurrenceRate[type] = randomInt(2, 15);
      });
      
      const data = {
        department_name: department,
        date: admin.firestore.Timestamp.fromDate(currentDate.toDate()),
        average_delay_per_member: averageDelayPerMember,
        schedule_type_ratio: scheduleTypeRatio,
        bottleneck_time_slots: bottleneckTimeSlots,
        collaboration_network: collaborationNetwork,
        workload_by_member_and_type: workloadByMemberAndType,
        execution_time_stats: executionTimeStats,
        quality_stats: qualityStats,
        monthly_schedule_trends: monthlyScheduleTrends,
        issue_occurrence_rate: issueOccurrenceRate,
      };

      const ref = db.collection('DepartmentScheduleAnalysis').doc();
      await ref.set(data);
    }

    console.log(`📅 ${monthStr} - 부서 ${departments.length}개 데이터 추가 완료`);
  }

  console.log('✅ 모든 부서 일정 분석 데이터 삽입 완료!');
}

seedDepartmentTasks();
