// const sankeyNodes = [
//   { id: '영업', color: '#3b82f6' },
//   { id: '개발', color: '#10b981' },
//   { id: 'CS', color: '#f59e42' },
//   { id: '기획', color: '#6366f1' },
//   { id: '완료', color: '#a3e635' },
// ];
// const sankeyLinks = [
//   { source: '영업', target: '개발', value: 30 },
//   { source: '영업', target: '기획', value: 10 },
//   { source: '개발', target: 'CS', value: 20 },
//   { source: '개발', target: '완료', value: 15 },
//   { source: '기획', target: '개발', value: 8 },
//   { source: 'CS', target: '완료', value: 18 },
// ];

// interface SankeyNode {
//   id: string;terface SankeyLink {
//   source: string;
//   target: string;
//   value: number;
// }

// interface SankeyDiagramProps {
//   sankeyNodes: SankeyNode[];
//   sankeyLinks: SankeyLink[];
// }

// export default function SankeyDiagram({ sankeyNodes, sankeyLinks }: SankeyDiagramProps) {
//   // 노드 위치 수동 배치 (좌→우)
//   const nodePos: Record<string, { x: number; y: number }> = {
//     '영업': { x: 60, y: 100 },
//     '기획': { x: 60, y: 200 },
//     '개발': { x: 220, y: 120 },
//     'CS': { x: 380, y: 100 },
//     '완료': { x: 540, y: 120 },
//   };
//   // 링크의 굵기는 value에 비례
//   const maxVal = Math.max(...sankeyLinks.map(l => l.value));
//   return (
//     <svg width={600} height={260} style={{ background: '#f8fafc', borderRadius: 12 }}>
//       {/* Links */}
//       {sankeyLinks.map((l, i) => {
//         const from = nodePos[l.source];
//         const to = nodePos[l.target];
//         const thickness = 8 + 18 * (l.value / maxVal); // min 8, max 26
//         // 곡선(베지어)로 연결
//         const midX = (from.x + to.x) / 2;
//         return (
//           <path
//             key={i}
//             d={`M${from.x},${from.y} C${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}`}
//             stroke="#bbb"
//             strokeWidth={thickness}
//             fill="none"
//             opacity={0.5}
//           />
//         );
//       })}
//       {/* Nodes */}
//       {sankeyNodes.map((n, i) => (
//         <g key={n.id}>
//           <rect x={nodePos[n.id].x-30} y={nodePos[n.id].y-22} width={60} height={44} rx={12} fill={n.color+"33"} stroke={n.color} strokeWidth={2} />
//           <text x={nodePos[n.id].x} y={nodePos[n.id].y} textAnchor="middle" alignmentBaseline="middle" fontSize="16" fill={n.color} fontWeight="bold">{n.id}</text>
//         </g>
//       ))}
//       {/* 값 라벨 */}
//       {sankeyLinks.map((l, i) => {
//         const from = nodePos[l.source];
//         const to = nodePos[l.target];
//         const midX = (from.x + to.x) / 2;
//         const midY = (from.y + to.y) / 2;
//         return (
//           <text key={i+100} x={midX} y={midY-10} textAnchor="middle" fontSize="13" fill="#888">{l.value}</text>
//         );
//       })}
//     </svg>
//   );
// } 