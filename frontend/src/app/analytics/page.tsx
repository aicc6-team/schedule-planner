'use client';

import { useState } from 'react';
import { Bar, Scatter, Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';
import { CheckCircleIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Navigation from '@/components/Navigation';
import dynamic from 'next/dynamic';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

// ForceGraph2D를 react-force-graph-2d에서 동적 import (SSR 비활성화)
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

// 샘플 통계값 (이미지와 동일)
const stats = [
  {
    label: '이행률',
    value: '78%',
    icon: <CheckCircleIcon className="w-7 h-7 text-primary-500 mb-1" />,
    color: 'text-primary-600',
    border: 'border-blue-100',
  },
  {
    label: '평균 수',
    value: '35',
    icon: (
      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 mb-1">
        <span className="text-blue-400 text-lg font-bold">%</span>
      </div>
    ),
    color: 'text-blue-500',
    border: 'border-blue-100',
  },
  {
    label: '연기율',
    value: '19%',
    icon: <ArrowPathIcon className="w-7 h-7 text-green-500 mb-1" />,
    color: 'text-green-500',
    border: 'border-green-100',
  },
  {
    label: '연기 횟수',
    value: '5',
    icon: <ExclamationTriangleIcon className="w-7 h-7 text-red-400 mb-1" />,
    color: 'text-red-500',
    border: 'border-red-100',
  },
];

// 히트맵 샘플 (가로: 요일, 세로: 시간대)
const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
const timeBlocks = ['08-10', '10-12', '12-14', '14-16', '16-18'];
// 5(시간대) x 7(요일)
const heatmap = [
  [2, 3, 1, 0, 0, 0, 0], // 08-10
  [3, 4, 2, 1, 0, 0, 0], // 10-12
  [2, 3, 2, 1, 0, 0, 0], // 12-14
  [1, 2, 1, 0, 0, 0, 0], // 14-16
  [0, 1, 0, 0, 0, 0, 0], // 16-18
];

// 막대그래프 샘플
const barData = {
  labels: ['1열', '2열', '3열'],
  datasets: [
    {
      label: '이행',
      data: [70, 80, 65],
      backgroundColor: '#3b82f6',
    },
    {
      label: '연기',
      data: [40, 60, 45],
      backgroundColor: '#f59e42',
    },
    {
      label: '미이행',
      data: [60, 70, 50],
      backgroundColor: '#fbbf24',
    },
  ],
};

// 산점도 샘플 (시간 ROI: 일정별 예상 소요시간 대비 실산출)
const scatterData = {
  datasets: [
    {
      label: '예상 소요시간',
      data: [
        { x: 2, y: 1500 }, { x: 4, y: 2000 }, { x: 6, y: 1800 }, { x: 8, y: 2500 }, { x: 10, y: 2200 },
        { x: 12, y: 3000 }, { x: 14, y: 2700 }, { x: 16, y: 3200 }, { x: 18, y: 2900 }, { x: 20, y: 3500 },
        { x: 22, y: 3300 }, { x: 24, y: 3700 },
      ],
      backgroundColor: '#10b981',
    },
    {
      label: '실산출',
      data: [
        { x: 1, y: 1200 }, { x: 3, y: 1600 }, { x: 5, y: 1400 }, { x: 7, y: 2100 }, { x: 9, y: 1700 },
        { x: 11, y: 2500 }, { x: 13, y: 2300 }, { x: 15, y: 2700 }, { x: 17, y: 2500 }, { x: 19, y: 3100 },
        { x: 21, y: 2900 }, { x: 23, y: 3300 },
      ],
      backgroundColor: '#38bdf8',
    },
  ],
};

// 감정 점수 변화 (선그래프)
const lineData = {
  labels: weekDays,
  datasets: [
    {
      label: '감정 점수',
      data: [3.5, 3.8, 4.0, 3.6, 3.9, 3.7, 4.1],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
};

// 샘플 일정 데이터 (중요도: 1~5, 반복: 0~3)
const sampleTasks = [
  { title: '보고서 작성', importance: 5, repeat: 2 },
  { title: '운동', importance: 4, repeat: 0 },
  { title: '팀 미팅', importance: 3, repeat: 1 },
  { title: '메일 확인', importance: 2, repeat: 3 },
  { title: '문서 정리', importance: 1, repeat: 0 },
  { title: '기획안 작성', importance: 5, repeat: 3 },
  { title: '고객 미팅', importance: 4, repeat: 2 },
  { title: '디자인 검토', importance: 2, repeat: 1 },
];
// 산점도 데이터 변환
const eisenhowerScatter = {
  datasets: [
    {
      label: '일정',
      data: sampleTasks.map(t => ({
        x: t.importance,
        y: t.repeat,
        label: t.title,
      })),
      backgroundColor: '#2563eb',
      pointRadius: 5,
      pointHoverRadius: 7,
    },
  ],
};
const eisenhowerOptions = {
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `${ctx.raw.label} (중요도: ${ctx.raw.x}, 반복: ${ctx.raw.y})`,
      },
    },
  },
  scales: {
    x: {
      min: 0,
      max: 5,
      title: { display: true, text: '중요도', font: { size: 16 } },
      grid: {
        color: (ctx: any) => ctx.tick.value === 2.5 ? '#222' : '#e5e7eb',
        lineWidth: (ctx: any) => ctx.tick.value === 2.5 ? 3 : 1,
      },
      ticks: { stepSize: 1, font: { size: 14 } },
    },
    y: {
      min: 0,
      max: 3,
      title: { display: true, text: '반복', font: { size: 16 } },
      grid: {
        color: (ctx: any) => ctx.tick.value === 1.5 ? '#222' : '#e5e7eb',
        lineWidth: (ctx: any) => ctx.tick.value === 1.5 ? 3 : 1,
      },
      ticks: { stepSize: 1, font: { size: 14 } },
    },
  },
};

// 회사탭 간트차트용 더미 프로젝트 데이터
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

function GanttChart({ project }: { project: { name: string, tasks: any[], totalDays: number } }) {
  const width = 360;
  const height = 180;
  const leftPad = 70;
  const topPad = 30;
  const barHeight = 18;
  const barGap = 16;
  const dayWidth = (width - leftPad - 20) / (project.totalDays - 1);
  // 예시: 현재 날짜를 7일차(6/8)로 가정
  const currentDay = 7; // 0-indexed, 6/8
  const currentX = leftPad + currentDay * dayWidth;
  return (
    <svg width={width} height={height} style={{ background: '#f8fafc', borderRadius: 12 }}>
      {/* Title */}
      <text x={width/2} y={18} textAnchor="middle" fontSize="15" fontWeight="bold" fill="#22223b">{project.name}</text>
      {/* Grid lines & day labels */}
      {[...Array(project.totalDays)].map((_, i) => (
        <g key={i}>
          <line x1={leftPad + i*dayWidth} y1={topPad} x2={leftPad + i*dayWidth} y2={height-20} stroke="#e5e7eb" strokeWidth={i%5===0?2:1} />
          <text x={leftPad + i*dayWidth} y={height-8} fontSize="10" fill="#888" textAnchor="middle">6/{i+1}</text>
        </g>
      ))}
      {/* 현재 진행중인 날짜를 나타내는 빨간 라인 */}
      <line x1={currentX} y1={topPad-6} x2={currentX} y2={height-20} stroke="#ef4444" strokeWidth={2.5} strokeDasharray="4 2" />
      {/* Task bars */}
      {project.tasks.map((task, idx) => (
        <g key={task.name}>
          <text x={leftPad-8} y={topPad+barHeight/2+idx*(barHeight+barGap)} fontSize="12" fill="#22223b" textAnchor="end" alignmentBaseline="middle">{task.name}</text>
          <rect
            x={leftPad + task.start*dayWidth}
            y={topPad + idx*(barHeight+barGap)}
            width={(task.end-task.start)*dayWidth}
            height={barHeight}
            rx={5}
            fill={task.color}
            stroke="#22223b"
            strokeWidth={0.5}
            style={{ filter: 'drop-shadow(0 1px 2px #0001)' }}
          />
          {/* 진행률 예시: 개발은 60% 완료, 나머지는 100% */}
          {task.name==='개발' && (
            <rect
              x={leftPad + task.start*dayWidth}
              y={topPad + idx*(barHeight+barGap)}
              width={0.6*(task.end-task.start)*dayWidth}
              height={barHeight}
              rx={5}
              fill="#22223b22"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

// PERT 네트워크 SVG 컴포넌트 추가
function PertNetworkChart() {
  // 원형 배치용 더미 부서 데이터
  const departments = [
    { label: '영업팀', color: '#60a5fa' },
    { label: '기획팀', color: '#fbbf24' },
    { label: '개발팀', color: '#34d399' },
    { label: 'QA팀', color: '#a78bfa' },
    { label: '배포팀', color: '#f87171' },
    { label: 'CS팀', color: '#38bdf8' },
  ];
  const centerX = 210, centerY = 100, radius = 70;
  // 원형 좌표 계산
  const nodes = departments.map((d, i) => {
    const angle = (2 * Math.PI * i) / departments.length - Math.PI/2;
    return {
      ...d,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      id: i,
    };
  });
  // 여러 업무 흐름(화살표)
  const links = [
    { from: 0, to: 1 }, // 영업→기획
    { from: 0, to: 2 }, // 영업→개발
    { from: 1, to: 2 }, // 기획→개발
    { from: 2, to: 3 }, // 개발→QA
    { from: 3, to: 4 }, // QA→배포
    { from: 2, to: 5 }, // 개발→CS
    { from: 5, to: 3 }, // CS→QA
  ];
  return (
    <svg width={420} height={200} style={{ background: '#f8fafc', borderRadius: 12 }}>
      {/* Links (arrows) */}
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
        </marker>
      </defs>
      {links.map((l, i) => {
        const from = nodes[l.from];
        const to = nodes[l.to];
        // 곡선 화살표(중앙 각도 차이로 곡률 조정)
        const dx = to.x - from.x, dy = to.y - from.y;
        const dr = Math.sqrt(dx*dx + dy*dy) * 1.2;
        const sweep = (l.from < l.to) ? 0 : 1;
        return (
          <path
            key={i}
            d={`M${from.x},${from.y} A${dr},${dr} 0 0,${sweep} ${to.x},${to.y}`}
            stroke="#38bdf8"
            strokeWidth={2}
            fill="none"
            markerEnd="url(#arrowhead)"
            opacity={0.85}
          />
        );
      })}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={28} fill={n.color+"22"} stroke={n.color} strokeWidth={2} />
          <text x={n.x} y={n.y} textAnchor="middle" alignmentBaseline="middle" fontSize="15" fill={n.color} fontWeight="bold">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}

// Sankey 다이어그램용 더미 데이터 및 SVG 컴포넌트
const sankeyNodes = [
  { id: '영업', color: '#3b82f6' },
  { id: '개발', color: '#10b981' },
  { id: 'CS', color: '#f59e42' },
  { id: '기획', color: '#6366f1' },
  { id: '완료', color: '#a3e635' },
];
const sankeyLinks = [
  { source: '영업', target: '개발', value: 30 },
  { source: '영업', target: '기획', value: 10 },
  { source: '개발', target: 'CS', value: 20 },
  { source: '개발', target: '완료', value: 15 },
  { source: '기획', target: '개발', value: 8 },
  { source: 'CS', target: '완료', value: 18 },
];

function SankeyDiagram() {
  // 노드 위치 수동 배치 (좌→우)
  const nodePos: Record<string, { x: number; y: number }> = {
    '영업': { x: 60, y: 100 },
    '기획': { x: 60, y: 200 },
    '개발': { x: 220, y: 120 },
    'CS': { x: 380, y: 100 },
    '완료': { x: 540, y: 120 },
  };
  // 링크의 굵기는 value에 비례
  const maxVal = Math.max(...sankeyLinks.map(l => l.value));
  return (
    <svg width={600} height={260} style={{ background: '#f8fafc', borderRadius: 12 }}>
      {/* Links */}
      {sankeyLinks.map((l, i) => {
        const from = nodePos[l.source];
        const to = nodePos[l.target];
        const thickness = 8 + 18 * (l.value / maxVal); // min 8, max 26
        // 곡선(베지어)로 연결
        const midX = (from.x + to.x) / 2;
        return (
          <path
            key={i}
            d={`M${from.x},${from.y} C${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}`}
            stroke="#bbb"
            strokeWidth={thickness}
            fill="none"
            opacity={0.5}
          />
        );
      })}
      {/* Nodes */}
      {sankeyNodes.map((n, i) => (
        <g key={n.id}>
          <rect x={nodePos[n.id].x-30} y={nodePos[n.id].y-22} width={60} height={44} rx={12} fill={n.color+"33"} stroke={n.color} strokeWidth={2} />
          <text x={nodePos[n.id].x} y={nodePos[n.id].y} textAnchor="middle" alignmentBaseline="middle" fontSize="16" fill={n.color} fontWeight="bold">{n.id}</text>
        </g>
      ))}
      {/* 값 라벨 */}
      {sankeyLinks.map((l, i) => {
        const from = nodePos[l.source];
        const to = nodePos[l.target];
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        return (
          <text key={i+100} x={midX} y={midY-10} textAnchor="middle" fontSize="13" fill="#888">{l.value}</text>
        );
      })}
    </svg>
  );
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'personal'|'department'|'company'|'project'>('personal');
  const [selectedProjectId, setSelectedProjectId] = useState(ganttProjects[0].id);
  const tabs = [
    { key: 'personal', label: '개인' },
    { key: 'department', label: '부서' },
    { key: 'company', label: '회사' },
    { key: 'project', label: '프로젝트' },
  ];
  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary-900">일정 분석</h1>
            {/* 탭 UI - moved to right of title */}
            <div className="flex gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors duration-150
                    ${activeTab === tab.key ? 'bg-white border-blue-500 text-blue-600' : 'bg-blue-50 border-transparent text-blue-400 hover:bg-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-secondary-600 mb-8">일정의 패턴과 생산성 인사이트를 확인하세요</p>
          {/* 탭별 컨텐츠 */}
          {activeTab === 'personal' && (
            <>
              {/* 3x3 그리드: 9개 개인 일정 분석 차트 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* 1. 일별 이행률 (선그래프) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
                  <div className="font-semibold mb-3 text-[#22223b]">일별 이행률</div>
                  <div className="flex-1 flex items-center">
                    <Line
                      data={{
                        labels: ['2024-06-01','2024-06-02','2024-06-03','2024-06-04','2024-06-05','2024-06-06','2024-06-07'],
                        datasets: [{
                          label: '이행률(%)',
                          data: [80, 75, 90, 85, 70, 95, 88],
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(59,130,246,0.1)',
                          fill: true,
                          tension: 0.4,
                        }],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: { y: { min: 0, max: 100, title: { display: true, text: '이행률(%)' } } },
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
                      {['08-10','10-12','12-14','14-16','16-18'].map((block) => (
                        <div key={block} className="h-9 flex items-center justify-end text-[#7b8794] text-sm" style={{height:36}}>{block}</div>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      {[[80,70,60,50,40,30,20],[75,85,65,55,45,35,25],[90,80,70,60,50,40,30],[85,75,65,55,45,35,25],[70,60,50,40,30,20,10]].map((row,i) => (
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
                    data={{
                      labels: ['업무','회의','개인','기타'],
                      datasets: [{
                        label: '완료율(%)',
                        data: [85, 70, 90, 60],
                        backgroundColor: ['#3b82f6','#f59e42','#10b981','#6366f1'],
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { min: 0, max: 100, title: { display: true, text: '완료율(%)' } } },
                    }}
                    height={180}
                  />
                </div>
                {/* 4. 소요시간 히스토그램 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">소요시간 분포</div>
                  {/* 히스토그램: 막대그래프로 대체 */}
                  <Bar
                    data={{
                      labels: ['0~30','30~60','60~90','90~120','120~150','150~180'],
                      datasets: [{
                        label: '건수',
                        data: [5, 12, 18, 9, 4, 2],
                        backgroundColor: '#6366f1',
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: '건수' } } },
                    }}
                    height={180}
                  />
                </div>
                {/* 5. 소요시간 vs 감정 (산점도) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">소요시간 vs 감정</div>
                  <Scatter
                    data={{
                      datasets: [
                        { label: '업무', data: [ {x:30,y:4},{x:60,y:3.5},{x:90,y:3},{x:120,y:2.5},{x:150,y:2} ], backgroundColor:'#3b82f6' },
                        { label: '회의', data: [ {x:30,y:4.2},{x:60,y:3.8},{x:90,y:3.2},{x:120,y:2.8},{x:150,y:2.3} ], backgroundColor:'#f59e42' },
                      ]
                    }}
                    options={{
                      plugins: { legend: { position: 'top' } },
                      scales: {
                        x: { title: { display: true, text: '소요시간(분)' } },
                        y: { min: 0, max: 5, title: { display: true, text: '감정점수' } },
                      },
                    }}
                    height={180}
                  />
                </div>
                {/* 6. 태그별 소요시간 (박스플롯: 바형태로 대체) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">태그별 소요시간</div>
                  <Bar
                    data={{
                      labels: ['업무','회의','개인','기타'],
                      datasets: [
                        { label: '최소', data: [30,20,25,15], backgroundColor:'#dbeafe' },
                        { label: '평균', data: [60,50,55,40], backgroundColor:'#3b82f6' },
                        { label: '최대', data: [120,90,100,80], backgroundColor:'#1e40af' },
                      ]
                    }}
                    options={{
                      plugins: { legend: { position: 'bottom' } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: '소요시간(분)' } } },
                    }}
                    height={180}
                  />
                </div>
                {/* 7. 상태 파이차트 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
                  <div className="font-semibold mb-3 text-[#22223b]">상태 비율</div>
                  <div className="w-full flex justify-center">
                    <Bar
                      data={{
                        labels: ['완료','지연','미이행'],
                        datasets: [{
                          label: '비율(%)',
                          data: [70, 20, 10],
                          backgroundColor: ['#10b981','#f59e42','#f87171'],
                        }],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        indexAxis: 'y',
                        scales: { x: { min: 0, max: 100, title: { display: true, text: '비율(%)' } } },
                      }}
                      height={120}
                    />
                  </div>
                </div>
                {/* 8. 누적 완료 영역차트 (Line+fill) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">누적 완료 추이</div>
                  <Line
                    data={{
                      labels: ['2024-06-01','2024-06-02','2024-06-03','2024-06-04','2024-06-05','2024-06-06','2024-06-07'],
                      datasets: [{
                        label: '누적 완료',
                        data: [5, 12, 20, 28, 35, 40, 50],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16,185,129,0.2)',
                        fill: true,
                        tension: 0.4,
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: '누적 완료' } } },
                    }}
                    height={180}
                  />
                </div>
                {/* 9. 시간대별 집중도 (면적그래프) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">시간대별 집중도</div>
                  <Line
                    data={{
                      labels: ['08','09','10','11','12','13','14','15','16','17','18'],
                      datasets: [{
                        label: '일정 건수',
                        data: [2, 4, 7, 10, 8, 6, 5, 7, 9, 6, 3],
                        borderColor: '#f59e42',
                        backgroundColor: 'rgba(245,158,66,0.2)',
                        fill: true,
                        tension: 0.4,
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: '일정 건수' } } },
                    }}
                    height={180}
                  />
                </div>
              </div>
            </>
          )}
          {/* 부서탭: 부서 일정 분석 대시보드 */}
          {activeTab === 'department' && (
            <>
              {/* 3x3 그리드: 9개 부서 일정 분석 차트 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* 1. 팀원별 응답시간 (막대그래프) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
                  <div className="font-semibold mb-3 text-[#22223b]">팀원별 응답시간</div>
                  <div className="flex-1 flex items-center">
                    <Bar
                      data={{
                        labels: ['홍길동','김철수','이영희','박민수'],
                        datasets: [{
                          label: '평균 지연(분)',
                          data: [15, 22, 10, 30],
                          backgroundColor: '#3b82f6',
                        }],
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
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
                  <div className="font-semibold mb-3 text-[#22223b]">일정 유형 비율</div>
                  <div className="w-[270px] h-[270px] flex items-center justify-center">
                    <Pie
                      data={{
                        labels: ['회의','실행','검토'],
                        datasets: [{
                          data: [40, 35, 25],
                          backgroundColor: ['#6366f1','#10b981','#f59e42'],
                        }],
                      }}
                      options={{
                        plugins: { legend: { position: 'bottom' } },
                      }}
                    />
                  </div>
                </div>
                {/* 3. 시간대별 병목 히트맵 (커스텀) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">시간대별 병목</div>
                  <div className="flex">
                    <div className="flex flex-col justify-center mr-2">
                      {['08-10','10-12','12-14','14-16','16-18'].map((block) => (
                        <div key={block} className="h-9 flex items-center justify-end text-[#7b8794] text-sm" style={{height:36}}>{block}</div>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      {[[2,3,1,0,0,0,0],[3,4,2,1,0,0,0],[2,3,2,1,0,0,0],[1,2,1,0,0,0,0],[0,1,0,0,0,0,0]].map((row,i) => (
                        <div key={i} className="flex mb-1 last:mb-0">
                          {row.map((val,j) => {
                            let color = 'bg-blue-50';
                            if(val>=4) color='bg-red-700';
                            else if(val===3) color='bg-red-500';
                            else if(val===2) color='bg-red-300';
                            else if(val===1) color='bg-red-100';
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
                {/* 4. 협업 네트워크 그래프 (실제 차트) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center justify-center min-h-[220px]">
                  <div className="font-semibold mb-3 text-[#22223b]">협업 네트워크</div>
                  <div className="w-full flex-1 flex items-center justify-center" style={{height:200}}>
                    <ForceGraph2D
                      graphData={{
                        nodes: [
                          { id: '영업팀', group: 1 },
                          { id: '개발팀', group: 1 },
                          { id: '디자인팀', group: 2 },
                          { id: '기획팀', group: 2 },
                          { id: 'CS팀', group: 3 },
                        ] as any[],
                        links: [
                          { source: '영업팀', target: '개발팀' },
                          { source: '영업팀', target: '디자인팀' },
                          { source: '개발팀', target: '기획팀' },
                          { source: '디자인팀', target: 'CS팀' },
                          { source: '기획팀', target: 'CS팀' },
                        ] as any[],
                      }}
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
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[240px]">
                  <div className="font-semibold mb-3 text-[#22223b]">팀원별 작업량</div>
                  <div className="flex-1">
                    <Bar
                      data={{
                        labels: ['홍길동','김철수','이영희','박민수'],
                        datasets: [
                          { label: '회의', data: [5, 3, 4, 2], backgroundColor:'#6366f1' },
                          { label: '실행', data: [8, 7, 6, 5], backgroundColor:'#10b981' },
                          { label: '검토', data: [2, 4, 3, 6], backgroundColor:'#f59e42' },
                        ]
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
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">수행시간 분포</div>
                  <Bar
                    data={{
                      labels: ['홍길동','김철수','이영희','박민수'],
                      datasets: [
                        { label: '최소', data: [30,20,25,15], backgroundColor:'#dbeafe' },
                        { label: '평균', data: [60,50,55,40], backgroundColor:'#3b82f6' },
                        { label: '최대', data: [120,90,100,80], backgroundColor:'#1e40af' },
                      ]
                    }}
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
                    data={{
                      datasets: [
                        { label: '홍길동', data: [ {x:30,y:80},{x:60,y:85},{x:90,y:70} ], backgroundColor:'#3b82f6' },
                        { label: '김철수', data: [ {x:30,y:75},{x:60,y:80},{x:90,y:65} ], backgroundColor:'#10b981' },
                        { label: '이영희', data: [ {x:30,y:90},{x:60,y:95},{x:90,y:85} ], backgroundColor:'#f59e42' },
                      ]
                    }}
                    options={{
                      plugins: { legend: { position: 'top' } },
                      scales: {
                        x: { title: { display: true, text: '수행시간(분)' } },
                        y: { min: 0, max: 100, title: { display: true, text: '품질점수' } },
                      },
                    }}
                    height={180}
                  />
                </div>
                {/* 8. 월별 작업량 라인차트 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">월별 작업량</div>
                  <Line
                    data={{
                      labels: ['2024-01','2024-02','2024-03','2024-04','2024-05','2024-06'],
                      datasets: [{
                        label: '작업 건수',
                        data: [20, 25, 30, 28, 35, 40],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99,102,241,0.1)',
                        fill: true,
                        tension: 0.4,
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: '작업 건수' } } },
                    }}
                    height={180}
                  />
                </div>
                {/* 9. 이슈 발생률 (막대그래프) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">이슈 발생률</div>
                  <Bar
                    data={{
                      labels: ['홍길동','김철수','이영희','박민수'],
                      datasets: [
                        { label: '업무', data: [2, 1, 0, 3], backgroundColor:'#3b82f6' },
                        { label: '회의', data: [1, 2, 1, 0], backgroundColor:'#f59e42' },
                        { label: '검토', data: [0, 1, 2, 1], backgroundColor:'#10b981' },
                      ]
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
          )}
          {activeTab === 'company' && (
            <>
              {/* 3x3 그리드: 9개 프로젝트 일정 분석 차트 (회사탭) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* 1. 간트차트 (프로젝트 선택 + 전문 Gantt) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
                  <div className="font-semibold mb-3 text-[#22223b] flex items-center justify-between">
                    <span>간트 차트</span>
                    {/* 프로젝트 셀렉트 박스 */}
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
                    {/* 전문 Gantt Chart */}
                    <GanttChart project={ganttProjects.find(p => p.id === selectedProjectId) || ganttProjects[0]} />
                  </div>
                </div>
                {/* 2. PERT 네트워크 (SVG 네트워크 차트) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center min-h-[220px]">
                  <div className="font-semibold mb-3 text-[#22223b]">PERT 네트워크</div>
                  <div className="w-full flex-1 flex items-center justify-center">
                    <PertNetworkChart />
                  </div>
                </div>
                {/* 3. 단계별 지연 워터폴 (막대그래프) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">단계별 지연(워터폴)</div>
                  <Bar
                    data={{
                      labels: ['기획','설계','개발','테스트','배포'],
                      datasets: [{
                        label: '지연(일)',
                        data: [2, -1, 3, 0, -2],
                        backgroundColor: ['#f87171','#10b981','#f59e42','#6366f1','#a3e635'],
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { title: { display: true, text: '지연(일)' } } },
                    }}
                  />
                </div>
                {/* 4. 몬테카 히스토그램 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">완료일 분포(몬테카)</div>
                  <Bar
                    data={{
                      labels: Array.from({length: 10}, (_,i) => `6/${10+i}`),
                      datasets: [{
                        label: '완료 건수',
                        data: [1, 2, 5, 8, 12, 10, 7, 4, 2, 1],
                        backgroundColor: '#6366f1',
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: '건수' } } },
                    }}
                  />
                </div>
                {/* 5. 단계 진행률 라인차트 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">단계 진행률</div>
                  <Line
                    data={{
                      labels: ['6/1','6/5','6/10','6/15','6/20','6/25','6/30'],
                      datasets: [{
                        label: '진행률(%)',
                        data: [10, 30, 45, 60, 75, 90, 100],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.1)',
                        fill: true,
                        tension: 0.4,
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { min: 0, max: 100, title: { display: true, text: '진행률(%)' } } },
                    }}
                  />
                </div>
                {/* 6. 리스크 박스플롯 (바형태로 대체) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">리스크 분포</div>
                  <Bar
                    data={{
                      labels: ['기획','설계','개발','테스트','배포'],
                      datasets: [
                        { label: '최소', data: [0,1,2,1,0], backgroundColor:'#dbeafe' },
                        { label: '평균', data: [2,3,4,3,2], backgroundColor:'#3b82f6' },
                        { label: '최대', data: [5,6,7,6,5], backgroundColor:'#1e40af' },
                      ]
                    }}
                    options={{
                      plugins: { legend: { position: 'bottom' } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: '지연(일)' } } },
                    }}
                  />
                </div>
                {/* 7. 완료대기 산점도 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">완료-대기 산점도</div>
                  <Scatter
                    data={{
                      datasets: [
                        { label: '기획', data: [ {x:1,y:2},{x:2,y:1} ], backgroundColor:'#3b82f6' },
                        { label: '설계', data: [ {x:1,y:3},{x:2,y:2} ], backgroundColor:'#10b981' },
                        { label: '개발', data: [ {x:1,y:4},{x:2,y:3} ], backgroundColor:'#f59e42' },
                      ]
                    }}
                    options={{
                      plugins: { legend: { position: 'top' } },
                      scales: {
                        x: { title: { display: true, text: '선행 단계' } },
                        y: { title: { display: true, text: '후행 단계 대기(일)' } },
                      },
                    }}
                  />
                </div>
                {/* 8. 예산 vs 일정 면적차트 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">예산 vs 일정</div>
                  <Line
                    data={{
                      labels: ['6/1','6/5','6/10','6/15','6/20','6/25','6/30'],
                      datasets: [{
                        label: '누적 예산(만원)',
                        data: [10, 20, 35, 50, 70, 90, 100],
                        borderColor: '#f59e42',
                        backgroundColor: 'rgba(245,158,66,0.2)',
                        fill: true,
                        tension: 0.4,
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: '누적 예산(만원)' } } },
                    }}
                  />
                </div>
                {/* 9. 단계 상태 파이차트 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
                  <div className="font-semibold mb-3 text-[#22223b]">단계 상태 비율</div>
                  <div className="w-[270px] h-[270px] flex justify-center">
                    <Pie
                      data={{
                        labels: ['완료','진행','지연'],
                        datasets: [{
                          data: [60, 30, 10],
                          backgroundColor: ['#10b981','#6366f1','#f87171'],
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
          )}
          {activeTab === 'project' && (
            <>
              {/* 3x3 그리드: 9개 회사 일정 분석 차트 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* 1. 부서별 시간당 매출 산점도 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
                  <div className="font-semibold mb-3 text-[#22223b]">부서별 시간당 매출</div>
                  <div className="flex-1 flex items-center">
                    <Scatter
                      data={{
                        datasets: [
                          { label: '영업', data: [ {x:100,y:2000}, {x:120,y:2500}, {x:90,y:1800} ], backgroundColor:'#3b82f6' },
                          { label: '개발', data: [ {x:110,y:1500}, {x:130,y:1700}, {x:100,y:1600} ], backgroundColor:'#10b981' },
                          { label: 'CS', data: [ {x:80,y:1200}, {x:95,y:1300}, {x:85,y:1100} ], backgroundColor:'#f59e42' },
                        ]
                      }}
                      options={{
                        plugins: { legend: { position: 'top' } },
                        scales: {
                          x: { title: { display: true, text: '투입시간(시간)' } },
                          y: { title: { display: true, text: '매출(만원)' } },
                        },
                      }}
                    />
                  </div>
                </div>
                {/* 2. 피로도×생산성 버블차트 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
                  <div className="font-semibold mb-3 text-[#22223b]">피로도×생산성(버블)</div>
                  <div className="flex-1 flex items-center">
                    <Scatter
                      data={{
                        datasets: [
                          { label: '부서A', data: [ {x:80,y:60,r:15}, {x:90,y:70,r:20} ], backgroundColor:'rgba(59,130,246,0.5)' },
                          { label: '부서B', data: [ {x:70,y:80,r:10}, {x:60,y:90,r:18} ], backgroundColor:'rgba(16,185,129,0.5)' },
                        ]
                      }}
                      options={{
                        plugins: { legend: { position: 'top' } },
                        scales: {
                          x: { title: { display: true, text: '생산성' } },
                          y: { title: { display: true, text: '피로도' } },
                        },
                        elements: { point: { borderWidth: 1, borderColor: '#fff' } },
                      }}
                    />
                  </div>
                </div>
                {/* 3. 월별 듀얼라인차트 (생산성 vs 피로도) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
                  <div className="font-semibold mb-3 text-[#22223b]">월별 생산성 vs 피로도</div>
                  <div className="flex-1 flex items-center">
                    <Line
                      data={{
                        labels: ['1월','2월','3월','4월','5월','6월'],
                        datasets: [
                          { label: '생산성', data: [80, 85, 90, 88, 92, 95], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: false, yAxisID: 'y1' },
                          { label: '피로도', data: [60, 65, 70, 75, 80, 85], borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)', fill: false, yAxisID: 'y2' },
                        ]
                      }}
                      options={{
                        plugins: { legend: { position: 'top' } },
                        scales: {
                          x: { title: { display: true, text: '월' } },
                          y1: { type: 'linear', position: 'left', title: { display: true, text: '생산성' }, min: 0, max: 100 },
                          y2: { type: 'linear', position: 'right', title: { display: true, text: '피로도' }, min: 0, max: 100, grid: { drawOnChartArea: false } },
                        },
                      }}
                    />
                  </div>
                </div>
                {/* 4. Sankey 다이어그램 (플레이스홀더) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px] items-center justify-center">
                  <div className="font-semibold mb-3 text-[#22223b]">Sankey 다이어그램</div>
                  <div className="w-full flex items-center justify-center">
                    <SankeyDiagram />
                  </div>
                </div>
                {/* 5. 부서별 매출 막대그래프 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
                  <div className="font-semibold mb-3 text-[#22223b]">부서별 매출</div>
                  <div className="flex-1 flex items-center">
                    <Bar
                      data={{
                        labels: ['영업','개발','CS','기획'],
                        datasets: [{
                          label: '매출(만원)',
                          data: [5000, 4000, 2000, 1500],
                          backgroundColor: ['#3b82f6','#10b981','#f59e42','#6366f1'],
                        }],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, title: { display: true, text: '매출(만원)' } } },
                      }}
                    />
                  </div>
                </div>
                {/* 6. CS 건수 히스토그램 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
                  <div className="font-semibold mb-3 text-[#22223b]">CS 건수 분포</div>
                  <div className="flex-1 flex items-center">
                    <Bar
                      data={{
                        labels: ['0~10','10~20','20~30','30~40','40~50'],
                        datasets: [{
                          label: '부서 수',
                          data: [2, 5, 8, 3, 1],
                          backgroundColor: '#6366f1',
                        }],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, title: { display: true, text: '부서 수' } } },
                      }}
                    />
                  </div>
                </div>
                {/* 7. 부서별 피로도 박스플롯 (바형태로 대체) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
                  <div className="font-semibold mb-3 text-[#22223b]">부서별 피로도</div>
                  <div className="flex-1 flex items-center">
                    <Bar
                      data={{
                        labels: ['영업','개발','CS','기획'],
                        datasets: [
                          { label: '최소', data: [30, 40, 35, 45], backgroundColor:'#dbeafe' },
                          { label: '평균', data: [60, 70, 65, 75], backgroundColor:'#3b82f6' },
                          { label: '최대', data: [90, 95, 85, 100], backgroundColor:'#1e40af' },
                        ]
                      }}
                      options={{
                        plugins: { legend: { position: 'bottom' } },
                        scales: { y: { beginAtZero: true, title: { display: true, text: '피로도' } } },
                      }}
                    />
                  </div>
                </div>
                {/* 8. 조직 활용도 면적차트 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
                  <div className="font-semibold mb-3 text-[#22223b]">조직 활용도(면적)</div>
                  <div className="flex-1 flex items-center">
                    <Line
                      data={{
                        labels: ['1월','2월','3월','4월','5월','6월'],
                        datasets: [
                          { label: '영업', data: [100, 120, 130, 140, 150, 160], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true },
                          { label: '개발', data: [90, 100, 110, 120, 130, 140], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true },
                          { label: 'CS', data: [80, 85, 90, 95, 100, 105], borderColor: '#f59e42', backgroundColor: 'rgba(245,158,66,0.1)', fill: true },
                        ]
                      }}
                      options={{
                        plugins: { legend: { position: 'top' } },
                        scales: { y: { beginAtZero: true, title: { display: true, text: '투입시간' } } },
                      }}
                    />
                  </div>
                </div>
                {/* 9. ROI 선그래프 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
                  <div className="font-semibold mb-3 text-[#22223b]">월별 ROI</div>
                  <div className="flex-1 flex items-center">
                    <Line
                      data={{
                        labels: ['1월','2월','3월','4월','5월','6월'],
                        datasets: [
                          { label: 'ROI', data: [1.2, 1.3, 1.5, 1.4, 1.6, 1.7], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 },
                        ]
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, title: { display: true, text: 'ROI' } } },
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
