'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartTypeRegistry } from 'chart.js';
import { Doughnut, Line, Bar, Scatter } from 'react-chartjs-2';
// import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import dayjs from 'dayjs';

// ChartJSOrUndefined 타입 직접 선언
type ChartJSOrUndefined<TType extends keyof ChartTypeRegistry = keyof ChartTypeRegistry> = ChartJS<TType> | undefined;

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

interface PersonalScheduleAnalysis {
  date: string;
  total_schedules: number;
  completed_schedules: number;
  start_time_distribution: Record<string, number>;
  end_time_distribution: Record<string, number>;
  completion_rate_by_tag: Record<string, { completion_rate: number; avg_duration: number }>;
  duration_distribution: Record<string, number>;
  task_count_by_emotion: Record<string, number>;
  task_count_by_status: Record<string, number>;
  schedule_count_by_time_slot: Record<string, number>;
  cumulative_completions: Record<string, number>;
}

export interface PersonalSchedule {
  id: string;              // 일정 고유 아이디 (pk)
  date: string;            // 일정 날짜 (YYYY-MM-DD)
  title: string;           // 일정 제목
  description: string;     // 일정 설명
  start_time: string;      // 일정 시작 시간 (ex: "2025-07-20T10:00:00Z" or "11:00")
  end_time: string;        // 일정 종료 시간 (ex: "2025-07-20T15:00:00Z" or "15:00")
  durationMinutes: number; // 업무 소요 시간 (분)
  status: string;          // 일정 상태 (완료, 지연 등)
  tag: string;             // 업무 태그
  emotion: string;         // 감정 상태
  created_at: string;      // 생성 일시 (ISO 8601 문자열)
  updated_at: string;      // 수정 일시 (ISO 8601 문자열)
  assignee?: string;       // 사용자 (필요시)
  durationHours?: number;  // 업무 소요 시간 (시, 선택적)
  hour?: number;           // 시작 시간의 시(hour) 값 (선택적)
  importance?: string;     // 중요도 (선택적)
  projectId?: string;      // 프로젝트 ID (선택적)
  time?: string;           // 시작 시각(문자열, 예: "11:00", 선택적)
}

const chartDescriptions = [
  '일별 이행률: 날짜별 전체 일정 중 완료된 일정의 비율을 선그래프로 보여줍니다.',
  '요일×시간대 완료율: 요일과 시간대별 일정 완료율을 히트맵으로 시각화합니다.',
  '태그별 완료율: 태그별 일정 완료율을 막대그래프로 비교합니다.',
  '소요시간 분포: 일정별 소요시간의 분포를 막대그래프로 나타냅니다.',
  '소요시간 vs 감정 산점도: 소요시간과 감정 상태의 관계를 산점도로 보여줍니다.',
  '태그별 시간 분포 비교: 태그별 평균 소요시간을 막대그래프로 비교합니다.',
  '상태 파이차트: 일정 상태(완료, 지연 등)별 비율을 파이차트로 나타냅니다.',
  '누적 완료 추이: 일정 완료 건수의 누적 변화를 면적 그래프로 시계열로 보여줍니다.',
  '시작/종료 시간 분포: 일정의 시작/종료 시간 분포를 막대그래프로 비교합니다.'
];

export default function PersonalAnalytics() {
  
  const [analyticsData, setAnalyticsData] = useState<PersonalScheduleAnalysis[]>([]);
  const [personalData, setPersonalData] = useState<PersonalSchedule[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // 차트 ref 배열 (컴포넌트 함수 내부로 이동)
  const chartRefs = useMemo(
    () =>
      Array.from({ length: 9 }, () =>
        React.createRef<ChartJSOrUndefined<keyof ChartTypeRegistry>>()
      ),
    []
  );

  // 시간대와 요일 정의 (컴포넌트 레벨에서 선언)
  const timeSlots = [
    { label: '09:00-11:00', start: 9, end: 11 },
    { label: '11:00-13:00', start: 11, end: 13 },
    { label: '13:00-15:00', start: 13, end: 15 },
    { label: '15:00-17:00', start: 15, end: 17 },
    { label: '17:00-19:00', start: 17, end: 19 }
  ];
  const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

  useEffect(() => {

    fetch('http://localhost:3001/api/analytics/personalTasks')
      .then(res => res.json())
      .then((data: PersonalScheduleAnalysis[]) => {

        // 데이터가 배열인지 확인하고 설정
        const analyticsArray = Array.isArray(data) ? data : [];
        setAnalyticsData(analyticsArray);

        setTimeout(() => {
          console.log('setAnalyticsData 직후 상태:', analyticsData);
        }, 100); // 상태 동기화 확인

      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/personal')
      .then(res => res.json())
      .then((data: PersonalSchedule[]) => {

        // 데이터가 배열인지 확인하고 설정
        const personalArray = Array.isArray(data) ? data : [];

        setPersonalData(personalArray);

        setTimeout(() => {
          console.log('setPersonalData 직후 상태:', personalData);
        }, 100); // 상태 동기화 확인

      })
      .catch(console.error);
  }, []);

  // 레포트 생성 함수
  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      if (!Array.isArray(analyticsData) || analyticsData.length === 0) {
        console.error('분석 데이터가 없습니다.');
        return;
      }

      // 차트 이미지 추출
      const chartImages = chartRefs.map(ref => {
        if (ref.current && typeof ref.current.toBase64Image === "function") {
          return ref.current.toBase64Image();
        }
        return null;
      });

      const chartInfo = chartRefs.map((ref, i) => ({
        idx: i,
        type: ref.current?.constructor?.name,
        hasToBase64: !!ref.current?.toBase64Image,
        current: ref.current
      }));

      const response = await fetch('http://localhost:3001/api/analytics/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyticsData,
          chartDescriptions,
          chartImages,
          reportType: 'personal',
          dateRange: {
            start: analyticsData[0]?.date || dayjs().format('YYYY-MM-DD'),
            end: analyticsData[analyticsData.length - 1]?.date || dayjs().format('YYYY-MM-DD')
          }
        }),
      });

      if (response.ok) {
        const pdfBlob = await response.blob();
        if (typeof window !== 'undefined') {
          const pdfUrl = window.URL.createObjectURL(pdfBlob);
          const pdfLink = document.createElement('a');
          pdfLink.href = pdfUrl;
          pdfLink.download = `personal-analytics-report-${dayjs().format('YYYY-MM-DD')}.pdf`;
          document.body.appendChild(pdfLink);
          pdfLink.click();
          window.URL.revokeObjectURL(pdfUrl);
          document.body.removeChild(pdfLink);
        }
      } else {
        console.error('PDF 레포트 생성 실패:', response.statusText);
      }
    } catch (error) {
      console.error('레포트 생성 실패:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Chart 1: 일별 완료율
  const dailyCompletion = useMemo(() => {
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) {
      return { labels: [], data: [] };
    }
    
    const labels = analyticsData.map(item => {
      const date = dayjs(item.date);
      return date.isValid() ? date.format('M/D') : 'Invalid Date';
    });
    const data = analyticsData.map(item => 
      item.total_schedules > 0 ? (item.completed_schedules / item.total_schedules) * 100 : 0
    );
    return { labels, data };
  }, [analyticsData]);

  // Chart 2: 요일×시간대 히트맵 (시간대별 일정 건수 기반)
  const timeHeatmap = useMemo(() => {
    
    if (!Array.isArray(personalData) || personalData.length === 0) {
      return Array.from({ length: 5 }, () => Array(7).fill(0));
    }
  
    // 집계용 배열
    const total = Array.from({ length: 5 }, () => Array(7).fill(0));
    const completed = Array.from({ length: 5 }, () => Array(7).fill(0));
  
    personalData.forEach(item => {
      // item.date(YYYY-MM-DD), item.hour(숫자), item.status(문자열)
      if (!item.date || typeof item.hour !== 'number') return;
  
      const dateObj = new Date(item.date);
      if (isNaN(dateObj.getTime())) return;
      // 요일 인덱스: 월(0)~일(6)
      const jsDay = dateObj.getDay();
      const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
  
      timeSlots.forEach((tb, ti) => {
        if (item.hour !== undefined && item.hour >= tb.start && item.hour < tb.end) {
          total[ti][dayIdx]++;
          if (item.status === "완료" || item.status === "completed") completed[ti][dayIdx]++;
        }
      });
    });
  
    // 완료율(%) 반환
    const heatmapData = total.map((row, ti) =>
      row.map((cnt, wi) => cnt > 0 ? Math.round((completed[ti][wi] / cnt) * 100) : 0)
    );
  
    return heatmapData;
  }, [personalData, timeSlots]);

  // Chart 3: 태그별 완료율
  const tagStats = useMemo(() => {
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) return { labels: [], data: [] };
    
    const firstData = analyticsData[0];
    if (!firstData || !firstData.completion_rate_by_tag) return { labels: [], data: [] };
    
    const labels = Object.keys(firstData.completion_rate_by_tag);
    const data = labels.map(tag => firstData.completion_rate_by_tag[tag].completion_rate * 100);
    
    return { labels, data };
  }, [analyticsData]);

  // Chart 4: 소요시간 분포
  const durationHistogram = useMemo(() => {
    if (!Array.isArray(personalData) || personalData.length === 0) {
      return { labels: [], data: [] };
    }
  
    // 히스토그램 구간 정의 (단위: 분)
    const bins = [
      { label: "0~30", min: 0, max: 30 },
      { label: "31~60", min: 31, max: 60 },
      { label: "61~90", min: 61, max: 90 },
      { label: "91~120", min: 91, max: 120 },
      { label: "121+", min: 121, max: Infinity }
    ];
  
    const binCounts = bins.map(() => 0);
  
    personalData.forEach(item => {
      const mins = item.durationMinutes;
      if (typeof mins !== 'number') return;
      const idx = bins.findIndex(bin => mins >= bin.min && mins <= bin.max);
      if (idx >= 0) binCounts[idx]++;
    });
  
    return {
      labels: bins.map(bin => bin.label),
      data: binCounts
    };
  }, [personalData]);

  // Chart 5: 소요시간 vs 감정 산점도
  const emotionMap: { [key: string]: number } = {
    'happy': 2,
    'normal': 1,
    'sad': 0,
    'angry': 0
  };

  // 역매핑용 배열 [0]=부정, 1=보통, 2=긍정
  const emotionLabels = ['부정', '보통', '긍정'];

  const emotionStats = useMemo(() => {
    if (!Array.isArray(personalData) || personalData.length === 0) return [];
    return personalData
      .filter(item => typeof item.durationMinutes === 'number' && typeof item.emotion === 'string')
      .map(item => ({
        x: item.durationMinutes,
        y: emotionMap[item.emotion] ?? null
      }))
      .filter(point => point.y !== null);
  }, [personalData]);
  

  // Chart 6: 태그별 시간 분포 비교
  const avgDurationByTag = useMemo(() => {
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) return { labels: [], data: [] };
  
    const firstData = analyticsData[0];
    if (!firstData || !firstData.completion_rate_by_tag) return { labels: [], data: [] };
  
    const labels = Object.keys(firstData.completion_rate_by_tag);
    const data = labels.map(tag =>
      firstData.completion_rate_by_tag[tag]?.avg_duration ?? 0
    );
  
    return { labels, data };
  }, [analyticsData]);

  // Chart 7: 상태 파이차트
  const statusPie = useMemo(() => {
    if (!Array.isArray(personalData) || personalData.length === 0) return { labels: [], data: [] };
  
    // 상태별 집계
    const statusCount: Record<string, number> = {};
    personalData.forEach(item => {
      if (item.status) {
        statusCount[item.status] = (statusCount[item.status] || 0) + 1;
      }
    });
  
    const labels = Object.keys(statusCount);
    const data = labels.map(label => statusCount[label]);
  
    return { labels, data };
  }, [personalData]);

  // Chart 8: 누적 완료 영역 차트
  const cumulativeCompletion = useMemo(() => {
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) {
      return { labels: [], datasets: [] };
    }
    // 모든 날짜별 누적값을 합침
    const dateMap: Record<string, number> = {};
    analyticsData.forEach(item => {
      if (item.cumulative_completions) {
        Object.entries(item.cumulative_completions).forEach(([date, value]) => {
          dateMap[date] = value;
        });
      }
    });
    // 날짜 오름차순 정렬
    const sortedDates = Object.keys(dateMap).sort();
    const rawData = sortedDates.map(date => dateMap[date]);
    // 월별 리셋을 방지: 값이 감소하면 이전까지의 누적합을 더해서 이어붙임
    let offset = 0;
    let prev = rawData[0] ?? 0;
    const cumulativeData = rawData.map((val, idx) => {
      if (idx === 0) {
        prev = val;
        return val;
      }
      if (val < prev) {
        offset += prev;
      }
      prev = val;
      return val + offset;
    });
    return {
      labels: sortedDates,
      datasets: [
        {
          label: '누적 완료건수',
          data: cumulativeData,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.18)',
          borderColor: '#3b82f6',
          borderWidth: 0.2,
          tension: 2.0, // 더 부드럽게
          pointRadius: 0, // 동그라미 제거
          pointHoverRadius: 0, // 호버 동그라미도 제거
        }
      ]
    };
  }, [analyticsData]);
  

  // Chart 9: 시간대별 집중도 면적그래프
  const timeDistributionComparison = useMemo(() => {
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) return { labels: [], datasets: [] };
    
    const firstData = analyticsData[0];
    if (!firstData || !firstData.start_time_distribution || !firstData.end_time_distribution) {
      return { labels: [], datasets: [] };
    }
    
    const labels = Object.keys(firstData.start_time_distribution);
    
    return {
      labels,
      datasets: [
        {
          label: '시작 시간',
          data: Object.values(firstData.start_time_distribution),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: '#3b82f6',
        },
        {
          label: '종료 시간',
          data: Object.values(firstData.end_time_distribution),
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: '#ef4444',
        },
      ],
    };
  }, [analyticsData]);

  // Chart 10: 태그별 평균 소요시간
  const avgDurationByTag2 = useMemo(() => {
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) return { labels: [], data: [] };
    
    const firstData = analyticsData[0];
    if (!firstData || !firstData.completion_rate_by_tag) return { labels: [], data: [] };
    
    const labels = Object.keys(firstData.completion_rate_by_tag);
    const data = labels.map(tag => firstData.completion_rate_by_tag[tag].avg_duration);
    
    return { labels, data };
  }, [analyticsData]);

  return (
    <>
      {/* 레포트 버튼 섹션 */}
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#22223b] mb-2">개인 일정 분석</h2>
            <p className="text-gray-600 text-sm">
              {analyticsData.length > 0 && (
                <>
                  분석 기간: {
                    (() => {
                      const startDate = dayjs(analyticsData[0].date);
                      const endDate = dayjs(analyticsData[analyticsData.length - 1].date);
                      return `${startDate.isValid() ? startDate.format('YYYY-MM-DD') : 'Invalid Date'} ~ ${endDate.isValid() ? endDate.format('YYYY-MM-DD') : 'Invalid Date'}`;
                    })()
                  }
                  <span className="mx-2">•</span>
                  총 {analyticsData.reduce((sum, item) => sum + item.total_schedules, 0)}개 일정
                  <span className="mx-2">•</span>
                  평균 완료율: {analyticsData.length > 0 
                    ? (analyticsData.reduce((sum, item) => sum + (item.completed_schedules / item.total_schedules), 0) / analyticsData.length * 100).toFixed(1)
                    : 0}%
                </>
              )}
            </p>
          </div>
          <button
            onClick={generateReport}
            disabled={isGeneratingReport || analyticsData.length === 0}
            className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center space-x-2 ${
              isGeneratingReport || analyticsData.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'
            }`}
          >
            {isGeneratingReport ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>레포트 생성 중...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>레포트 다운로드</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3x3 그리드: 9개 개인 일정 분석 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* 1. 일별 이행률 (선그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">일별 이행률</div>
          <div className="flex-1 flex items-center">
            <Line 
              ref={chartRefs[0] as any}
              data={{ 
                labels: dailyCompletion.labels, 
                datasets: [{ 
                  label: '완료율 %', 
                  data: dailyCompletion.data, 
                  borderColor: '#3b82f6' 
                }] 
              }} 
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  y: { min: 0, max: 100, title: { display: true, text: '이행률(%)' } }
                },
                maintainAspectRatio: false,
              }} 
            />
          </div>
        </div>

        {/* 2. 요일×시간대 히트맵 (커스텀) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">요일×시간대 완료율</div>
          {/* 히트맵: 커스텀 렌더링 */}
          <div className="flex-1 flex items-center">
            <div className="flex flex-col items-center ml-8">
              <div className="flex">
                {/* 좌측 시간대 라벨 */}
                <div className="flex flex-col justify-center mr-2">
                  {timeSlots.map((block) => (
                    <div key={block.label} className="h-9 flex items-center justify-end text-[#7b8794] text-sm" style={{height:36}}>
                      {block.label}
                    </div>
                  ))}
                </div>
                {/* 메인 히트맵 */}
                <div className="flex flex-col">
                  {timeHeatmap.map((row, i) => (
                    <div key={i} className="flex mb-1 last:mb-0">
                      {row.map((val, j) => {
                        let color = 'bg-blue-50';
                        if(val >= 80) color = 'bg-blue-700';
                        else if(val >= 70) color = 'bg-blue-500';
                        else if(val >= 60) color = 'bg-blue-300';
                        else if(val >= 50) color = 'bg-blue-100';
                        return (
                          <div
                            key={j}
                            className={`rounded-lg ${color}`}
                            style={{width: 36, height: 36, marginRight: j < row.length - 1 ? 8 : 0}}
                          >
                            <span className="text-xs text-white font-bold flex items-center justify-center h-full w-full">
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              {/* 하단 요일 라벨 */}
              <div className="flex mt-3 ml-28">
                {weekdays.map((label, idx) => (
                  <div
                    key={label + idx}
                    className="text-center text-[#7b8794] text-sm"
                    style={{width: 36, marginRight: idx < 6 ? 8 : 0}}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. 태그별 완료율 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">태그별 완료율</div>
          <div className="flex-1 flex items-center justify-center">
            <Bar
              ref={chartRefs[2] as any}
              data={{
                labels: tagStats.labels,
                datasets: [{
                  label: '완료율(%)',
                  data: tagStats.data,
                  backgroundColor: [
                    '#93c5fd', // 연파랑
                    '#fcd34d', // 연노랑
                    '#6ee7b7', // 연초록
                    '#c4b5fd', // 연보라
                    '#fca5a5', // 연빨강
                    '#a7f3d0', // 민트
                    '#f9a8d4', // 연핑크
                    '#fde68a', // 연주황
                    '#fbcfe8', // 연분홍
                    '#ddd6fe', // 연보라2
                  ],
                  barThickness: 26,
                  maxBarThickness: 36,
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { min: 0, max: 100, title: { display: true, text: '완료율(%)' } } },
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>

        {/* 4. 소요시간 분포 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">소요시간 분포</div>
          <div className="flex-1 flex items-center justify-center">
            <Bar
              ref={chartRefs[3] as any}
              data={{
                labels: durationHistogram.labels,
                datasets: [{
                  label: '건수',
                  data: durationHistogram.data,
                  backgroundColor: '#6366f1',
                  barThickness: 26,
                  maxBarThickness: 36,
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: '건수' },
                    ticks: {
                      callback: function(value) {
                        return Number(value).toFixed(0);
                      }
                    }
                  }
                },
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>

        {/* 5. 소요시간 vs 감정 산점도 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">소요시간 vs 감정 산점도</div>
          <div className="flex-1 flex items-center justify-center">
            <Scatter
              data={{
                datasets: [
                  {
                    label: '업무별 소요시간 vs 감정',
                    data: emotionStats,
                    pointRadius: 6,
                    backgroundColor: '#f59e42'
                  }
                ]
              }}
              options={{
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: {
                    title: { display: true, text: '소요시간(분)' }
                  },
                  y: {
                    title: { display: true, text: '감정' },
                    min: 0,
                    max: 2,
                    ticks: {
                      stepSize: 1,
                      callback: function(value) {
                        // emotionLabels[0]=부정, 1=보통, 2=긍정
                        return emotionLabels[value as number] ?? value;
                      }
                    }
                  }
                }
              }}
              height={200}
            />
          </div>
        </div>

        {/* 6. 태그별 시간 분포 비교 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">태그별 시간 분포 비교</div>
          <div className="flex-1 flex items-center justify-center">
          <Bar
            data={{
              labels: avgDurationByTag.labels,
              datasets: [{
                label: '평균 소요시간(분)',
                data: avgDurationByTag.data,
                backgroundColor: [
                  '#93c5fd', // 연파랑
                  '#fcd34d', // 연노랑
                  '#6ee7b7', // 연초록
                  '#c4b5fd', // 연보라
                  '#fca5a5', // 연빨강
                  '#a7f3d0', // 민트
                  '#f9a8d4', // 연핑크
                  '#fde68a', // 연주황
                  '#fbcfe8', // 연분홍
                  '#ddd6fe', // 연보라2
                ],
                barThickness: 26,
                maxBarThickness: 36,
              }]
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: '평균 소요시간(분)' }
                }
              }
            }}
            height={180}
          />
          </div>
        </div>

        {/* 7. 상태 파이차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">상태 파이차트</div>
          <div className="w-[270px] h-[270px] mx-auto flex items-center justify-center">
            <Doughnut
              data={{
                labels: statusPie.labels,
                datasets: [{
                  data: statusPie.data,
                  backgroundColor: [
                    '#3b82f6', // 파랑(완료)
                    '#f59e42', // 주황(지연)
                    '#6366f1', // 보라(진행중)
                    '#10b981', // 초록(기타)
                    '#ef4444', // 빨강(취소 등)
                  ]
                }]
              }}
              options={{
                plugins: {
                  legend: { position: 'bottom' }
                }
              }}
              height={220}
            />
          </div>
        </div>

        {/* 8. 누적 완료 영역 차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">누적 완료 추이</div>
          <div className="flex-1 flex items-center justify-center">
          <Line
            data={cumulativeCompletion}
            options={{
              plugins: { legend: { display: false } },
              elements: {
                point: {
                  radius: 0,
                  hoverRadius: 0,
                }
              },
              scales: {
                x: { title: { display: true, text: '일(day)' } },
                y: {
                  beginAtZero: true,
                  title: { display: true, text: '누적 완료' }
                }
              }
            }}
            height={180}
          />
          </div>
        </div>

        {/* 9. 시작/종료 시간 분포 비교 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">시작/종료 시간 분포</div>
          <div className="flex-1 flex items-center justify-center">
            <Bar
              ref={chartRefs[8] as any}
              data={
                {
                  ...timeDistributionComparison,
                  datasets: timeDistributionComparison.datasets.map(ds => ({
                    ...ds,
                    barThickness: 26,
                    maxBarThickness: 36,
                  })),
                }
              }
              options={{
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '일정 건수' } } },
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>
      </div>
    </>
  );
} 