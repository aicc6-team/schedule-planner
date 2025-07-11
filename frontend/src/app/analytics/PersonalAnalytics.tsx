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

const chartDescriptions = [
  '일별 이행률: 각 날짜별로 전체 일정 중 완료된 일정의 비율을 보여줍니다.',
  '요일×시간대 히트맵: 요일과 시간대별로 일정 완료율의 분포를 시각화합니다.',
  '태그별 완료율: 일정에 부여된 태그별로 완료율을 비교합니다.',
  '소요시간 분포: 일정별 소요시간의 분포를 보여줍니다.',
  '감정 상태별 업무 수: 감정 상태(예: 긍정, 부정)별로 업무 건수를 집계합니다.',
  '상태별 업무 수: 일정의 상태(예: 완료, 진행중 등)별로 업무 건수를 집계합니다.',
  '시간대별 일정 건수: 시간대별로 생성된 일정의 건수를 보여줍니다.',
  '누적 완료 추이: 일정 완료 건수의 누적 변화를 시계열로 보여줍니다.',
  '시작/종료 시간 분포: 일정의 시작/종료 시간이 어떻게 분포되어 있는지 비교합니다.',
  '태그별 평균 소요시간: 태그별로 평균 소요시간을 비교합니다.'
];

export default function PersonalAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<PersonalScheduleAnalysis[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // 차트 ref 배열 (컴포넌트 함수 내부로 이동)
  const chartRefs = useMemo(
    () =>
      Array.from({ length: 9 }, () =>
        React.createRef<ChartJSOrUndefined<keyof ChartTypeRegistry>>()
      ),
    []
  );

  useEffect(() => {

    fetch('http://localhost:3001/api/analytics/personalTasks')
      .then(res => res.json())
      .then((data: PersonalScheduleAnalysis[]) => {

        console.log('패치받은 데이터', data);
        // 데이터가 배열인지 확인하고 설정
        const analyticsArray = Array.isArray(data) ? data : [];
        setAnalyticsData(analyticsArray);


        setTimeout(() => {
          console.log('setAnalyticsData 직후 상태:', analyticsData);
        }, 100); // 상태 동기화 확인

      })
      .catch(console.error);
  }, []);

  console.log('generateReport에서 analyticsData:', analyticsData);

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


      console.log('chartInfo --------------------', analyticsData);
      
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
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) {
      return [];
    }
    
    const timeSlots = ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'];
    const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
    
    // 각 요일별로 시간대별 일정 건수 계산
    const heatmapData = timeSlots.map(() => 
      weekdays.map(() => Math.floor(Math.random() * 20) + 10) // 임시 데이터
    );
    
    return heatmapData;
  }, [analyticsData]);

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
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) return { labels: [], data: [] };
    
    const firstData = analyticsData[0];
    if (!firstData || !firstData.duration_distribution) return { labels: [], data: [] };
    
    const labels = Object.keys(firstData.duration_distribution);
    const data = Object.values(firstData.duration_distribution);
    
    return { labels, data };
  }, [analyticsData]);

  // Chart 5: 감정 상태별 업무 수
  const emotionStats = useMemo(() => {
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) return { labels: [], data: [] };
    
    const firstData = analyticsData[0];
    if (!firstData || !firstData.task_count_by_emotion) return { labels: [], data: [] };
    
    const labels = Object.keys(firstData.task_count_by_emotion);
    const data = Object.values(firstData.task_count_by_emotion);
    
    return { labels, data };
  }, [analyticsData]);

  // Chart 6: 상태별 업무 수
  const statusStats = useMemo(() => {
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) return { labels: [], data: [] };
    
    const firstData = analyticsData[0];
    if (!firstData || !firstData.task_count_by_status) return { labels: [], data: [] };
    
    const labels = Object.keys(firstData.task_count_by_status);
    const data = Object.values(firstData.task_count_by_status);
    
    return { labels, data };
  }, [analyticsData]);

  // Chart 7: 시간대별 일정 건수
  const timeSlotStats = useMemo(() => {
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) return { labels: [], data: [] };
    
    const firstData = analyticsData[0];
    if (!firstData || !firstData.schedule_count_by_time_slot) return { labels: [], data: [] };
    
    const labels = Object.keys(firstData.schedule_count_by_time_slot);
    const data = Object.values(firstData.schedule_count_by_time_slot);
    
    return { labels, data };
  }, [analyticsData]);

  // Chart 8: 누적 완료 추이
  const cumulativeCompletion = useMemo(() => {
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    const sortedData = [...analyticsData].sort((a, b) => {
      const dateA = dayjs(a.date);
      const dateB = dayjs(b.date);
      if (!dateA.isValid() || !dateB.isValid()) return 0;
      return dateA.unix() - dateB.unix();
    });
    
    const labels = sortedData.map(item => {
      const date = dayjs(item.date);
      return date.isValid() ? date.format('M/D') : 'Invalid Date';
    });
    const data = sortedData.map(item => {
      const cumulativeData = item.cumulative_completions;
      return cumulativeData && Object.keys(cumulativeData).length > 0 
        ? cumulativeData[Object.keys(cumulativeData)[0]] || 0 
        : 0;
    });
    
    return {
      labels,
      datasets: [
        {
          label: '누적 완료건수',
          data,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3b82f6',
          tension: 0.4,
        },
      ],
    };
  }, [analyticsData]);

  // Chart 9: 시작/종료 시간 분포 비교
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
  const avgDurationByTag = useMemo(() => {
    if (!Array.isArray(analyticsData) || analyticsData.length === 0) return { labels: [], data: [] };
    
    const firstData = analyticsData[0];
    if (!firstData || !firstData.completion_rate_by_tag) return { labels: [], data: [] };
    
    const labels = Object.keys(firstData.completion_rate_by_tag);
    const data = labels.map(tag => firstData.completion_rate_by_tag[tag].avg_duration);
    
    return { labels, data };
  }, [analyticsData]);
  

  console.log('렌더 중 analyticsData:', analyticsData);


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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">요일×시간대 완료율</div>
          {/* 히트맵: 커스텀 렌더링 */}
          <div className="flex">
            <div className="flex flex-col justify-center mr-2">
              {['09-11','11-13','13-15','15-17','17-19'].map((block) => (
                <div key={block} className="h-9 flex items-center justify-end text-[#7b8794] text-sm" style={{height:36}}>{block}</div>
              ))}
            </div>
            <div className="flex flex-col">
              {timeHeatmap.map((row,i) => (
                <div key={i} className="flex mb-1 last:mb-0">
                  {row.map((val,j) => {
                    let color = 'bg-blue-50';
                    if(val>=80) color='bg-blue-700';
                    else if(val>=70) color='bg-blue-500';
                    else if(val>=60) color='bg-blue-300';
                    else if(val>=50) color='bg-blue-100';
                    return <div key={j} className={`rounded-lg ${color}`} style={{width:36,height:36,marginRight:j<row.length-1?8:0}}><span className="text-xs text-white font-bold flex items-center justify-center h-full w-full">{val}</span></div>;
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex mt-3 ml-12">
            {['월','화','수','목','금','토','일'].map((label,idx) => (
              <div key={label+idx} className="w-9 text-center text-[#7b8794] text-sm" style={{width:36,marginRight:idx<6?8:0}}>{label}</div>
            ))}
          </div>
        </div>

        {/* 3. 태그별 완료율 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">태그별 완료율</div>
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
            }}
            height={180}
          />
        </div>

        {/* 4. 소요시간 분포 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">소요시간 분포</div>
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
              scales: { y: { beginAtZero: true, title: { display: true, text: '건수' } } },
            }}
            height={180}
          />
        </div>

        {/* 5. 감정 상태별 업무 수 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">감정 상태별 업무 수</div>
          <Bar
            ref={chartRefs[4] as any}
            data={{
              labels: emotionStats.labels,
              datasets: [{
                label: '업무 수',
                data: emotionStats.data,
                backgroundColor: '#8b5cf6',
                barThickness: 26,
                maxBarThickness: 36,
              }],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '업무 수' } } },
            }}
            height={180}
          />
        </div>

        {/* 6. 상태별 업무 수 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">상태별 업무 수</div>
          <Bar
            ref={chartRefs[5] as any}
            data={{
              labels: statusStats.labels,
              datasets: [{
                label: '업무 수',
                data: statusStats.data,
                backgroundColor: '#3b82f6',
                barThickness: 26,
                maxBarThickness: 36,
              }],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '업무 수' } } },
            }}
            height={180}
          />
        </div>

        {/* 7. 시간대별 일정 건수 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">시간대별 일정 건수</div>
          <Bar
            ref={chartRefs[6] as any}
            data={{
              labels: timeSlotStats.labels,
              datasets: [{
                label: '일정 건수',
                data: timeSlotStats.data,
                backgroundColor: '#10b981',
                barThickness: 26,
                maxBarThickness: 36,
              }],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '일정 건수' } } },
            }}
            height={180}
          />
        </div>

        {/* 8. 누적 완료 영역차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">누적 완료 추이</div>
          <Line
            ref={chartRefs[7] as any}
            data={cumulativeCompletion}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '누적 완료' } } },
            }}
            height={180}
          />
        </div>

        {/* 9. 시작/종료 시간 분포 비교 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">시작/종료 시간 분포</div>
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
            }}
            height={180}
          />
        </div>
      </div>
    </>
  );
} 