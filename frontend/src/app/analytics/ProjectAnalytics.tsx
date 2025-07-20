'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar, Scatter, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
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
  planned_completion_dates: string[]; // 계획 완료일 리스트 (배열)
  actual_completion_dates: string[];  // 실제 완료일 리스트 (배열)
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

  // 차트 ref 배열 (컴포넌트 함수 내부로 이동)
  const chartRefs = useMemo(
    () =>
      Array.from({ length: 9 }, () =>
        React.createRef<any>()
      ),
    []
  );

  const chartDescriptions = [
    '간트 차트: 프로젝트의 각 단계별 계획 시작일과 기간을 바 형태로 한눈에 볼 수 있습니다.',
    'PERT 네트워크: 단계 간 종속 관계와 크리티컬 패스를 네트워크 그래프로 시각화합니다.',
    '단계별 지연 시간: 각 단계의 실제 완료일이 계획 완료일보다 얼마나 지연(또는 단축)됐는지 일 단위로 나타냅니다.',
    '완료일 시뮬레이션 분포: 몬테카를로 시뮬레이션을 통해 예측된 프로젝트 전체 완료일의 분포를 히스토그램으로 보여줍니다.',
    '단계별 진행률: 프로젝트 단계별로 시간에 따라 진행률이 어떻게 변화했는지 선그래프로 확인할 수 있습니다.',
    '단계별 지연 확률 분포: 각 단계에서 지연 발생의 분포 또는 변동성을 박스플롯 또는 막대그래프로 나타냅니다.',
    '단계 간 간격: 선행과 후행 단계 사이에 실제로 걸린 일수(간격)를 산점도로 시각화합니다.',
    '예산 누적 소모: 프로젝트 진행에 따라 누적된 예산의 변화를 면적 차트로 나타냅니다.',
    '단계별 상태 분포: 각 단계가 완료, 진행, 지연 중 어떤 상태에 있었는지의 비율을 파이차트로 보여줍니다.',
  ];

  useEffect(() => {
    fetch('http://44.212.4.6:3001/api/analytics/projectTasks')
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
  const STEP_COLORS = [
    '#60a5fa', // 파랑
    '#fbbf24', // 노랑
    '#34d399', // 초록
    '#a5b4fc', // 연보라
    '#f472b6', // 핑크 등등
  ];
  
  // 데이터 구조 예시 (props/projectAnalysis[0])
  // - task_list: ["기획 단계", "디자인 단계", ...]
  // - start_dates: ["2025-06-01", ...]
  // - durations: [{ step: "기획", duration: 1 }, ...]
  const ganttData = useMemo(() => {
    if (!projectAnalysis || projectAnalysis.length === 0) return { labels: [], offset: [], durations: [], minStart: 0 };
    const p = projectAnalysis[0];

    const labels = p.task_list.map((name: string) => name);

    // start_dates 처리 (배열/객체 모두 대응)
    const startDays = p.task_list.map((name: string, i: number) =>
      dayjs(toDayjsInput(Array.isArray(p.start_dates) ? p.start_dates[i] : p.start_dates[name]))
    );
    const minStart = Math.min(...startDays.map(d => d.valueOf()));
    const offset = startDays.map(d => (d.valueOf() - minStart) / (1000 * 60 * 60 * 24));

    // durations 처리 (배열/객체 모두 대응)
    const durations = p.task_list.map((name: string, i: number) =>
      Array.isArray(p.durations)
        ? (p.durations[i]?.duration || 1)
        : (typeof p.durations === 'object' ? p.durations[name] || 1 : 1)
    );

    return { labels, offset, durations, minStart };
  }, [projectAnalysis]);

  const ganttChartData = {
    labels: ganttData.labels,
    datasets: [
      // 투명 오프셋 (막대 시작점 이동)
      {
        label: "offset",
        data: ganttData.offset,
        backgroundColor: "rgba(0,0,0,0)",
        stack: "gantt"
      },
      // 각 단계별 막대
      {
        label: "계획 구간",
        data: ganttData.durations,
        backgroundColor: ganttData.labels.map((_, i) => STEP_COLORS[i % STEP_COLORS.length]),
        stack: "gantt",
        borderRadius: 16,
        barPercentage: 0.72,
        categoryPercentage: 0.78,
      }
    ]
  };

  //2. PERT 네트워크 데이터
  const pertNetwork = useMemo(() => {
    if (!Array.isArray(projectAnalysis) || projectAnalysis.length === 0) {
      return { nodes: [], links: [] };
    }
    const first = projectAnalysis[0];

    // dependencies: [{from, to, planned_duration}] 형태로 변환
    let dependenciesArr: Array<{from: string, to: string, planned_duration: number}> = [];
    if (Array.isArray(first.dependencies)) {
      dependenciesArr = first.dependencies;
    } else if (first.dependencies && typeof first.dependencies === 'object') {
      dependenciesArr = Object.entries(first.dependencies).flatMap(([from, arr]) =>
        Array.isArray(arr)
          ? arr.map((dep: any) => ({
              from,
              to: dep.to,
              planned_duration: dep.planned_duration ?? 0,
            }))
          : []
      );
    }

    // durations: [{step, duration}] 형태로 변환
    let durationsArr: Array<{step: string, duration: number}> = [];
    if (Array.isArray(first.durations)) {
      durationsArr = first.durations;
    } else if (first.durations && typeof first.durations === 'object') {
      durationsArr = Object.entries(first.durations).map(([step, duration]) => ({
        step,
        duration: typeof duration === 'number' ? duration : 0,
      }));
    }

    // 1. 모든 단계명
    const allSteps = durationsArr.map(d => d.step);

    // 2. 각 단계별 duration 매핑
    const durationMap = Object.fromEntries(durationsArr.map(d => [d.step, d.duration]));

    // 3. 노드 생성
    const nodes = allSteps.map(step => ({
      id: step,
      label: `${step}\n(${durationMap[step]}일)`,
      duration: durationMap[step],
    }));

    // 4. 링크 생성
    const links = dependenciesArr.map(dep => ({
      source: dep.from,
      target: dep.to,
      label: `${dep.planned_duration}일`,
      value: dep.planned_duration,
    }));

    return { nodes, links };
  }, [projectAnalysis]);

  //3. 단계별 지연 시간 (워터폴 차트)
  const delayWaterfallData = useMemo(() => {
    if (!projectAnalysis || projectAnalysis.length === 0) return { labels: [], values: [] };
    const p = projectAnalysis[0];
  
    // 각 단계별로 지연(단축) 일수 계산
    const labels = p.task_list;
    const values = p.task_list.map((_, i: number) => {
      const planned = p.planned_completion_dates[i];
      const actual = p.actual_completion_dates[i];
      if (!planned || !actual) return 0;
      const diff = dayjs(toDayjsInput(actual)).diff(dayjs(toDayjsInput(planned)), "day");
      return diff;
    });
  
    return { labels, values };
  }, [projectAnalysis]);

  //4. 시뮬레이션 완료일 분포
  const monteCarloHistogram = useMemo(() => {
    if (!projectAnalysis || projectAnalysis.length === 0) return { labels: [], values: [] };
    const p = projectAnalysis[0];
  
    // 날짜별 집계 (YYYY-MM-DD → 건수)
    const counter: Record<string, number> = {};
    p.simulation_completion_dates.forEach(dateStr => {
      if (!dateStr) return;
      const d = dayjs(toDayjsInput(dateStr)).format("YYYY-MM-DD");
      counter[d] = (counter[d] || 0) + 1;
    });
  
    // 날짜 오름차순 정렬
    const labels = Object.keys(counter).sort();
    const values = labels.map(label => counter[label]);
  
    return { labels, values };
  }, [projectAnalysis]);

  //5. 단계별 진행률 (라인차트)
  const progressLineData = useMemo(() => {
    if (!projectAnalysis || projectAnalysis.length === 0) return { labels: [], datasets: [] };
  
    // 3개월치 프로젝트 전체 집계
    // 예시: 특정 프로젝트만 필터링해서 사용 가능
    const paList = projectAnalysis.filter(p => p.project_id === 'project_003');
    
    // 날짜 라벨 (YYYY-MM-DD)
    const labels = paList.map(p => p.date);
  
    // 단계 수
    const numSteps = paList[0]?.progress.length || 0;
    const stepNames = paList[0]?.task_list || Array(numSteps).fill('').map((_, i) => `단계${i+1}`);
  
    // 각 단계별 데이터
    const datasets = stepNames.map((step, i) => ({
      label: step,
      data: paList.map(p => p.progress[i] ?? null),
      borderColor: ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#818cf8'][i % 5],
      backgroundColor: 'rgba(96,165,250,0.12)',
      tension: 0.3
    }));
  
    return { labels, datasets };
  }, [projectAnalysis]);

  //6. 단계별 지연 확률 분포
  const riskDelayData = useMemo(() => {
    if (!projectAnalysis || projectAnalysis.length === 0) return { labels: [], data: [] };
    const p = projectAnalysis[0];

    return {
      labels: p.task_list ?? [],
      data: p.task_list.map((task, i) => p.delay_times ? p.delay_times[i] ?? 0 : 0),
    };
  }, [projectAnalysis]);

  //7. 단계 간 간격 (산점도)
  const intervalScatterData = useMemo(() => {
    if (!Array.isArray(projectAnalysis) || projectAnalysis.length === 0) return { datasets: [] };

    const p = projectAnalysis[0];

    // intervals가 객체일 경우 배열로 변환
    const intervalsArr = Array.isArray(p.intervals)
      ? p.intervals
      : Object.values(p.intervals || {});

    const taskListArr = p.task_list as string[];
    const data = intervalsArr.map((interval: number, idx: number) => ({
      x: (taskListArr as any)[idx + 1],
      y: interval
    })).filter(d => d.x);

    return {
      datasets: [
        {
          label: "완료→대기 간격(일)",
          data,
          backgroundColor: "#60a5fa",
          pointRadius: 8,
        }
      ]
    };
  }, [projectAnalysis]);

  //8. 예산 누적 소모 (면적차트)
  const budgetAreaData = useMemo(() => {
    if (!Array.isArray(projectAnalysis) || projectAnalysis.length === 0) return { labels: [], datasets: [] };

    const p = projectAnalysis[0]; // 하나의 프로젝트만 예시

    // 날짜: 각 단계의 실제 완료일(혹은 계획 완료일)
    // 누적예산: 단계별 누적 값 (cumulative_budget)
    const labels = (p.actual_completion_dates || p.planned_completion_dates || []).map(date => dayjs(date).format("M/D"));
    const data = Object.values(p.cumulative_budget || {});

    return {
      labels,
      datasets: [
        {
          label: "누적 예산(원)",
          data,
          fill: true,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.16)",
          pointRadius: 4,
          tension: 0.35,
        }
      ]
    };
  }, [projectAnalysis]);

  //9. 단계별 상태
  const statusPie = useMemo(() => {
    if (!projectAnalysis || projectAnalysis.length === 0) return { labels: [], data: [] };
    const p = projectAnalysis[0];

    // 상태별 카운트
    const count: Record<string, number> = {};
    Object.values(p.stage_status ?? {}).forEach(status => {
      if (status) count[status] = (count[status] || 0) + 1;
    });

    // 한글 매핑
    const statusLabelMap: Record<string, string> = {
      completed: "완료",
      in_progress: "진행",
      delayed: "지연"
    };

    const labels = Object.keys(count).map(k => statusLabelMap[k] || k);
    const data = Object.values(count);

    return { labels, data };
  }, [projectAnalysis]);

  // 프로젝트 레포트 생성 함수
  const generateReport = async () => {

    setIsGeneratingReport(true);
    try {
      if (!Array.isArray(projectAnalysis) || projectAnalysis.length === 0) {
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
          analyticsData: projectAnalysis,
          reportType: 'project',
          dateRange: {
            start: projectAnalysis[projectAnalysis.length - 1]?.date || dayjs().format('YYYY-MM-DD'),
            end: projectAnalysis[0]?.date || dayjs().format('YYYY-MM-DD')
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

  const safeIntervalScatterData =
    intervalScatterData && typeof intervalScatterData === 'object' && Array.isArray(intervalScatterData.datasets)
      ? intervalScatterData
      : { datasets: [] };


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
                  분석 기간: {getDateString(projectAnalysis[projectAnalysis.length - 1]?.date)}
                  ~ {getDateString(projectAnalysis[0]?.date)}
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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b] flex items-center justify-between">
            <span>간트 차트</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
          <Bar
            ref={chartRefs[0]}
            data={ganttChartData}
            options={{
              indexAxis: "y",
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => {
                      // offset은 툴팁 무시
                      if (ctx.dataset.label !== "계획 구간") return '';
                      const i = ctx.dataIndex;
                      const start = dayjs(ganttData.minStart).add(ganttData.offset[i], "day");
                      const end = start.add(ganttData.durations[i], "day");
                      return `${start.format("M/D")}~${end.format("M/D")}`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  min: 0,
                  max: Math.max(...ganttData.offset.map((o, i) => o + ganttData.durations[i])) + 1,
                  title: { display: true, text: "일자" },
                  ticks: {
                    callback: v => dayjs(ganttData.minStart).add(Number(v), "day").format("M/D"),
                  },
                  grid: { drawOnChartArea: false },
                },
                y: {
                  grid: { drawOnChartArea: false }
                }
              }
            }}
            height={150}
          />
          </div>
        </div>

        {/* 2. PERT 네트워크 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">PERT 네트워크</div>
          <div className="w-full flex-1 flex items-center justify-center">
          <ForceGraph2D
            ref={chartRefs[1]}
            graphData={pertNetwork}
            width={400}
            height={230}
            enableZoomInteraction={false}
            nodeRelSize={18}
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
            linkWidth={link => 1 + (link.value || 1) * 0.7}
            linkColor={() => "#94a3b8"}
            linkCurvature={0}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              // 원 그리기 (2/3 크기)
              ctx.beginPath();
              ctx.arc(node.x, node.y, 13 * 2 / 3, 0, 2 * Math.PI, false); // 기존 13 → 8.7
              ctx.fillStyle = '#e0e7ef';
              ctx.fill();
              ctx.strokeStyle = '#64748b';
              ctx.lineWidth = 1; // 더 얇게
              ctx.stroke();

              // 텍스트 (2/3 크기)
              ctx.font = `${Math.max(7, 8 / globalScale) * 2 / 3}px Pretendard, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#22223b';
              ctx.fillText(node.id, node.x, node.y - 5 * 2 / 3);
              ctx.font = `${Math.max(7, 8 / globalScale) * 2 / 3}px Pretendard, sans-serif`;
              ctx.fillStyle = '#3b82f6';
              ctx.fillText(`${node.duration}일`, node.x, node.y + 7 * 2 / 3);
            }}
            linkCanvasObject={(link: any, ctx, globalScale) => {
              // 링크 기간 라벨
              const sx = link.source.x, sy = link.source.y;
              const tx = link.target.x, ty = link.target.y;
              const mx = (sx + tx) / 2;
              const my = (sy + ty) / 2;
              ctx.font = `${Math.max(9, 10 / globalScale)}px Pretendard, sans-serif`;
              ctx.fillStyle = '#7b8794';
              ctx.textAlign = 'center';
              ctx.fillText(`${link.value}일`, mx, my - 10);
            }}
          />
          </div>
        </div>

        {/* 3. 단계별 지연 시간 (워터폴) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계별 지연 시간</div>
          <div className="flex-1 flex items-center">
          <Bar
            ref={chartRefs[2]}
            data={{
              labels: delayWaterfallData.labels,
              datasets: [
                {
                  label: "지연/단축(일)",
                  data: delayWaterfallData.values,
                  backgroundColor: delayWaterfallData.values.map(v => v > 0 ? "#a5b4fc" : "#6ee7b7"),
                  borderRadius: 6,
                  barPercentage: 0.5,
                  categoryPercentage: 0.55,
                }
              ]
            }}
            height={170}
            options={{
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => {
                      const v = ctx.raw as number;
                      if (v > 0) return `+${v}일 지연`;
                      if (v < 0) return `${v}일 단축`;
                      return "지연 없음";
                    }
                  }
                }
              },
              scales: {
                x: { title: { display: false }, grid: { drawOnChartArea: false } },
                y: {
                  title: { display: true, text: "지연/단축(일)" },
                  beginAtZero: true,
                  grid: { drawOnChartArea: false },
                  ticks: {
                    // 소수점 없애기
                    callback: v => Number(v).toFixed(0),
                    stepSize: 1,
                  },
                  // max: 최댓값의 두 배로 설정
                  max: Math.max(...delayWaterfallData.values, 0) * 2 || 1,
                }
              }
            }}
          />
          </div>
        </div>

        {/* 4. 시뮬레이션 완료일 분포 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">완료일 시뮬레이션 분포</div>
          <div className="flex-1 flex items-center">
          <Bar
            ref={chartRefs[3]}
            data={{
              labels: monteCarloHistogram.labels.map(label => dayjs(label).format("M/D")),
              datasets: [
                {
                  label: "예측 건수",
                  data: monteCarloHistogram.values,
                  backgroundColor: "#60a5fa",
                  borderRadius: 5,
                  barPercentage: 0.6,
                  categoryPercentage: 0.65,
                }
              ]
            }}
            options={{
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => `${ctx.parsed.y}건`
                  }
                }
              },
              scales: {
                x: {
                  title: { display: false },
                  grid: { drawOnChartArea: false }
                },
                y: {
                  beginAtZero: true,
                  title: { display: false },
                  ticks: { stepSize: 1 }
                }
              }
            }}
            height={130}
          />
          </div>
        </div>

        {/* 5. 단계별 진행률 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계별 진행률</div>
          <div className="flex-1 flex items-center">
          <Line
            ref={chartRefs[4]}
            data={progressLineData}
            options={{
              plugins: {
                legend: { position: 'top' }
              },
              scales: {
                y: { beginAtZero: true, max: 100, title: { display: true, text: '진행률(%)' } }
              }
            }}
            height={180}
          />
          </div>
        </div>

        {/* 6. 단계별 지연 확률 분포 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계별 지연 확률 분포</div>
          <div className="w-full max-w-[500px] h-[270px] flex items-center justify-center">
          <Bar
            ref={chartRefs[5]}
            data={{
              labels: riskDelayData.labels,
              datasets: [{
                label: '단계별 지연시간(분)',
                data: riskDelayData.data,
                backgroundColor: ['#60a5fa', '#a5b4fc', '#34d399', '#fbbf24', '#94a3b8'],
                borderRadius: 8,
                barPercentage: 0.7,
                categoryPercentage: 0.7,
              }]
            }}
            options={{
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => `${ctx.parsed.y}분`,
                  }
                }
              },
              scales: {
                x: { title: { display: false } },
                y: { title: { display: true, text: "지연시간(분)" }, beginAtZero: true },
              }
            }}
            height={200}
          />
          </div>
        </div>

        {/* 7. 단계 간 간격 (산점도) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계 간 간격</div>
          <div className="flex-1 flex items-center">
          <Scatter
            ref={chartRefs[6]}
            data={{
              ...safeIntervalScatterData,
              datasets: safeIntervalScatterData.datasets.map(ds => ({
                ...ds,
                pointRadius: 5 // 더 작게
              }))
            }}
            options={{
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => {
                      // 단계명, 간격
                      const { x, y } = ctx.raw as { x: string; y: number };
                      return `${x}: ${y}일 대기`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  title: { display: true, text: "후행 단계" },
                  type: "category",
                  ticks: {
                    // 단계명 간격 조절
                    font: { size: 14 }
                  }
                },
                y: {
                  title: { display: true, text: "간격(일)" },
                  beginAtZero: true,
                  ticks: { precision: 0 }
                }
              }
            }}
            height={160}
          />
          </div>
        </div>

        {/* 8. 예산 누적 소모 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">예산 누적 소모</div>
          <div className="flex-1 flex items-center">
          <Line
            ref={chartRefs[7]}
            data={budgetAreaData}
            options={{
              plugins: {
                legend: { position: "top" },
                tooltip: {
                  callbacks: {
                    label: ctx => `₩${ctx.parsed.y?.toLocaleString() || 0}`,
                  }
                }
              },
              scales: {
                x: { title: { display: true, text: "일정(일자)" } },
                y: { title: { display: true, text: "누적 예산(원)" } },
              }
            }}
            height={170}
          />
          </div>
        </div>

        {/* 9. 단계별 상태 분포 (파이차트) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계별 상태 분포</div>
          <div className="w-[270px] h-[270px] flex items-center justify-center">
            <Pie
              ref={chartRefs[8]}
              data={{
                labels: statusPie.labels,
                datasets: [{
                  label: '상태',
                  data: statusPie.data,
                  backgroundColor: ['#22c55e', '#6366f1', '#f87171', '#f59e0b'],
                }],
              }}
              options={{
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

      </div>
    </>
  );
} 