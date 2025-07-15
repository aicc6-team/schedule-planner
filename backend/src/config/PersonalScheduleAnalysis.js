const admin = require('firebase-admin');
const dayjs = require('dayjs');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const userId = 'user_001';
const startDate = dayjs('2025-01-01');
const tags = ['업무', '회의', '개인', '기타', '교육', '점검'];
const emotions = [1, 2, 3, 4, 5]; // 1: 매우 나쁨, 5: 매우 좋음
const statuses = ['completed', 'late', 'not_done'];
const timeSlots = ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

async function seedData() {
  // 월별 데이터 생성
  for (let month = 0; month < 12; month++) {
    const currentDate = startDate.add(month, 'month');
    const monthStr = currentDate.format('YYYY-MM');
    
    // 해당 월의 일정 수 (100-200개)
    const totalSchedules = randomInt(100, 200);
    const completedSchedules = Math.floor(totalSchedules * randomFloat(0.7, 0.9, 2));
    
    // 시간대별 시작 일정 건수 분포
    const startTimeDistribution = {};
    timeSlots.forEach(slot => {
      startTimeDistribution[slot] = randomInt(10, 40);
    });
    
    // 시간대별 종료 일정 건수 분포
    const endTimeDistribution = {};
    timeSlots.forEach(slot => {
      endTimeDistribution[slot] = randomInt(8, 35);
    });
    
    // 태그별 완료율 및 평균 소요 시간
    const completionRateByTag = {};
    tags.forEach(tag => {
      completionRateByTag[tag] = {
        completion_rate: randomFloat(0.6, 0.95, 2),
        avg_duration: randomInt(30, 120) // 분
      };
    });
    
    // 소요 시간 분포 데이터 (15분, 30분, 1시간, 2시간, 4시간)
    const durationDistribution = {
      '15분': randomInt(20, 50),
      '30분': randomInt(30, 60),
      '1시간': randomInt(20, 40),
      '2시간': randomInt(10, 25),
      '4시간': randomInt(5, 15)
    };
    
    // 감정 상태별 업무 수
    const taskCountByEmotion = {};
    emotions.forEach(emotion => {
      taskCountByEmotion[emotion] = randomInt(15, 45);
    });
    
    // 상태별 업무 수
    const taskCountByStatus = {};
    statuses.forEach(status => {
      taskCountByStatus[status] = randomInt(20, 60);
    });
    
    // 시간대별 일정 건수
    const scheduleCountByTimeSlot = {};
    timeSlots.forEach(slot => {
      scheduleCountByTimeSlot[slot] = randomInt(15, 40);
    });
    
    // 시간 경과에 따른 누적 완료 업무 수 (일별)
    const cumulativeCompletions = {};
    const daysInMonth = currentDate.daysInMonth();
    let cumulative = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dailyCompletions = randomInt(2, 8);
      cumulative += dailyCompletions;
      cumulativeCompletions[day] = cumulative;
    }
    
    const data = {
      date: admin.firestore.Timestamp.fromDate(currentDate.toDate()),
      total_schedules: totalSchedules,
      completed_schedules: completedSchedules,
      start_time_distribution: startTimeDistribution,
      end_time_distribution: endTimeDistribution,
      completion_rate_by_tag: completionRateByTag,
      duration_distribution: durationDistribution,
      task_count_by_emotion: taskCountByEmotion,
      task_count_by_status: taskCountByStatus,
      schedule_count_by_time_slot: scheduleCountByTimeSlot,
      cumulative_completions: cumulativeCompletions,
    };

    const ref = db.collection('PersonalScheduleAnalysis').doc();
    await ref.set(data);
    console.log(`📅 ${monthStr} - 개인 일정 분석 데이터 추가 완료`);
  }

  console.log('✅ 모든 개인 일정 분석 데이터 삽입 완료!');
}

seedData();
