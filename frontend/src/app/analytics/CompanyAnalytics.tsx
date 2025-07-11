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

// CompanyScheduleAnalysis 스키마에 맞는 인터페이스 (camelCase 적용)
interface CompanyScheduleAnalysis {
  scheduleId: string;                                     // 회사 일정 고유 아이디
  analysisStartDate: string | { toDate: () => Date };     // 분석 기간 시작일
  analysisEndDate: string | { toDate: () => Date };       // 분석 기간 종료일
  totalSchedules: number;                                 // 총 일정 건수
  scheduleDurationDistribution: Record<string, number>;   // 일정 기간별 분포
  timeSlotDistribution: Record<string, number>;           // 시간대별 분포
  attendeeParticipationCounts: Record<string, number>;    // 참석자별 참여 횟수
  organizerScheduleCounts: Record<string, number>;        // 주최 기관별 일정 수
  supportingOrganizationCollaborations: Record<string, string[]>; // 협조 기관별 협력 횟수
  monthlyScheduleCounts: Record<string, number>;          // 월별 일정 건수 추이
  scheduleCategoryRatio: Record<string, number>;          // 일정 카테고리별 비율
  updatedAt: string | { toDate: () => Date };             // 갱신 일시
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

  // 차트별 ref 생성
  const chartRefs = [
    useRef<HTMLDivElement>(null), // 1. 일정 기간별 분포
    useRef<HTMLDivElement>(null), // 2. 시간대별 분포
    useRef<HTMLDivElement>(null), // 3. 참석자별 참여 횟수
    useRef<HTMLDivElement>(null), // 4. 협조 기관 네트워크
    useRef<HTMLDivElement>(null), // 5. 주최 기관별 일정 수
    useRef<HTMLDivElement>(null), // 6. 일정 카테고리별 비율
    useRef<HTMLDivElement>(null), // 7. 월별 일정 건수 추이
    useRef<HTMLDivElement>(null), // 8. 일정 기간 vs 참여자 수
  ];
  const chartDescriptions = [
    '일정 기간별 분포',
    '시간대별 일정 분포',
    '참석자별 참여 횟수',
    '협조 기관 네트워크',
    '주최 기관별 일정 수',
    '일정 카테고리별 비율',
    '월별 일정 건수 추이',
    '일정 기간 vs 참여자 수',
  ];

  // 차트 캡처 함수
  const captureCharts = async () => {
    const images: string[] = [];
    for (const ref of chartRefs) {
      if (ref.current) {
        const canvas = await html2canvas(ref.current);
        images.push(canvas.toDataURL('image/png'));
      } else {
        images.push('');
      }
    }
    return images;
  };

  const getRecent6Months = () => {
    const arr: string[] = [];
    const now = dayjs();
    for (let i = 5; i >= 0; i--) {
      arr.push(now.subtract(i, 'month').format('M월'));
    }
    return arr;
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/companyTasks')
      .then(res => res.json())
      .then((data: CompanyScheduleAnalysis[]) => {
        // 데이터가 배열인지 확인하고 설정
        const analysisArray = Array.isArray(data) ? data : [];
        setCompanyAnalysis(analysisArray);
      })
      .catch(console.error);
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
    if (!firstData || !firstData.scheduleDurationDistribution) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.scheduleDurationDistribution);
    const data = Object.values(firstData.scheduleDurationDistribution);

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
    if (!firstData || !firstData.timeSlotDistribution) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.timeSlotDistribution);
    const data = Object.values(firstData.timeSlotDistribution);

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
    if (!firstData || !firstData.attendeeParticipationCounts) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.attendeeParticipationCounts);
    const data = Object.values(firstData.attendeeParticipationCounts);

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
  const collaborationNetwork = useMemo(() => {
    if (!firstData || !firstData.supportingOrganizationCollaborations) {
      return { nodes: [], links: [] };
    }

    const nodes = new Set<string>();
    const edges: { from: string; to: string }[] = [];

    Object.entries(firstData.supportingOrganizationCollaborations).forEach(([organization, collaborators]) => {
      nodes.add(organization);
      
      // collaborators가 배열인지 확인하고 안전하게 처리
      if (Array.isArray(collaborators)) {
        collaborators.forEach(collaborator => {
          if (typeof collaborator === 'string') {
            nodes.add(collaborator);
            edges.push({ from: organization, to: collaborator });
          }
        });
      } else if (typeof collaborators === 'string') {
        // collaborators가 단일 문자열인 경우
        nodes.add(collaborators);
        edges.push({ from: organization, to: collaborators });
      } else if (typeof collaborators === 'object' && collaborators !== null) {
        // collaborators가 객체인 경우 (값들을 배열로 처리)
        Object.values(collaborators).forEach(collaborator => {
          if (typeof collaborator === 'string') {
            nodes.add(collaborator);
            edges.push({ from: organization, to: collaborator });
          }
        });
      }
    });

    const nodeArray = Array.from(nodes).map(id => ({ id, name: id }));
    const linkArray = edges.map(edge => ({ source: edge.from, target: edge.to }));

    return { nodes: nodeArray, links: linkArray };
  }, [firstData]);

  //5. 주최 기관별 일정 수 (막대그래프)
  const organizerSchedules = useMemo(() => {
    if (!firstData || !firstData.organizerScheduleCounts) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.organizerScheduleCounts);
    const data = Object.values(firstData.organizerScheduleCounts);

    return {
      labels,
      datasets: [
        {
          label: '주최 일정 수',
          data,
          backgroundColor: '#8b5cf6',
        },
      ],
    };
  }, [firstData]);

  //6. 일정 카테고리별 비율 (도넛차트)
  const categoryRatio = useMemo(() => {
    if (!firstData || !firstData.scheduleCategoryRatio) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.scheduleCategoryRatio);
    const data = Object.values(firstData.scheduleCategoryRatio);

    return {
      labels,
      datasets: [
        {
          label: '카테고리별 비율',
          data,
          backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'],
        },
      ],
    };
  }, [firstData]);

  //7. 월별 일정 건수 추이 (선그래프)
  const monthlyTrends = useMemo(() => {
    if (!firstData || !firstData.monthlyScheduleCounts) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.monthlyScheduleCounts);
    const data = Object.values(firstData.monthlyScheduleCounts);

    return {
      labels,
      datasets: [
        {
          label: '월별 일정 건수',
          data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [firstData]);

  //8. 일정 기간 vs 참여자 수 (산점도)
  const durationVsParticipants = useMemo(() => {
    if (!firstData || !firstData.scheduleDurationDistribution || !firstData.attendeeParticipationCounts) {
      return { datasets: [] };
    }

    // 임시 데이터 생성 (실제로는 더 복잡한 로직이 필요)
    const scatterData = Object.keys(firstData.scheduleDurationDistribution).map((duration, index) => ({
      x: firstData.scheduleDurationDistribution[duration],
      y: Object.values(firstData.attendeeParticipationCounts)[index] || 0,
      label: duration,
    }));

    return {
      datasets: [
        {
          label: '일정 기간 vs 참여자 수',
          data: scatterData,
          backgroundColor: '#ef4444',
          pointRadius: 6,
          pointHoverRadius: 8,
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

    const totalAttendees = Object.values(firstData.attendeeParticipationCounts || {}).reduce((sum, count) => sum + count, 0);
    const totalOrganizers = Object.keys(firstData.organizerScheduleCounts || {}).length;
    const start = getDateString(firstData.analysisStartDate);
    const end = getDateString(firstData.analysisEndDate);
    const analysisPeriod = `${start} ~ ${end}`;

    return {
      totalSchedules: firstData.totalSchedules || 0,
      totalAttendees,
      totalOrganizers,
      analysisPeriod,
    };
  }, [firstData]);

  // 회사 레포트 생성 함수
  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      if (!Array.isArray(companyAnalysis) || companyAnalysis.length === 0) {
        console.error('분석 데이터가 없습니다.');
        return;
      }
      // 1. 차트 이미지 캡처
      const chartImages = await captureCharts();
      // 2. 기존 fetch에 chartImages, chartDescriptions 추가
      const response = await fetch('http://localhost:3001/api/analytics/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyticsData: companyAnalysis,
          reportType: 'company',
          dateRange: {
            start: companyAnalysis[0]?.analysisStartDate || dayjs().format('YYYY-MM-DD'),
            end: companyAnalysis[0]?.analysisEndDate || dayjs().format('YYYY-MM-DD')
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
                  분석 기간: {getDateString(companyAnalysis[0]?.analysisStartDate)}
                  ~ {getDateString(companyAnalysis[0]?.analysisEndDate)}
                  <span className="mx-2">•</span>
                  총 {companyAnalysis[0]?.totalSchedules ?? 0}개 일정
                  <span className="mx-2">•</span>
                  참석자 수: {Object.keys(companyAnalysis[0]?.attendeeParticipationCounts || {}).length}
                  <span className="mx-2">•</span>
                  주최 기관 수: {Object.keys(companyAnalysis[0]?.organizerScheduleCounts || {}).length}
                </>
              )}
            </p>
          </div>
          <button
            onClick={generateReport}
            disabled={isGeneratingReport || companyAnalysis.length === 0}
            className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center space-x-2 ${
              isGeneratingReport || companyAnalysis.length === 0
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
      {/* 3x3 그리드: 9개 회사 일정 분석 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* 1. 일정 기간별 분포 (파이차트) */}
        <div ref={chartRefs[0]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
          <div className="font-semibold mb-3 text-[#22223b]">일정 기간별 분포</div>
          <div className="w-[270px] h-[270px] flex items-center justify-center">
            <Pie
              data={durationDistribution}
              options={{
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* 2. 시간대별 분포 (막대그래프) */}
        <div ref={chartRefs[1]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">시간대별 일정 분포</div>
          <div className="flex-1 flex items-center">
            <Bar
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
        <div ref={chartRefs[2]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">참석자별 참여 횟수</div>
          <div className="flex-1 flex items-center">
            <Bar
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
        <div ref={chartRefs[3]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center justify-center min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">협조 기관 네트워크</div>
          <div className="w-full flex-1 flex items-center justify-center" style={{height:250}}>
            <ForceGraph2D
              graphData={collaborationNetwork}
              nodeLabel={(node: any) => node.name}
              nodeAutoColorBy="group"
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              width={250}
              height={250}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = '#22223b';
                ctx.fillText(label, node.x, node.y + 8);
              }}
            />
          </div>
        </div>

        {/* 5. 주최 기관별 일정 수 (막대그래프) */}
        <div ref={chartRefs[4]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">주최 기관별 일정 수</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                ...organizerSchedules,
                datasets: organizerSchedules.datasets.map(ds => ({
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
        <div ref={chartRefs[5]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
          <div className="font-semibold mb-3 text-[#22223b]">일정 카테고리별 비율</div>
          <div className="w-[270px] h-[270px] flex items-center justify-center">
            <Doughnut
              data={categoryRatio}
              options={{
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* 7. 월별 일정 건수 추이 (선그래프) */}
        <div ref={chartRefs[6]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">월별 일정 건수 추이</div>
          <div className="flex-1 flex items-center">
            <Line
              data={monthlyTrends}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '일정 건수' } } },
              }}
            />
          </div>
        </div>

        {/* 8. 일정 기간 vs 참여자 수 (산점도) */}
        <div ref={chartRefs[7]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">일정 기간 vs 참여자 수</div>
          <div className="flex-1 flex items-center">
            <Scatter
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