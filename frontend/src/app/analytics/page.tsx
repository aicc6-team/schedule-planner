'use client';

import { useState } from 'react';
import { Bar, Scatter, Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';
import { CheckCircleIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Navigation from '@/components/Navigation';
import dynamic from 'next/dynamic';
import PersonalAnalytics from './PersonalAnalytics';
import DepartmentAnalytics from './DepartmentAnalytics';
import CompanyAnalytics from './CompanyAnalytics';
import ProjectAnalytics from './ProjectAnalytics';

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
          {activeTab === 'personal' && <PersonalAnalytics />}
          {activeTab === 'department' && <DepartmentAnalytics />}
          {activeTab === 'company' && <CompanyAnalytics />}
          {activeTab === 'project' && <ProjectAnalytics />}
        </div>
      </main>
    </div>
  );
}