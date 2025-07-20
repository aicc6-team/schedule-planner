'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar, Scatter, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
// import SankeyDiagram from './SankeyDiagram';
import { Chart as GoogleChart } from 'react-google-charts';
import html2canvas from 'html2canvas';
import React, { useRef } from 'react';

// ForceGraph2D를 동적 import로 변경하여 SSR 오류 방지
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">네트워크 그래프 로딩 중...</div>
});

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

// CompanyScheduleAnalysis 스키마에 맞는 인터페이스
interface CompanyScheduleAnalysis {
  schedule_id: string;                                    // 회사 일정 고유 아이디
  analysis_start_date: string | { toDate: () => Date };   // 분석 기간 시작일
  analysis_end_date: string | { toDate: () => Date };     // 분석 기간 종료일
  total_schedules: number;                               // 총 일정 건수
  schedule_duration_distribution: Record<string, number>; // 일정 기간별 분포
  time_slot_distribution: Record<string, number>;        // 시간대별 분포
  attendee_participation_counts: Record<string, number>; // 참석자별 참여 횟수
  organizer_schedule_counts: Record<string, number>;     // 주최 기관별 일정 수
  supporting_organization_collaborations: Array<{ from: string; to: string; count: number }>; // 협조 기관별 협력 네트워크
  monthly_schedule_counts: Record<string, number>;       // 월별 일정 건수 추이
  schedule_category_ratio: Record<string, number>;       // 일정 카테고리별 비율
  updated_at: string | { toDate: () => Date };           // 갱신 일시
}

// 날짜 변환 함수
function getDateString(date: string | { toDate: () => Date } | undefined): string {
  if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    return date.toDate().toLocaleDateString();
  }
  return date ? String(date) : '';
}

export default function CompanyAnalytics() {
  const [companyAnalysis, setCompanyAnalysis] = useState<CompanyScheduleAnalysis[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // 차트 ref 배열 (컴포넌트 함수 내부로 이동)
  const chartRefs = useMemo(
    () =>
      Array.from({ length: 8 }, () =>
        React.createRef<any>()
      ),
    []
  );
  const chartDescriptions = [
    '일정 기간별 분포: 일정의 전체 기간(소요 일수)을 구간별로 분포를 확인할 수 있는 히스토그램입니다.',
    '시간대별 일정 분포: 하루 중 어느 시간대에 일정이 집중되어 있는지 바그래프로 보여줍니다.',
    '참석자별 참여 횟수: 참석자별로 참여한 일정의 횟수를 막대그래프로 시각화합니다.',
    '협조 기관 네트워크: 협조 기관 간의 협력 관계를 네트워크 그래프로 나타냅니다.',
    '주최 기관별 일정 수: 주최 기관별로 등록된 일정의 개수를 막대그래프로 나타냅니다.',
    '일정 카테고리별 비율: 일정의 카테고리별(회의, 워크샵 등) 비율을 파이차트로 보여줍니다.',
    '월별 일정 건수 추이: 월별 전체 일정 건수의 변화를 선그래프로 보여줍니다.',
    '일정 기간 vs 참여자 수: 일정 기간과 그에 따른 참석자 수의 관계를 산점도로 시각화합니다.',
  ];

  const getRecent6Months = () => {
    const arr: string[] = [];
    const now = dayjs();
    for (let i = 5; i >= 0; i--) {
      arr.push(now.subtract(i, 'month').format('M월'));
    }
    return arr;
  };

  useEffect(() => {
    fetch('http://44.212.4.6:3001/api/analytics/companyTasks')
      .then(res => res.json())
      .then((data: CompanyScheduleAnalysis[]) => {
        // 데이터가 배열인지 확인하고 설정
        const analysisArray = Array.isArray(data) ? data : [];
        setCompanyAnalysis(analysisArray);
      })
      .catch((err) => {
        console.error(err);
        setCompanyAnalysis([]);
      });
  }, []);

  // 첫 번째 분석 데이터 가져오기 (가장 최근 데이터)
  const firstData = useMemo(() => {
    if (!Array.isArray(companyAnalysis) || companyAnalysis.length === 0) {
      return null;
    }
    return companyAnalysis[0];
  }, [companyAnalysis]);

  //1. 일정 기간별 분포 (파이차트)
  const durationDistribution = useMemo(() => {
    if (!firstData || !firstData.schedule_duration_distribution) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.schedule_duration_distribution);
    const data = Object.values(firstData.schedule_duration_distribution);

    return {
      labels,
      datasets: [
        {
          label: '일정 기간별 분포',
          data,
          backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'],
        },
      ],
    };
  }, [firstData]);

  //2. 시간대별 분포 (막대그래프)
  const timeSlotDistribution = useMemo(() => {
    if (!firstData || !firstData.time_slot_distribution) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.time_slot_distribution);
    const data = Object.values(firstData.time_slot_distribution);

    return {
      labels,
      datasets: [
        {
          label: '시간대별 일정 수',
          data,
          backgroundColor: '#3b82f6',
        },
      ],
    };
  }, [firstData]);

  //3. 참석자별 참여 횟수 (막대그래프)
  const attendeeParticipation = useMemo(() => {
    if (!firstData || !firstData.attendee_participation_counts) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.attendee_participation_counts);
    const data = Object.values(firstData.attendee_participation_counts);

    return {
      labels,
      datasets: [
        {
          label: '참여 횟수',
          data,
          backgroundColor: '#10b981',
        },
      ],
    };
  }, [firstData]);

  //4. 협조 기관 네트워크 그래프
  const orgNetworkGraph = useMemo(() => {
    if (!companyAnalysis || !Array.isArray(companyAnalysis) || !Array.isArray(companyAnalysis[0]?.supporting_organization_collaborations)) {
      return { nodes: [], links: [] };
    }
    const nodesSet = new Set<string>();
    const links: { source: string; target: string; value: number }[] = [];
  
    companyAnalysis[0].supporting_organization_collaborations.forEach((item: any) => {
      if (!item.from || !item.to) return;
      nodesSet.add(item.from);
      nodesSet.add(item.to);
      links.push({
        source: item.from,
        target: item.to,
        value: item.count || 1,
      });
    });
  
    // 노드 객체 변환
    const nodes = Array.from(nodesSet).map(id => ({ id }));
  
    return { nodes, links };
  }, [companyAnalysis]);

  //5. 주최 기관별 일정 수 (막대그래프)
  const organizerScheduleCounts = useMemo(() => {
    if (!firstData || !firstData.organizer_schedule_counts) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.organizer_schedule_counts);
    const data = Object.values(firstData.organizer_schedule_counts);

    return {
      labels,
      datasets: [
        {
          label: '일정 수',
          data,
          backgroundColor: '#f59e0b',
        },
      ],
    };
  }, [firstData]);

  //6. 일정 카테고리별 비율 (도넛차트)
  const categoryRatio = useMemo(() => {
    if (!firstData || !firstData.schedule_category_ratio) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.schedule_category_ratio);
    const data = Object.values(firstData.schedule_category_ratio);

    return {
      labels,
      datasets: [
        {
          label: '카테고리별 비율',
          data,
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
        },
      ],
    };
  }, [firstData]);

  //7. 월별 일정 건수 추이 (라인차트)
  const monthlyScheduleCounts = useMemo(() => {
    if (!firstData || !firstData.monthly_schedule_counts) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.monthly_schedule_counts).sort();
    const data = labels.map(month => firstData.monthly_schedule_counts[month] || 0);

    return {
      labels,
      datasets: [
        {
          label: '월별 일정 건수',
          data,
          borderColor: '#6366f1',
          backgroundColor: '#6366f133',
          borderWidth: 3,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#6366f1',
          pointRadius: 5,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [firstData]);

  //8. 일정 기간 vs 참여자 수 산점도
  const durationVsParticipants = useMemo(() => {
    if (!firstData || !firstData.schedule_duration_distribution || !firstData.attendee_participation_counts) {
      return { datasets: [] };
    }

    const durationKeys = Object.keys(firstData.schedule_duration_distribution);
    const attendeeKeys = Object.keys(firstData.attendee_participation_counts);
    
    // 두 데이터를 매칭하여 산점도 데이터 생성
    const data = durationKeys.map(duration => {
      const durationValue = firstData.schedule_duration_distribution[duration];
      const attendeeValue = firstData.attendee_participation_counts[duration] || 0;
      return {
        x: durationValue,
        y: attendeeValue,
      };
    });

    return {
      datasets: [
        {
          label: '기간 vs 참여자',
          data,
          backgroundColor: '#3b82f6',
          pointRadius: 6,
        },
      ],
    };
  }, [firstData]);

  //9. 총 일정 건수 및 통계 요약 (커스텀 카드)
  const summaryStats = useMemo(() => {
    if (!firstData) {
      return {
        totalSchedules: 0,
        totalAttendees: 0,
        totalOrganizers: 0,
        analysisPeriod: '',
      };
    }

    const totalAttendees = Object.values(firstData.attendee_participation_counts || {}).length;
    const totalOrganizers = Object.keys(firstData.organizer_schedule_counts || {}).length;
    const start = getDateString(firstData.analysis_start_date);
    const end = getDateString(firstData.analysis_end_date);
    const analysisPeriod = `${start} ~ ${end}`;

    return {
      totalSchedules: firstData.total_schedules || 0,
      totalAttendees,
      totalOrganizers,
      analysisPeriod,
    };
  }, [firstData]);

  // 회사 레포트 생성 함수
  const generateReport = async () => {
    console.log('companyAnalysis:', companyAnalysis);
    setIsGeneratingReport(true);
    try {
      if (!Array.isArray(companyAnalysis) || companyAnalysis.length === 0) {
        console.error('분석 데이터가 없습니다.');
        return;
      }
      
      // 차트 이미지 추출
      const chartImages = chartRefs.map(ref => ref.current?.toBase64Image?.() ?? null);

      // 2. 기존 fetch에 chartImages, chartDescriptions 추가
      const response = await fetch('http://44.212.4.6:3001/api/analytics/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyticsData: companyAnalysis,
          reportType: 'company',
          dateRange: {
            start: companyAnalysis[0]?.analysis_start_date || dayjs().format('YYYY-MM-DD'),
            end: companyAnalysis[0]?.analysis_end_date || dayjs().format('YYYY-MM-DD')
          },
          chartImages,
          chartDescriptions,
        }),
      });
      if (response.ok) {
        const pdfBlob = await response.blob();
        if (typeof window !== 'undefined') {
          const pdfUrl = window.URL.createObjectURL(pdfBlob);
          const pdfLink = document.createElement('a');
          pdfLink.href = pdfUrl;
          pdfLink.download = `company-analytics-report-${dayjs().format('YYYY-MM-DD')}.pdf`;
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

  return (
    <>
      {/* 레포트 버튼 섹션 */}
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#22223b] mb-2">회사 일정 분석</h2>
            <p className="text-gray-600 text-sm">
              {companyAnalysis.length > 0 && (
                <>
                  분석 기간: {getDateString(companyAnalysis[0]?.analysis_start_date)}
                  ~ {getDateString(companyAnalysis[0]?.analysis_end_date)}
                  <span className="mx-2">•</span>
                  총 {companyAnalysis[0]?.total_schedules ?? 0}개 일정
                  <span className="mx-2">•</span>
                  참석자 수: {Object.keys(companyAnalysis[0]?.attendee_participation_counts || {}).length}
                  <span className="mx-2">•</span>
                  주최 기관 수: {Object.keys(companyAnalysis[0]?.organizer_schedule_counts || {}).length}
                </>
              )}
            </p>
          </div>
          {(!Array.isArray(companyAnalysis) || companyAnalysis.length === 0) ? (
            <div className="text-gray-400 text-sm">데이터를 불러오는 중입니다...</div>
          ) : (
            <button
              onClick={generateReport}
              disabled={isGeneratingReport}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center space-x-2 ${
                isGeneratingReport
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
          )}
        </div>
      </div>
      {/* 3x3 그리드: 9개 회사 일정 분석 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* 1. 일정 기간별 분포 (파이차트) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
          <div className="font-semibold mb-3 text-[#22223b]">일정 기간별 분포</div>
          <div className="w-[270px] h-[270px] flex items-center justify-center">
            <Pie
              ref={chartRefs[0]}
              data={durationDistribution}
              options={{
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* 2. 시간대별 분포 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">시간대별 일정 분포</div>
          <div className="flex-1 flex items-center">
            <Bar
              ref={chartRefs[1]}
              data={{
                ...timeSlotDistribution,
                datasets: timeSlotDistribution.datasets.map(ds => ({
                  ...ds,
                  barThickness: 26,
                  maxBarThickness: 36,
                })),
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '일정 수' } } },
              }}
            />
          </div>
        </div>

        {/* 3. 참석자별 참여 횟수 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">참석자별 참여 횟수</div>
          <div className="flex-1 flex items-center">
            <Bar
              ref={chartRefs[2]}
              data={{
                ...attendeeParticipation,
                datasets: attendeeParticipation.datasets.map(ds => ({
                  ...ds,
                  barThickness: 26,
                  maxBarThickness: 36,
                })),
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '참여 횟수' } } },
              }}
            />
          </div>
        </div>

        {/* 4. 협조 기관 네트워크 그래프 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center justify-center min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">협조 기관 네트워크</div>
          <div className="w-full flex-1 flex items-center justify-center" style={{height:250}}>
          <ForceGraph2D
            ref={chartRefs[3]}
            graphData={orgNetworkGraph}
            width={420}
            height={360}
            nodeRelSize={12}
            cooldownTicks={90}
            // onEngineStop={fg => fg.zoomToFit(430, 60)}
            d3VelocityDecay={0.12}
            d3AlphaDecay={0.01}
            enableZoomInteraction={false}
            // d3Force="charge"
            // d3Charge={-520}
            linkWidth={link => 1 + (link.value || 1) * 0.7}
            linkColor={() => "rgba(100,100,100,0.35)"}  // 👈 회색(연하게)
            linkCurvature={0}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.id;
              ctx.font = `${Math.max(8, 10 / globalScale)}px Pretendard, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = node.color || '#22223b';
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 3;
              ctx.strokeText(label, node.x, node.y);
              ctx.fillText(label, node.x, node.y);
            }}
          />
          </div>
        </div>

        {/* 5. 주최 기관별 일정 수 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">주최 기관별 일정 수</div>
          <div className="flex-1 flex items-center">
            <Bar
              ref={chartRefs[4]}
              data={{
                ...organizerScheduleCounts,
                datasets: organizerScheduleCounts.datasets.map(ds => ({
                  ...ds,
                  barThickness: 26,
                  maxBarThickness: 36,
                })),
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '일정 수' } } },
              }}
            />
          </div>
        </div>

        {/* 6. 일정 카테고리별 비율 (도넛차트) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
          <div className="font-semibold mb-3 text-[#22223b]">일정 카테고리별 비율</div>
          <div className="w-[270px] h-[270px] flex items-center justify-center">
            <Doughnut
              ref={chartRefs[5]}
              data={categoryRatio}
              options={{
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* 7. 월별 일정 건수 추이 (라인차트) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">월별 일정 건수 추이</div>
          <div className="flex-1 flex items-center">
            <Line
              ref={chartRefs[6]}
              data={monthlyScheduleCounts}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '일정 건수' } } },
              }}
            />
          </div>
        </div>

        {/* 8. 일정 기간 vs 참여자 수 산점도 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">기간 vs 참여자 수</div>
          <div className="flex-1 flex items-center">
            <Scatter
              ref={chartRefs[7]}
              data={durationVsParticipants}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { title: { display: true, text: '일정 기간' } },
                  y: { title: { display: true, text: '참여자 수' } },
                },
              }}
            />
          </div>
        </div>

        {/* 9. 통계 요약 카드 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col justify-center">
          <div className="font-semibold mb-4 text-[#22223b] text-center">분석 요약</div>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summaryStats.totalSchedules}</div>
              <div className="text-sm text-gray-600">총 일정 건수</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-green-600">{summaryStats.totalAttendees}</div>
              <div className="text-sm text-gray-600">총 참석자 수</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-orange-600">{summaryStats.totalOrganizers}</div>
              <div className="text-sm text-gray-600">주최 기관 수</div>
            </div>
            <div className="text-center pt-2 border-t">
              <div className="text-xs text-gray-500">{summaryStats.analysisPeriod}</div>
              <div className="text-xs text-gray-500">분석 기간</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 