interface Team {
  label: string;
  color?: string;
}

interface PertNetworkChartProps {
  teams?: Team[];
  dependencies?: Array<{ from: string; to: string; planned_duration?: number }>;
}

export default function PertNetworkChart({ teams = [], dependencies = [] }: PertNetworkChartProps) {
  // 색상 팔레트 - 팀이 많아져도 대응 가능
  const colorPalette = [
    '#60a5fa', '#fbbf24', '#34d399', '#a78bfa', '#f87171', '#38bdf8',
    '#f472b6', '#a3e635', '#06b6d4', '#f59e42', '#8b5cf6', '#ec4899',
    '#10b981', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#ef4444'
  ];

  // 팀에 색상 할당 (기본값이 없으면 동적으로 할당)
  const departments = teams.length > 0 ? teams.map((team, index) => ({
    label: team.label,
    color: team.color || colorPalette[index % colorPalette.length]
  })) : [
    { label: '기획', color: '#60a5fa' },
    { label: '디자인', color: '#fbbf24' },
    { label: '개발', color: '#34d399' },
    { label: '배포', color: '#a78bfa' },
    { label: '테스트', color: '#f87171' },
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

  // 의존성 데이터가 있으면 사용, 없으면 기본값 사용
  const links = dependencies.length > 0 ? dependencies.map(dep => {
    const fromIndex = departments.findIndex(d => d.label === dep.from);
    const toIndex = departments.findIndex(d => d.label === dep.to);
    return { from: fromIndex, to: toIndex, duration: dep.planned_duration };
  }).filter(link => link.from !== -1 && link.to !== -1) : [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 2, to: 5 },
    { from: 5, to: 3 },
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
        
        // from 또는 to가 undefined인 경우 렌더링하지 않음
        if (!from || !to) return null;
        
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