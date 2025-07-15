const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const departments = ['스마트앱개발팀', 'AI팀', '디자인팀', '기획팀', '영업팀'];
const organizers = ['인사팀', '기획팀', '개발팀', '디자인팀', '영업팀'];
const categories = ['회의', '교육', '행사', '점검', '기타'];
const timeSlots = ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'];
const attendees = ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_008'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

async function seedCompanyMetrics() {
  const analysisStartDate = dayjs('2025-01-01');
  const analysisEndDate = dayjs('2025-12-31');
  
  // 월별 데이터 생성
  for (let month = 0; month < 12; month++) {
    const currentDate = analysisStartDate.add(month, 'month');
    const monthStr = currentDate.format('YYYY-MM');
    
    // 해당 월의 일정 수 (20-50개)
    const totalSchedules = randomInt(20, 50);
    
    // 일정 기간별 분포 (30분, 1시간, 2시간, 4시간, 8시간)
    const scheduleDurationDistribution = {
      '30분': randomInt(5, 15),
      '1시간': randomInt(8, 20),
      '2시간': randomInt(3, 12),
      '4시간': randomInt(2, 8),
      '8시간': randomInt(1, 5)
    };
    
    // 시간대별 분포
    const timeSlotDistribution = {};
    timeSlots.forEach(slot => {
      timeSlotDistribution[slot] = randomInt(3, 12);
    });
    
    // 참석자별 참여 횟수
    const attendeeParticipationCounts = {};
    attendees.forEach(attendee => {
      attendeeParticipationCounts[attendee] = randomInt(5, 25);
    });
    
    // 주최 기관별 일정 수
    const organizerScheduleCounts = {};
    organizers.forEach(organizer => {
      organizerScheduleCounts[organizer] = randomInt(2, 10);
    });
    
    // 협조 기관별 협력 횟수
    const supportingOrganizationCollaborations = {};
    departments.forEach(dept => {
      supportingOrganizationCollaborations[dept] = randomInt(1, 8);
    });
    
    // 월별 일정 건수 추이 (이전 6개월)
    const monthlyScheduleCounts = {};
    for (let i = 5; i >= 0; i--) {
      const prevMonth = currentDate.subtract(i, 'month').format('YYYY-MM');
      monthlyScheduleCounts[prevMonth] = randomInt(15, 45);
    }
    
    // 일정 카테고리별 비율
    const scheduleCategoryRatio = {};
    categories.forEach(category => {
      scheduleCategoryRatio[category] = randomFloat(0.1, 0.4, 2);
    });
    
    const data = {
      schedule_id: `schedule_${monthStr}`,
      analysis_start_date: admin.firestore.Timestamp.fromDate(analysisStartDate.toDate()),
      analysis_end_date: admin.firestore.Timestamp.fromDate(analysisEndDate.toDate()),
      total_schedules: totalSchedules,
      schedule_duration_distribution: scheduleDurationDistribution,
      time_slot_distribution: timeSlotDistribution,
      attendee_participation_counts: attendeeParticipationCounts,
      organizer_schedule_counts: organizerScheduleCounts,
      supporting_organization_collaborations: supportingOrganizationCollaborations,
      monthly_schedule_counts: monthlyScheduleCounts,
      schedule_category_ratio: scheduleCategoryRatio,
      updated_at: admin.firestore.Timestamp.fromDate(new Date()),
    };

    const ref = db.collection('CompanyScheduleAnalysis').doc();
    await ref.set(data);
    console.log(`📅 ${monthStr} - 회사 일정 분석 데이터 추가 완료`);
  }

  console.log('✅ 모든 회사 일정 분석 데이터 삽입 완료!');
}

seedCompanyMetrics();
