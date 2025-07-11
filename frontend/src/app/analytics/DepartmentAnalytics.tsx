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
  average_delay_per_member: Record<string, number>; // 팀원별 평균 응답 및 지연 시간
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

export default function DepartmentAnalytics() {
  const [departmentAnalysis, setDepartmentAnalysis] = useState<DepartmentScheduleAnalysis[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // 차트별 ref 생성 (9개)
  const chartRefs = [
    useRef<HTMLDivElement>(null), // 1. 팀원별 응답시간
    useRef<HTMLDivElement>(null), // 2. 일정 유형 비율
    useRef<HTMLDivElement>(null), // 3. 시간대별 병목 히트맵
    useRef<HTMLDivElement>(null), // 4. 협업 네트워크
    useRef<HTMLDivElement>(null), // 5. 팀원별 작업량
    useRef<HTMLDivElement>(null), // 6. 수행시간 분포
    useRef<HTMLDivElement>(null), // 7. 품질 vs 시간
    useRef<HTMLDivElement>(null), // 8. 월별 작업량
    useRef<HTMLDivElement>(null), // 9. 이슈 발생률
  ];
  const chartDescriptions = [
    '팀원별 응답시간',
    '일정 유형 비율',
    '시간대별 병목',
    '협업 네트워크',
    '팀원별 작업량',
    '수행시간 분포',
    '품질 vs 시간',
    '월별 작업량',
    '이슈 발생률',
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
    fetch('http://localhost:3001/api/analytics/departmentTasks')
      .then(res => res.json())
      .then((data: DepartmentScheduleAnalysis[]) => {
        // 데이터가 배열인지 확인하고 설정
        const analysisArray = Array.isArray(data) ? data : [];
        setDepartmentAnalysis(analysisArray);
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
      // 1. 차트 이미지 캡처
      const chartImages = await captureCharts();
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
            start: departmentAnalysis[0]?.date || dayjs().format('YYYY-MM-DD'),
            end: departmentAnalysis[departmentAnalysis.length - 1]?.date || dayjs().format('YYYY-MM-DD')
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
  const delayByAssignee = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) {
      return { labels: [], datasets: [] };
    }

    const firstData = departmentAnalysis[0];
    if (!firstData || !firstData.average_delay_per_member) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.average_delay_per_member);
    const data = Object.values(firstData.average_delay_per_member);

    return {
      labels,
      datasets: [
        {
          label: '평균 응답시간 (분)',
          data,
          backgroundColor: '#3b82f6',
        },
      ],
    };
  }, [departmentAnalysis]);

  //2번 차트: 일정 유형 파이차트
  const typePieData = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) {
      return { labels: [], datasets: [] };
    }

    const firstData = departmentAnalysis[0];
    if (!firstData || !firstData.schedule_type_ratio) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.schedule_type_ratio);
    const data = Object.values(firstData.schedule_type_ratio);

    return {
      labels,
      datasets: [
        {
          label: '일정 유형 분포',
          data,
          backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
        },
      ],
    };
  }, [departmentAnalysis]);

  //3번 차트: 시간대별 병목 히트맵
  const heatmapData = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) {
      return [];
    }

    const firstData = departmentAnalysis[0];
    if (!firstData || !firstData.bottleneck_time_slots) {
      return [];
    }

    const timeBlocks = ['08-10', '10-12', '12-14', '14-16', '16-18'];
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    
    // 2차원 배열로 변환 (시간대 행, 요일 열)
    return timeBlocks.map(tb => 
      days.map(d => firstData.bottleneck_time_slots[tb]?.[d] || 0)
    );
  }, [departmentAnalysis]);

  //4. 협업 네트워크 그래프
  const graphData = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) {
      return { nodes: [], links: [] };
    }

    const firstData = departmentAnalysis[0];
    if (!firstData || !firstData.collaboration_network) {
      return { nodes: [], links: [] };
    }

    const nodes = new Set<string>();
    const edges: { from: string; to: string }[] = [];

    Object.entries(firstData.collaboration_network).forEach(([member, collaborators]) => {
      nodes.add(member);
      
      // collaborators가 배열인지 확인하고 안전하게 처리
      if (Array.isArray(collaborators)) {
        collaborators.forEach(collaborator => {
          if (typeof collaborator === 'string') {
            nodes.add(collaborator);
            edges.push({ from: member, to: collaborator });
          }
        });
      } else if (typeof collaborators === 'string') {
        // collaborators가 단일 문자열인 경우
        nodes.add(collaborators);
        edges.push({ from: member, to: collaborators });
      } else if (typeof collaborators === 'object' && collaborators !== null) {
        // collaborators가 객체인 경우 (예: {name: string, count: number})
        Object.keys(collaborators).forEach(collaborator => {
          if (typeof collaborator === 'string') {
            nodes.add(collaborator);
            edges.push({ from: member, to: collaborator });
          }
        });
      }
    });

    return {
      nodes: Array.from(nodes).map(id => ({ id })),
      links: edges.map(e => ({ source: e.from, target: e.to })),
    };
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

    const members = Object.keys(firstData.workload_by_member_and_type);
    const allTypes = Array.from(
      new Set(
        Object.values(firstData.workload_by_member_and_type)
          .flatMap(memberData => Object.keys(memberData))
      )
    );

    const datasets = allTypes.map((type, idx) => ({
      label: type,
      data: members.map(member => firstData.workload_by_member_and_type[member]?.[type] || 0),
      backgroundColor: ['#60a5fa', '#f59e0b', '#10b981', '#ef4444'][idx % 4],
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

    const labels = Object.keys(firstData.execution_time_stats);
    const minData = labels.map(name => firstData.execution_time_stats[name]?.min || 0);
    const avgData = labels.map(name => {
      const stats = firstData.execution_time_stats[name];
      return stats ? (stats.min + stats.max) / 2 : 0; // 중앙값 대신 평균 사용
    });
    const maxData = labels.map(name => firstData.execution_time_stats[name]?.max || 0);

    return {
      labels,
      datasets: [
        {
          label: '최소',
          data: minData,
          backgroundColor: 'rgba(59,130,246,0.1)',
        },
        {
          label: '평균',
          data: avgData,
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
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) {
      return { datasets: [] };
    }

    const firstData = departmentAnalysis[0];
    if (!firstData || !firstData.quality_stats) {
      return { datasets: [] };
    }

    const members = Object.keys(firstData.quality_stats);
    const data = members.map(member => {
      const stats = firstData.quality_stats[member];
      return {
        x: stats?.avg || 0, // 평균 품질
        y: firstData.execution_time_stats?.[member]?.median || 0, // 중앙값 수행시간
      };
    });

    return {
      datasets: [
        {
          label: '품질 vs 시간',
          data,
          backgroundColor: '#3b82f6',
        },
      ],
    };
  }, [departmentAnalysis]);
  
  //8번 차트: 월별 작업량 라인차트
  const monthlyCount = useMemo(() => {
    if (!Array.isArray(departmentAnalysis) || departmentAnalysis.length === 0) {
      return { labels: [], datasets: [] };
    }

    const firstData = departmentAnalysis[0];
    if (!firstData || !firstData.monthly_schedule_trends) {
      return { labels: [], datasets: [] };
    }

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

    const labels = Object.keys(firstData.issue_occurrence_rate);
    const allTags = Array.from(
      new Set(
        Object.values(firstData.issue_occurrence_rate)
          .flatMap(tagData => Object.keys(tagData))
      )
    );

    const datasets = allTags.map((tag, i) => ({
      label: tag,
      data: labels.map(label => firstData.issue_occurrence_rate[label]?.[tag] || 0),
      backgroundColor: ['#2563eb', '#f59e0b', '#10b981', '#6d28d9'][i % 4],
    }));

    return { labels, datasets };
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
                  분석 기간: {dayjs(departmentAnalysis[0].date).format('YYYY-MM-DD')} ~ {dayjs(departmentAnalysis[departmentAnalysis.length - 1].date).format('YYYY-MM-DD')}
                  <span className="mx-2">•</span>
                  총 {departmentAnalysis.reduce((sum, item) => sum + (item.total_schedules ?? 0), 0)}개 일정
                  <span className="mx-2">•</span>
                  평균 지연시간: {
                    departmentAnalysis.length > 0 && departmentAnalysis[0].average_delay_per_member
                      ? (() => {
                          const values = Object.values(departmentAnalysis[0].average_delay_per_member)
                            .map(v => typeof v === "number" && !isNaN(v) ? v : 0);
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
        <div ref={chartRefs[0]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">팀원별 응답시간</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                ...delayByAssignee,
                datasets: delayByAssignee.datasets.map(ds => ({
                  ...ds,
                  barThickness: 26,
                  maxBarThickness: 36,
                })),
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '평균 지연(분)' } } },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* 2. 일정 유형 파이차트 */}
        <div ref={chartRefs[1]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
          <div className="font-semibold mb-3 text-[#22223b]">일정 유형 비율</div>
          <div className="w-[270px] h-[270px] flex items-center justify-center">
            <Pie
              data={typePieData}
              options={{
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* 3. 시간대별 병목 히트맵 (커스텀) */}
        <div ref={chartRefs[2]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">시간대별 병목</div>
          <div className="flex">
            <div className="flex flex-col justify-center mr-2">
              {['08-10','10-12','12-14','14-16','16-18'].map((block) => (
                <div key={block} className="h-9 flex items-center justify-end text-[#7b8794] text-sm" style={{height:36}}>{block}</div>
              ))}
            </div>

            <div className="flex flex-col">
                {heatmapData.map((row, i) => (
                <div key={i} className="flex mb-1 last:mb-0">
                  {row.map((val, j) => {
                    let color = 'bg-blue-50';
                    if (val >= 6) color = 'bg-blue-700';
                    else if (val >= 4) color = 'bg-blue-500';
                    else if (val >= 2) color = 'bg-blue-300';
                    else if (val >= 1) color = 'bg-blue-100';
                    return (
                      <div key={j} className={`rounded-lg ${color}`} style={{width:36,height:36,marginRight:j<row.length-1?8:0}}>
                        <span className="text-xs text-white font-bold flex items-center justify-center h-full w-full">{val}</span>
                      </div>
                    );
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

        {/* 4. 협업 네트워크 그래프 (실제 차트) */}
        <div ref={chartRefs[3]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center justify-center min-h-[220px]">
          <div className="font-semibold mb-3 text-[#22223b]">협업 네트워크</div>
          <div className="w-full flex-1 flex items-center justify-center" style={{height:200}}>
            
            <ForceGraph2D
              graphData={graphData}
              nodeLabel={(node: any) => node.id}
              nodeAutoColorBy="group"
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              width={220}
              height={200}
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
        
        {/* 5. 팀원별 작업량 스택바 */}
        <div ref={chartRefs[4]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[240px]">
          <div className="font-semibold mb-3 text-[#22223b]">팀원별 작업량</div>
          <div className="flex-1">
            <Bar
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
            />
          </div>
        </div>
        
        {/* 6. 수행시간 분포 박스플롯 (바형태로 대체) */}
        <div ref={chartRefs[5]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">수행시간 분포</div>
          <Bar
            data={{
              ...execTimeStats,
              datasets: execTimeStats.datasets.map(ds => ({
                ...ds,
                barThickness: 26,
                maxBarThickness: 36,
              })),
            }}
            options={{
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '수행시간(분)' } } },
            }}
            height={180}
          />
        </div>

        {/* 7. 품질 vs 시간 산점도 */}
        <div ref={chartRefs[6]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">품질 vs 시간</div>
          <Scatter
            data={qualityScatter}
            options={{
              plugins: { legend: { position: 'top' } },
              scales: {
                x: { title: { display: true, text: '평균 품질점수' } },
                y: { title: { display: true, text: '수행시간(분)' } },
              },
            }}
            height={180}
          />
        </div>

        {/* 8. 월별 작업량 라인차트 */}
        <div ref={chartRefs[7]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">월별 작업량</div>
          <Line
            data={monthlyCount}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '작업 건수' } } },
            }}
            height={180}
          />
        </div>

        {/* 9. 이슈 발생률 (막대그래프) */}
        <div ref={chartRefs[8]} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">이슈 발생률</div>
          <Bar
            data={{
              ...issueMatrix,
              datasets: issueMatrix.datasets.map(ds => ({
                ...ds,
                barThickness: 26,
                maxBarThickness: 36,
              })),
            }}
            options={{
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '지연 건수' } } },
            }}
            height={180}
          />
        </div>
      </div>
    </>
  );
} 