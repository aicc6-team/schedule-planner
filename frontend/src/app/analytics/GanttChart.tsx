type GanttProject = {
  name: string;
  tasks: { name: string; start: number; end: number; color: string }[];
  totalDays: number;
};

export default function GanttChart({ project }: { project: GanttProject }) {
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