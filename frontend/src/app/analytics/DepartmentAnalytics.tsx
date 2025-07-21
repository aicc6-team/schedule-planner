'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar, Scatter, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import html2canvas from 'html2canvas';
import React, { useRef } from 'react';

// ForceGraph2D를 동적 import로 변경하여 SSR 오류 방지
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">네트워크 그래프 로딩 중...</div>
});

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

// DepartmentScheduleAnalysis 스키마에 맞는 인터페이스
interface DepartmentScheduleAnalysis {
  department_name: string;           // 부서명
  date: string;                      // 분석 날짜
  average_delay_per_member: Record<string, { delay_time: number; response_time: number }>; // 팀원별 평균 응답 및 지연 시간
  schedule_type_ratio: Record<string, number>;      // 일정 유형별 비율
  bottleneck_time_slots: Record<string, Record<string, number>>; // 시간대별 병목 현상 건수
  collaboration_network: Record<string, string[]>;  // 협업 네트워크 참여 횟수
  workload_by_member_and_type: Record<string, Record<string, number>>; // 팀원별 업무 유형별 투입 시간
  execution_time_stats: Record<string, { min: number; max: number; median: number }>; // 업무 수행시간 통계
  quality_stats: Record<string, { avg: number; min: number; max: number }>; // 업무 품질 통계
  monthly_schedule_trends: Record<string, number>;  // 월별 일정 건수 추이
  issue_occurrence_rate: Record<string, Record<string, number>>; // 태그별, 팀별 지연 건수
  total_schedules?: number; // 총 일정 건수
}

export interface DepartmentSchedule {
  created_at: string; // 생성 일시 (ISO string)
  date: string; // 일정 날짜 (YYYY-MM-DD 등 ISO string)
  department: string;
  hour: number;
  objective: string;
  organizer: string;
  participants: string[];
  projectId: string;
  status: string;
  time: string;
  title: string;
  updated_at: string; // 수정 일시 (ISO string)
}

export default function DepartmentAnalytics() {
  const [departmentAnalysis, setDepartmentAnalysis] = useState<DepartmentScheduleAnalysis[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentSchedule[]>([]);
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
    '팀원별 응답시간: 각 팀원의 평균 응답(지연) 시간을 막대그래프로 나타냅니다.',
    '일정 유형 비율: 회의/실행/검토 등 일정 유형별 비율을 파이차트로 시각화합니다.',
    '요일×시간대 완료율: 요일과 시간대별로 일정 완료 비율을 히트맵으로 보여줍니다.',
    '협업 네트워크: 팀원 간 협업 네트워크 구조를 그래프로 나타냅니다.',
    '팀원별 작업량: 팀원별·업무유형별 시간 투입량을 스택형 막대그래프로 보여줍니다.',
    '수행시간 분포: 각 팀원의 업무 수행 시간의 분포(최소~최대·평균 등)를 박스플롯 또는 막대그래프로 시각화합니다.',
    '품질 vs 시간: 팀원별 업무 품질점수와 소요시간의 상관관계를 산점도로 표현합니다.',
    '월별 작업량: 월별 전체 일정 건수를 선그래프로 추이와 함께 보여줍니다.',
    '이슈 발생률: 팀별, 태그별로 발생한 일정 지연(이슈) 건수를 막대그래프로 나타냅니다.',
  ];


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
    fetch('http://localhost:3001/api/analytics/departmentTasks')
      .then(res => res.json())
      .then((data: DepartmentScheduleAnalysis[]) => {
        // 데이터가 배열인지 확인하고 설정
        const analysisArray = Array.isArray(data) ? data : [];
        setDepartmentAnalysis(analysisArray);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/department')
      .then(res => res.json())
      .then((data: DepartmentSchedule[]) => {
        // 데이터가 배열인지 확인하고 설정
        const departmentArray = Array.isArray(data) ? data : [];
        setDepartmentData(departmentArray);
      })
      .catch(console.error);
  }, []);

  // 부서 레포트 생성 함수
  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) {
        console.error('분석 데이터가 없습니다.');
        return;
      }
      debugger;
      // 차트 이미지 추출
      const chartImages = chartRefs.map(ref => ref.current?.toBase64Image?.() ?? null);

      // 2. 기존 fetch에 chartImages, chartDescriptions 추가
      const response = await fetch('http://localhost:3001/api/analytics/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyticsData: departmentAnalysis,
          reportType: 'department',
          dateRange: {
            start: departmentAnalysis[departmentAnalysis.length - 1]?.date || dayjs().format('YYYY-MM-DD'),
            end: departmentAnalysis[0]?.date || dayjs().format('YYYY-MM-DD')
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
          pdfLink.download = `department-analytics-report-${dayjs().format('YYYY-MM-DD')}.pdf`;
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

  //1번 차트 - 팀원별 응답시간
  const delayByMember = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) return { labels: [], data: [] };
  
    // 가장 최근 또는 특정 분석 데이터 사용
    const first = departmentAnalysis[0];
    if (!first || !first.average_delay_per_member) return { labels: [], data: [] };
  
    const labels = Object.keys(first.average_delay_per_member);
    const data = labels.map(user =>
      first.average_delay_per_member[user]?.delay_time ?? 0
    );
  
    return { labels, data };
  }, [departmentAnalysis]);

  //2번 차트: 일정 유형 파이차트
  const typeRatioPie = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) return { labels: [], data: [] };
  
    // 가장 최근 분석 데이터 사용 (혹은 원하는 인덱스)
    const first = departmentAnalysis[0];
    if (!first || !first.schedule_type_ratio) return { labels: [], data: [] };
  
    const labels = Object.keys(first.schedule_type_ratio);
    const data = labels.map(type => Math.round(first.schedule_type_ratio[type] * 100));
  
    return { labels, data };
  }, [departmentAnalysis]);

  //3번 차트: 시간대별 병목 히트맵
  const timeHeatmap = useMemo(() => {
    
    if (!Array.isArray(departmentData) || departmentData.length === 0) {
      return Array.from({ length: 5 }, () => Array(7).fill(0));
    }
  
    // 집계용 배열
    const total = Array.from({ length: 5 }, () => Array(7).fill(0));
    const completed = Array.from({ length: 5 }, () => Array(7).fill(0));
    
    departmentData.forEach(item => {
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
  }, [departmentData, timeSlots]);

  //4. 협업 네트워크 그래프
  const graphData = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) {
      return { nodes: [], links: [] };
    }
  
    const firstData = departmentAnalysis[0];
    if (!firstData || !firstData.collaboration_network) {
      return { nodes: [], links: [] };
    }
  
    // 노드/링크 뽑기
    const nodesSet = new Set<string>();
    const links: { source: string; target: string; value: number }[] = [];
  
    // collaboration_network는 배열임
    const collaborationArray = Array.isArray(firstData.collaboration_network) ? firstData.collaboration_network : [];
    collaborationArray.forEach((item: any) => {
      if (!item.from || !item.to) return;
      nodesSet.add(item.from);
      nodesSet.add(item.to);
      links.push({
        source: item.from,
        target: item.to,
        value: item.count || 1, // 협업 횟수(굵기/파티클에 활용)
      });
    });
  
    // 노드 객체로 변환
    const nodes = Array.from(nodesSet).map(id => ({ id }));
  
    return { nodes, links };
  }, [departmentAnalysis]);

  //5번 그래프: 업무 유형별 시간 분포
  const deptTypeDuration = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) {
      return { labels: [], datasets: [] };
    }
    const firstData = departmentAnalysis[0];
    if (!firstData || !firstData.workload_by_member_and_type) {
      return { labels: [], datasets: [] };
    }
    // 모든 멤버, 모든 업무유형 추출
    const members = Object.keys(firstData.workload_by_member_and_type);
    const allTypes = Array.from(
      new Set(
        Object.values(firstData.workload_by_member_and_type)
          .flatMap(memberData => Object.keys(memberData))
      )
    );
    // 컬러셋 (유형 개수만큼)
    const colors = [
      '#3b82f6', // 미드 블루
      '#6366f1', // 미드 퍼플
      '#10b981', // 미드 그린
      '#f59e42', // 미드 오렌지
      '#ef4444', // 미드 레드
      '#14b8a6', // 미드 시안
      '#a855f7', // 미드 바이올렛
    ];
  
    const datasets = allTypes.map((type, idx) => ({
      label: type,
      data: members.map(member => firstData.workload_by_member_and_type[member]?.[type] || 0),
      backgroundColor: colors[idx % colors.length],
      stack: 'total'
    }));
  
    return { labels: members, datasets };
  }, [departmentAnalysis]);

  //6. 팀원별 소요시간 분포 (BoxPlot)
  const execTimeStats = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) {
      return { labels: [], datasets: [] };
    }
  
    const firstData = departmentAnalysis[0];
    if (!firstData || !firstData.execution_time_stats) {
      return { labels: [], datasets: [] };
    }
  
    const labels = Object.keys(firstData.execution_time_stats); // ["김민준", "박지후", ...]
    const minData = labels.map(name => firstData.execution_time_stats[name]?.min ?? 0);
    const medianData = labels.map(name => firstData.execution_time_stats[name]?.median ?? 0);
    const maxData = labels.map(name => firstData.execution_time_stats[name]?.max ?? 0);
  
    return {
      labels, // ["김민준", "박지후", ...]
      datasets: [
        {
          label: '최소',
          data: minData,
          backgroundColor: 'rgba(59,130,246,0.1)',
        },
        {
          label: '중앙값',
          data: medianData,
          backgroundColor: 'rgba(59,130,246,0.5)',
        },
        {
          label: '최대',
          data: maxData,
          backgroundColor: 'rgba(30, 64, 175, 0.9)',
        },
      ],
    };
  }, [departmentAnalysis]);

  //7번째 품질 vs 시간 산점도
  const qualityScatter = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) return { datasets: [] };
  
    // quality_stats는 배열
    const firstData = departmentAnalysis[0];
    if (!firstData || !Array.isArray(firstData.quality_stats)) return { datasets: [] };
  
    const data = firstData.quality_stats.map(item => ({
      x: item.quality ?? 0,
      y: item.time ?? 0
    }));
  
    return {
      datasets: [
        {
          label: '품질 vs 시간',
          data,
          backgroundColor: '#3b82f6',
          pointRadius: 2,
        }
      ]
    };
  }, [departmentAnalysis]);
  
  //8번 차트: 월별 작업량 라인차트
  const monthlyCount = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) {
      return { labels: [], datasets: [] };
    }
  
    // 가장 최근 데이터 또는 첫 데이터 기준으로
    const firstData = departmentAnalysis[0];
    if (!firstData || !firstData.monthly_schedule_trends) {
      return { labels: [], datasets: [] };
    }
  
    // 월 정렬
    const labels = Object.keys(firstData.monthly_schedule_trends).sort();
    const data = labels.map(month => firstData.monthly_schedule_trends[month] || 0);
  
    return {
      labels,
      datasets: [
        {
          label: '월별 작업량',
          data,
          fill: false,
          borderColor: '#3b82f6',
          backgroundColor: '#60a5fa',
          tension: 0.4,
        },
      ],
    };
  }, [departmentAnalysis]);

  //9번 차트: 이슈 발생률 (막대그래프)
  const issueMatrix = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) {
      return { labels: [], datasets: [] };
    }
  
    const firstData = departmentAnalysis[0];
    if (!firstData || !firstData.issue_occurrence_rate) {
      return { labels: [], datasets: [] };
    }
  
    // 태그(예: 개발, 검토, ...)가 X축 라벨, 팀별 데이터 추출
    const tags = Object.keys(firstData.issue_occurrence_rate); // ['개발', '검토', ...]
    const allTeams = Array.from(
      new Set(
        Object.values(firstData.issue_occurrence_rate)
          .flatMap(tagData => Object.keys(tagData))
      )
    );
  
    // 각 팀별로 series 생성
    const datasets = allTeams.map((team, idx) => ({
      label: team,
      data: tags.map(tag => firstData.issue_occurrence_rate[tag]?.[team] || 0),
      backgroundColor: ['#60a5fa', '#a5b4fc', '#6ee7b7', '#fde68a', '#fca5a5', '#818cf8'][idx % 6],
    }));
  
    return { labels: tags, datasets };
  }, [departmentAnalysis]);

  return (
    <>
      {/* 레포트 버튼 섹션 */}
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#22223b] mb-2">부서 일정 분석</h2>
            <p className="text-gray-600 text-sm">
              {departmentAnalysis.length > 0 && (
                <>
                  분석 기간: {dayjs(departmentAnalysis[departmentAnalysis.length - 1].date).format('YYYY-MM-DD')} ~ {dayjs(departmentAnalysis[0].date).format('YYYY-MM-DD')}
                  <span className="mx-2">•</span>
                  총 {departmentAnalysis.reduce((sum, item) => sum + (item.total_schedules ?? 0), 0)}개 일정
                  <span className="mx-2">•</span>
                  평균 지연시간: {
                    departmentAnalysis.length > 0 && departmentAnalysis[0].average_delay_per_member
                      ? (() => {
                          const values = Object.values(departmentAnalysis[0].average_delay_per_member)
                            .map(v => (typeof v === "object" && v !== null && typeof v.delay_time === "number") ? v.delay_time : 0);
                          const count = values.length;
                          if (count === 0) return 0;
                          const sum = values.reduce((sum, v) => sum + v, 0);
                          return (sum / count).toFixed(1);
                        })()
                      : 0
                  }분
                </>
              )}
            </p>
          </div>
          {(!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) ? (
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
      {/* 3x3 그리드: 9개 부서 일정 분석 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* 1. 팀원별 응답시간 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">팀원별 응답시간</div>
          <div className="flex-1 flex items-center">
            <Bar
              ref={chartRefs[0]}
              data={{
                labels: delayByMember.labels,
                datasets: [{
                  label: '평균 응답시간(시간)',
                  data: delayByMember.data,
                  backgroundColor: [
                    '#60a5fa', // 파랑
                    '#a5b4fc', // 연보라
                    '#6ee7b7', // 연초록
                    '#fde68a', // 연노랑
                    '#fca5a5', // 연빨강
                  ],
                  barThickness: 26,
                  maxBarThickness: 36,
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: '평균 응답시간(시간)' }
                  }
                }
              }}
              height={180}
            />
          </div>
        </div>

        {/* 2. 일정 유형 파이차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
          <div className="font-semibold mb-3 text-[#22223b]">일정 유형 비율</div>
          <div className="w-[270px] h-[270px] flex items-center justify-center">
            <Pie
              ref={chartRefs[1]}
              data={{
                labels: typeRatioPie.labels,
                datasets: [{
                  data: typeRatioPie.data,
                  backgroundColor: [
                    '#60a5fa', // 개발
                    '#a5b4fc', // 검토
                    '#6ee7b7', // 기획
                    '#fde68a', // 디자인
                    '#fca5a5', // 테스트
                    '#818cf8', // 기타
                  ]
                }]
              }}
              options={{
                plugins: {
                  legend: { position: 'bottom' },
                  tooltip: {
                    callbacks: {
                      label: ctx => {
                        const label = ctx.label || '';
                        const value = ctx.parsed || 0;
                        return `${label}: ${value}%`;
                      }
                    }
                  }
                }
              }}
              height={220}
            />
          </div>
        </div>

        {/* 3. 시간대별 병목 히트맵 (커스텀) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
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

        {/* 4. 협업 네트워크 그래프 (실제 차트) */}
        <div
          className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-start min-h-[420px]"
          style={{ minHeight: 420, width: '100%', minWidth: 480, height: 420 }}
        >
          {/* 타이틀: 다른 차트와 동일하게 */}
          <div className="font-semibold text-medium text-[#22223b] mb-6">협업 네트워크</div>
          <div style={{ width: 420, height: 360 }}>
            
          <ForceGraph2D
            ref={chartRefs[2]}
            graphData={graphData}
            width={420}
            height={360}
            nodeRelSize={12}
            cooldownTicks={90}
            enableZoomInteraction={false}
            // onEngineStop={fg => fg.zoomToFit(430, 60)}
            d3VelocityDecay={0.12}
            d3AlphaDecay={0.01}
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
        
        {/* 5. 팀원별 작업량 스택바 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[240px]">
          <div className="font-semibold mb-3 text-[#22223b]">팀원별 작업량</div>
          <div className="flex-1">
            <Bar
              ref={chartRefs[3]}
              data={{
                ...deptTypeDuration,
                datasets: deptTypeDuration.datasets.map(ds => ({
                  ...ds,
                  barThickness: 26,
                  maxBarThickness: 36,
                })),
              }}
              options={{
                plugins: { legend: { position: 'bottom' } },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { stacked: true },
                  y: { stacked: true, beginAtZero: true, title: { display: true, text: '시간' } },
                },
              }}
              height={340}
            />
          </div>
        </div>
        
        {/* 6. 수행시간 분포 박스플롯 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">수행시간 분포</div>
          <Bar
            ref={chartRefs[4]}
            data={execTimeStats}
            options={{
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '수행시간(분)' } } },
            }}
            height={180}
          />
        </div>

        {/* 7. 품질 vs 시간 산점도 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">품질 vs 시간</div>
          <Scatter
            ref={chartRefs[5]}
            data={{
              ...qualityScatter,
              datasets: qualityScatter.datasets.map(ds => ({
                ...ds,
                backgroundColor: '#38bdf8', // 이쁜 파랑 (ex: #38bdf8, #6366f1 등)
                pointBorderColor: '#6366f1', // 테두리도 살짝 이쁘게
                pointRadius: 5,
                pointHoverRadius: 7,
              })),
            }}
            options={{
              plugins: { legend: { position: 'bottom' } },
              scales: {
                x: { title: { display: true, text: '평균 품질점수' } },
                y: { title: { display: true, text: '수행시간(분)' } },
              },
            }}
            height={180}
          />
        </div>

        {/* 8. 월별 작업량 라인차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">월별 작업량</div>
          <Line
            ref={chartRefs[6]}
            data={monthlyCount}
            options={{
              plugins: { legend: { display: false } },
              scales: { 
                y: { beginAtZero: true, title: { display: true, text: '일정 건수' } },
                x: { title: { display: true, text: '월' } },
              },
            }}
            height={180}
          />
        </div>

        {/* 9. 이슈 발생률 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">이슈 발생률</div>
          <Bar
            ref={chartRefs[7]}
            data={issueMatrix}
            options={{
              plugins: { legend: { position: 'bottom' } },
              scales: {
                x: { title: { display: true, text: '업무 태그' } },
                y: { beginAtZero: true, title: { display: true, text: '지연 건수' } }
              }
            }}
            height={180}
          />
        </div>
      </div>
    </>
  );
} 