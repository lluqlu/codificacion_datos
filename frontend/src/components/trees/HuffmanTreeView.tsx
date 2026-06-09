import { useMemo, useRef, useState } from "react";
import type { TreeNode } from "../../types/compression";

interface LayoutNode {
  node: TreeNode;
  x: number;
  y: number;
  id: string;
}

interface LayoutEdge {
  from: string;
  to: string;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const NODE_RADIUS = 20;
const LEVEL_HEIGHT = 60;

function buildLayout(
  node: TreeNode | null,
  depth: number,
  left: number,
  right: number,
  id: string,
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  parentId: string | null,
  edgeLabel: string
) {
  if (!node) return;

  const x = (left + right) / 2;
  const y = depth * LEVEL_HEIGHT + NODE_RADIUS + 8;

  nodes.push({ node, x, y, id });

  if (parentId !== null) {
    const parent = nodes.find((n) => n.id === parentId)!;
    edges.push({ from: parentId, to: id, label: edgeLabel, x1: parent.x, y1: parent.y, x2: x, y2: y });
  }

  const mid = (left + right) / 2;
  buildLayout(node.left, depth + 1, left, mid, id + "L", nodes, edges, id, "0");
  buildLayout(node.right, depth + 1, mid, right, id + "R", nodes, edges, id, "1");
}

function treeDepth(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(treeDepth(node.left), treeDepth(node.right));
}

interface HuffmanTreeViewProps {
  tree: TreeNode;
}

export default function HuffmanTreeView({ tree }: HuffmanTreeViewProps) {
  const containerRef = useRef<SVGSVGElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{ startX: number; startY: number; panStart: { x: number; y: number } } | null>(null);

  const { nodes, edges, svgWidth, svgHeight } = useMemo(() => {
    const depth = treeDepth(tree);
    const leafCount = Math.pow(2, depth - 1);
    const width = Math.max(leafCount * 50, 400);
    const height = depth * LEVEL_HEIGHT + NODE_RADIUS * 2 + 24;

    const layoutNodes: LayoutNode[] = [];
    const layoutEdges: LayoutEdge[] = [];
    buildLayout(tree, 0, 0, width, "root", layoutNodes, layoutEdges, null, "");

    return { nodes: layoutNodes, edges: layoutEdges, svgWidth: width, svgHeight: height };
  }, [tree]);

  function onMouseDown(e: React.MouseEvent) {
    setDragging({ startX: e.clientX, startY: e.clientY, panStart: { ...pan } });
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    setPan({
      x: dragging.panStart.x + (e.clientX - dragging.startX),
      y: dragging.panStart.y + (e.clientY - dragging.startY),
    });
  }

  function onMouseUp() {
    setDragging(null);
  }

  return (
    <div className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing" onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <svg
        ref={containerRef}
        width="100%"
        height="100%"
        viewBox={`${-pan.x} ${-pan.y} ${svgWidth} ${svgHeight}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
      >
        {edges.map((edge) => {
          const midX = (edge.x1 + edge.x2) / 2;
          const midY = (edge.y1 + edge.y2) / 2;
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke="#cbd5e1"
                strokeWidth={1.5}
              />
              <text
                x={midX}
                y={midY - 4}
                textAnchor="middle"
                fontSize={10}
                fill="#64748b"
                fontFamily="monospace"
              >
                {edge.label}
              </text>
            </g>
          );
        })}
        {nodes.map(({ node, x, y, id }) => (
          <g key={id}>
            <circle
              cx={x}
              cy={y}
              r={NODE_RADIUS}
              fill={node.symbol !== null ? "#dbeafe" : "#f1f5f9"}
              stroke={node.symbol !== null ? "#3b82f6" : "#94a3b8"}
              strokeWidth={1.5}
            />
            <text x={x} y={y - 4} textAnchor="middle" fontSize={9} fill="#475569" fontFamily="monospace">
              {node.frequency}
            </text>
            {node.symbol !== null && (
              <text x={x} y={y + 8} textAnchor="middle" fontSize={11} fill="#1d4ed8" fontWeight={600} fontFamily="monospace">
                {node.symbol === " " ? "·" : node.symbol}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
