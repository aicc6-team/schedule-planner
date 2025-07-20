const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const departments = ['스마트앱개발팀', 'AI팀', '디자인팀', '기획팀', '영업팀'];
const members = ['김민준', '이서영', '박지후', '최예린', '정현우', '조민서', '장하준', '오유진'];
const scheduleTypes = ['회의', '개발', '검토', '기획'];
const timeSlots = ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

function generateCollaborationNetwork(members, minLinks = 2, maxLinks = 4) {
  const links = [];
  for (const from of members) {
    const numLinks = randomInt(minLinks, maxLinks);
    const candidates = members.filter(m => m !== from);
    const shuffled = candidates.sort(() => Math.random() - 0.5);
    for (let i = 0; i < numLinks; i++) {
      const to = shuffled[i % shuffled.length];
      if (links.some(link => link.from === from && link.to === to)) continue;
      links.push({
        from,
        to,
        count: randomInt(1, 10)
      });
    }
  }
  return links;
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
      
      // ForceGraph2D용 협업 네트워크
      const collaborationNetwork = generateCollaborationNetwork(members);
      
      // 팀원별 업무 유형별 투입 시간
      const workloadByMemberAndType = {};
      members.forEach(member => {
        workloadByMemberAndType[member] = {};
        scheduleTypes.forEach(type => {
          workloadByMemberAndType[member][type] = randomInt(20, 120); // 분
        });
      });
      
      // 업무 수행시간 통계 (팀원별)
      const executionTimeStats = {};
      members.forEach(member => {
        executionTimeStats[member] = {
          min: randomInt(15, 45),
          max: randomInt(120, 300),
          median: randomInt(60, 120)
        };
      });
      
      // 업무 품질 vs 투입 시간 산점도용 데이터 (배열)
      const qualityStats = Array.from({ length: 15 }, () => ({
        quality: randomFloat(3.0, 5.0, 1), // 품질점수(1~5)
        time: randomInt(30, 300) // 투입 시간(분)
      }));
      
      // 월별 일정 건수 추이 (이전 6개월)
      const monthlyScheduleTrends = {};
      for (let i = 5; i >= 0; i--) {
        const prevMonth = currentDate.subtract(i, 'month').format('YYYY-MM');
        monthlyScheduleTrends[prevMonth] = randomInt(50, 150);
      }

      // total_schedules: 최근 3개월치만 합산
      const trendMonths = Object.keys(monthlyScheduleTrends).sort(); // 오름차순
      const last3Months = trendMonths.slice(-3); // 최근 3개월
      const totalSchedules = last3Months.reduce((sum, m) => sum + monthlyScheduleTrends[m], 0);
      
      // 완료된 일정 수 (예: 전체 일정의 60~90%를 랜덤으로 완료된 것으로 설정)
      const completedSchedules = randomInt(Math.floor(totalSchedules * 0.6), Math.floor(totalSchedules * 0.9));

      // 태그별, 팀별 지연 건수
      const issueOccurrenceRate = {};
      scheduleTypes.forEach(type => {
        issueOccurrenceRate[type] = {};
        departments.forEach(dep => {
          issueOccurrenceRate[type][dep] = randomInt(2, 15);
        });
      });
      
      const data = {
        department_name: department,
        date: admin.firestore.Timestamp.fromDate(currentDate.toDate()),
        average_delay_per_member: averageDelayPerMember,
        schedule_type_ratio: scheduleTypeRatio,
        bottleneck_time_slots: bottleneckTimeSlots,
        collaboration_network: collaborationNetwork, // ForceGraph2D용 배열
        workload_by_member_and_type: workloadByMemberAndType,
        execution_time_stats: executionTimeStats,
        quality_stats: qualityStats,
        monthly_schedule_trends: monthlyScheduleTrends,
        issue_occurrence_rate: issueOccurrenceRate,
        total_schedules: totalSchedules, // 추가
        completed_schedules: completedSchedules,
      };

      const ref = db.collection('DepartmentScheduleAnalysis').doc();
      await ref.set(data);
    }

    console.log(`📅 ${monthStr} - 부서 ${departments.length}개 데이터 추가 완료`);
  }

  console.log('✅ 모든 부서 일정 분석 데이터 삽입 완료!');
}

seedDepartmentTasks();
