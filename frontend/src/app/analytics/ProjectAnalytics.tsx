'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar, Scatter, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import GanttChart from './GanttChart';
import PertNetworkChart from './PertNetworkChart';
import html2canvas from 'html2canvas';
import React, { useRef } from 'react';

// ForceGraph2D를 동적 import로 변경하여 SSR 오류 방지
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">네트워크 그래프 로딩 중...</div>
});

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

// ProjectScheduleAnalysis 스키마에 맞는 인터페이스
interface ProjectScheduleAnalysis {
  project_id: string;                           // 프로젝트 ID
  date: string | { toDate: () => Date };        // 분석 날짜
  task_list: string[];                          // 작업 리스트
  start_dates: Record<string, string | { toDate: () => Date }>;          // 시작일 리스트
  durations: Record<string, number>;            // 단계별 기간
  dependencies: Record<string, string[]>;       // 작업 간 종속 관계
  planned_completion_dates: Record<string, string | { toDate: () => Date }>; // 계획 완료일 리스트
  actual_completion_dates: Record<string, string | { toDate: () => Date }>;  // 실제 완료일 리스트
  simulation_completion_dates: Array<string | { toDate: () => Date }>;        // 완료일 시뮬레이션
  progress: Record<string, number>;             // 단계별 진행률
  delay_times: Record<string, number>;          // 단계별 지연 시간
  intervals: Record<string, number>;            // 단계 간 간격
  cumulative_budget: Record<string, number>;    // 예산 누적 소모
  stage_status: Record<string, string>;         // 단계별 상태 (완료, 진행, 지연)
}

// 날짜 변환 함수
function getDateString(date: string | { toDate: () => Date } | undefined): string {
  if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    return date.toDate().toLocaleDateString();
  }
  return date ? String(date) : '';
}
// dayjs에 안전하게 넘길 수 있도록 변환하는 함수
function toDayjsInput(date: string | { toDate: () => Date } | undefined): string | number | Date | null | undefined {
  if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  if (typeof date === 'string' || typeof date === 'number' || date instanceof Date) {
    return date;
  }
  return undefined;
}

const ganttProjects = [
  {
    id: 'p1',
    name: 'CRM 시스템 구축',
    tasks: [
      { name: '기획', start: 0, end: 3, color: '#60a5fa' },
      { name: '설계', start: 3, end: 6, color: '#fbbf24' },
      { name: '개발', start: 6, end: 13, color: '#34d399' },
      { name: '테스트', start: 13, end: 15, color: '#a78bfa' },
      { name: '배포', start: 15, end: 16, color: '#f87171' },
    ],
    totalDays: 16,
  },
  {
    id: 'p2',
    name: '모바일 앱 리뉴얼',
    tasks: [
      { name: '기획', start: 0, end: 2, color: '#60a5fa' },
      { name: '설계', start: 2, end: 5, color: '#fbbf24' },
      { name: '개발', start: 5, end: 10, color: '#34d399' },
      { name: '테스트', start: 10, end: 13, color: '#a78bfa' },
      { name: '배포', start: 13, end: 14, color: '#f87171' },
    ],
    totalDays: 14,
  },
  {
    id: 'p3',
    name: 'ERP 고도화',
    tasks: [
      { name: '기획', start: 0, end: 2, color: '#60a5fa' },
      { name: '설계', start: 2, end: 4, color: '#fbbf24' },
      { name: '개발', start: 4, end: 8, color: '#34d399' },
      { name: '테스트', start: 8, end: 10, color: '#a78bfa' },
      { name: '배포', start: 10, end: 11, color: '#f87171' },
    ],
    totalDays: 11,
  },
];

export default function ProjectAnalytics() {
  const [selectedProjectId, setSelectedProjectId] = useState(ganttProjects[0].id);
  const [projectAnalysis, setProjectAnalysis] = useState<ProjectScheduleAnalysis[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // 차트별 ref 생성 (9개)
  const chartRefs = [
    useRef<HTMLDivElement>(null), // 1. 간트차트
    useRef<HTMLDivElement>(null), // 2. PERT 네트워크
    useRef<HTMLDivElement>(null), // 3. 단계별 지연 시간
    useRef<HTMLDivElement>(null), // 4. 시뮬레이션 완료일 분포
    useRef<HTMLDivElement>(null), // 5. 단계별 진행률
    useRef<HTMLDivElement>(null), // 6. 단계별 상태 분포
    useRef<HTMLDivElement>(null), // 7. 단계 간 간격
    useRef<HTMLDivElement>(null), // 8. 예산 누적 소모
    useRef<HTMLDivElement>(null), // 9. 계획 vs 실제 완료일
  ];
  const chartDescriptions = [
    '간트 차트',
    'PERT 네트워크',
    '단계별 지연 시간',
    '완료일 시뮬레이션 분포',
    '단계별 진행률',
    '단계별 상태 분포',
    '단계 간 간격',
    '예산 누적 소모',
    '계획 vs 실제 완료일',
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

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/projectTasks')
      .then(res => res.json())
      .then((data: ProjectScheduleAnalysis[]) => {
        // 데이터가 배열인지 확인하고 설정
        const analysisArray = Array.isArray(data) ? data : [];
        setProjectAnalysis(analysisArray);
      })
      .catch(console.error);
  }, []);

  // 첫 번째 분석 데이터 가져오기 (가장 최근 데이터)
  const firstData = useMemo(() => {
    if (!Array.isArray(projectAnalysis) || projectAnalysis.length === 0) {
      return null;
    }
    return projectAnalysis[0];
  }, [projectAnalysis]);

  //1. 간트차트 데이터 생성
  const ganttData = useMemo(() => {
    if (!firstData || !firstData.task_list || !firstData.start_dates || !firstData.durations) {
      return ganttProjects[0];
    }

    const tasks = firstData.task_list.map((task, index) => {
      const startDate = firstData.start_dates[task];
      const duration = firstData.durations[task] || 1;
      const start = startDate
        ? dayjs(toDayjsInput(startDate)).diff(dayjs(toDayjsInput(firstData.start_dates[firstData.task_list[0]])), 'day')
        : index;
      const end = start + duration;
      
      return {
        name: task,
        start,
        end,
        color: ['#60a5fa', '#fbbf24', '#34d399', '#a78bfa', '#f87171'][index % 5],
      };
    });

    const totalDays = Math.max(...tasks.map(t => t.end));

    return {
      id: firstData.project_id,
      name: `프로젝트 ${firstData.project_id}`,
      tasks,
      totalDays,
    };
  }, [firstData]);

  //2. PERT 네트워크 데이터
  const pertData = useMemo(() => {
    if (!firstData || !firstData.dependencies) {
      return { nodes: [], links: [] };
    }

    const nodes = new Set<string>();
    const edges: { from: string; to: string; duration: number }[] = [];

    Object.entries(firstData.dependencies).forEach(([task, dependencies]) => {
      nodes.add(task);
      
      if (Array.isArray(dependencies)) {
        dependencies.forEach(dep => {
          nodes.add(dep);
          const duration = firstData.durations?.[task] || 1;
          edges.push({ from: dep, to: task, duration });
        });
      }
    });

    return {
      nodes: Array.from(nodes).map(id => ({ id })),
      links: edges.map(e => ({ source: e.from, target: e.to, label: String(e.duration) })),
    };
  }, [firstData]);

  //3. 단계별 지연 시간 (워터폴 차트)
  const delayData = useMemo(() => {
    if (!firstData || !firstData.delay_times) {
      return { labels: [], data: [] };
    }

    const labels = Object.keys(firstData.delay_times);
    const data = Object.values(firstData.delay_times);

    return { labels, data };
  }, [firstData]);

  //4. 시뮬레이션 완료일 분포 (히스토그램)
  const simulationData = useMemo(() => {
    if (!firstData || !firstData.simulation_completion_dates) {
      return { labels: [], data: [] };
    }

    const dates = firstData.simulation_completion_dates;
    const dateCount: Record<string, number> = {};
    
    dates.forEach(dateStr => {
      const d = dayjs(toDayjsInput(dateStr)).format('M/D');
      dateCount[d] = (dateCount[d] || 0) + 1;
    });

    const labels = Object.keys(dateCount).sort();
    const data = labels.map(d => dateCount[d]);

    return { labels, data };
  }, [firstData]);

  //5. 단계별 진행률 (라인차트)
  const progressData = useMemo(() => {
    if (!firstData || !firstData.progress) {
      return { labels: [], data: [] };
    }

    const labels = Object.keys(firstData.progress);
    const data = Object.values(firstData.progress);

    return { labels, data };
  }, [firstData]);

  //6. 단계별 상태 분포 (파이차트)
  const statusData = useMemo(() => {
    if (!firstData || !firstData.stage_status) {
      return { labels: [], data: [] };
    }

    const statusCounts: Record<string, number> = {};
    Object.values(firstData.stage_status).forEach(status => {
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    return { labels, data };
  }, [firstData]);

  //7. 단계 간 간격 (산점도)
  const intervalData = useMemo(() => {
    if (!firstData || !firstData.intervals) {
      return { datasets: [] };
    }

    const intervals = Object.entries(firstData.intervals);
    const data = intervals.map(([task, interval], index) => ({
      x: index + 1,
      y: interval,
    }));

    return {
      datasets: [
        {
          label: '단계 간 간격',
          data,
          backgroundColor: '#3b82f6',
          pointRadius: 6,
        },
      ],
    };
  }, [firstData]);

  //8. 예산 누적 소모 (면적차트)
  const budgetData = useMemo(() => {
    if (!firstData || !firstData.cumulative_budget) {
      return { labels: [], data: [] };
    }

    const labels = Object.keys(firstData.cumulative_budget).sort();
    const data = labels.map(task => firstData.cumulative_budget[task]);

    return { labels, data };
  }, [firstData]);

  //9. 계획 vs 실제 완료일 비교 (막대그래프)
  const completionComparison = useMemo(() => {
    if (!firstData || !firstData.planned_completion_dates || !firstData.actual_completion_dates) {
      return { labels: [], planned: [], actual: [] };
    }

    const tasks = Object.keys(firstData.planned_completion_dates);
    const planned = tasks.map(task => {
      const date = firstData.planned_completion_dates[task];
      const base = firstData.start_dates[task] || firstData.date;
      return date
        ? dayjs(toDayjsInput(date)).diff(dayjs(toDayjsInput(base)), 'day')
        : 0;
    });
    const actual = tasks.map(task => {
      const date = firstData.actual_completion_dates[task];
      const base = firstData.start_dates[task] || firstData.date;
      return date
        ? dayjs(toDayjsInput(date)).diff(dayjs(toDayjsInput(base)), 'day')
        : 0;
    });

    return { labels: tasks, planned, actual };
  }, [firstData]);

  // 프로젝트 레포트 생성 함수
  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      if (!Array.isArray(projectAnalysis) || projectAnalysis.length === 0) {
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
          analyticsData: projectAnalysis,
          reportType: 'project',
          dateRange: {
            start: projectAnalysis[0]?.date || dayjs().format('YYYY-MM-DD'),
            end: projectAnalysis[projectAnalysis.length - 1]?.date || dayjs().format('YYYY-MM-DD')
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
          pdfLink.download = `project-analytics-report-${dayjs().format('YYYY-MM-DD')}.pdf`;
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
            <h2 className="text-xl font-semibold text-[#22223b] mb-2">프로젝트 일정 분석</h2>
            <p className="text-gray-600 text-sm">
              {projectAnalysis.length > 0 && (
                <>
                  분석 기간: {getDateString(projectAnalysis[0]?.date)}
                  ~ {getDateString(projectAnalysis[projectAnalysis.length - 1]?.date)}
                  <span className="mx-2">•</span>
                  프로젝트ID: {projectAnalysis[0]?.project_id}
                  <span className="mx-2">•</span>
                  작업 수: {projectAnalysis[0]?.task_list?.length ?? 0}
                </>
              )}
            </p>
          </div>
          {(!Array.isArray(projectAnalysis) || projectAnalysis.length === 0) ? (
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
      {/* 3x3 그리드: 9개 프로젝트 일정 분석 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

        {/* 1. 간트차트 */}
        <div ref={chartRefs[0]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b] flex items-center justify-between">
            <span>간트 차트</span>
            <select
              className="ml-4 border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
            >
              {ganttProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <GanttChart project={ganttData} />
          </div>
        </div>

        {/* 2. PERT 네트워크 */}
        <div ref={chartRefs[1]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">PERT 네트워크</div>
          <div className="w-full flex-1 flex items-center justify-center">
            <ForceGraph2D
              graphData={pertData}
              nodeLabel={(node: any) => node.id}
              nodeAutoColorBy="group"
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              width={250}
              height={250}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.id;
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

        {/* 3. 단계별 지연 시간 (워터폴) */}
        <div ref={chartRefs[2]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계별 지연 시간</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                labels: delayData.labels,
                datasets: [{
                  label: '지연 시간(일)',
                  data: delayData.data,
                  backgroundColor: delayData.data.map(val => 
                    val > 0 ? '#f87171' : val < 0 ? '#34d399' : '#e5e7eb'
                  ),
                  barThickness: 26,
                  maxBarThickness: 36,
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { title: { display: true, text: '지연 시간(일)' } } },
              }}
            />
          </div>
        </div>

        {/* 4. 시뮬레이션 완료일 분포 */}
        <div ref={chartRefs[3]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">완료일 시뮬레이션 분포</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                labels: simulationData.labels,
                datasets: [{
                  label: '건수',
                  data: simulationData.data,
                  backgroundColor: '#818cf8',
                  barPercentage: 0.8,
                  barThickness: 26,
                  maxBarThickness: 36,
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '건수' } } },
              }}
            />
          </div>
        </div>

        {/* 5. 단계별 진행률 */}
        <div ref={chartRefs[4]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계별 진행률</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                labels: progressData.labels,
                datasets: [{
                  label: '진행률(%)',
                  data: progressData.data,
                  backgroundColor: '#3b82f6',
                  barThickness: 26,
                  maxBarThickness: 36,
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { min: 0, max: 100, title: { display: true, text: '진행률(%)' } } },
              }}
            />
          </div>
        </div>

        {/* 6. 단계별 상태 분포 */}
        <div ref={chartRefs[5]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계별 상태 분포</div>
          <div className="w-[270px] h-[270px] flex items-center justify-center">
            <Pie
              data={{
                labels: statusData.labels,
                datasets: [{
                  label: '상태',
                  data: statusData.data,
                  backgroundColor: ['#22c55e', '#6366f1', '#f87171', '#f59e0b'],
                }],
              }}
              options={{
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* 7. 단계 간 간격 (산점도) */}
        <div ref={chartRefs[6]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계 간 간격</div>
          <div className="flex-1 flex items-center">
            <Scatter
              data={intervalData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { title: { display: true, text: '단계 순서' } },
                  y: { title: { display: true, text: '간격(일)' } },
                },
              }}
            />
          </div>
        </div>

        {/* 8. 예산 누적 소모 */}
        <div ref={chartRefs[7]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">예산 누적 소모</div>
          <div className="flex-1 flex items-center">
            <Line
              data={{
                labels: budgetData.labels,
                datasets: [{
                  label: '누적 예산(만원)',
                  data: budgetData.data,
                  borderColor: '#f59e42',
                  backgroundColor: '#f59e4222',
                  fill: true,
                  pointBackgroundColor: '#fff',
                  pointBorderColor: '#f59e42',
                  pointRadius: 4,
                  tension: 0.35,
                  borderWidth: 2,
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '누적 예산(만원)' } } },
              }}
            />
          </div>
        </div>

        {/* 9. 계획 vs 실제 완료일 비교 */}
        <div ref={chartRefs[8]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">계획 vs 실제 완료일</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                labels: completionComparison.labels,
                datasets: [
                  {
                    label: '계획',
                    data: completionComparison.planned,
                    backgroundColor: '#3b82f6',
                    barThickness: 26,
                    maxBarThickness: 36,
                  },
                  {
                    label: '실제',
                    data: completionComparison.actual,
                    backgroundColor: '#f59e0b',
                    barThickness: 26,
                    maxBarThickness: 36,
                  },
                ],
              }}
              options={{
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '소요일수' } } },
              }}
            />
          </div>
        </div>

      </div>
    </>
  );
} 