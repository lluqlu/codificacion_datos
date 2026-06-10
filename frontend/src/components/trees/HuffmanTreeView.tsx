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

const R = 22;
const LEVEL_H = 84;
const MIN_LEAF_GAP = 56;

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
  const y = depth * LEVEL_H + R + 12;

  nodes.push({ node, x, y, id });

  if (parentId !== null) {
    const parent = nodes.find((n) => n.id === parentId)!;
    edges.push({ from: parentId, to: id, label: edgeLabel, x1: parent.x, y1: parent.y, x2: x, y2: y });
  }

  const mid = (left + right) / 2;
  buildLayout(node.left,  depth + 1, left, mid, id + "L", nodes, edges, id, "0");
  buildLayout(node.right, depth + 1, mid, right, id + "R", nodes, edges, id, "1");
}

function treeDepth(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(treeDepth(node.left), treeDepth(node.right));
}

function countLeaves(node: TreeNode | null): number {
  if (!node) return 0;
  if (!node.left && !node.right) return 1;
  return countLeaves(node.left) + countLeaves(node.right);
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
    const leaves = countLeaves(tree);
    const width = Math.max(leaves * MIN_LEAF_GAP, 380);
    const height = depth * LEVEL_H + R * 2 + 32;

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
    <div
      className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <svg
        ref={containerRef}
        width="100%"
        height="100%"
        viewBox={`${-pan.x} ${-pan.y} ${svgWidth} ${svgHeight}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <defs>
          <filter id="leaf-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.22" />
          </filter>
          <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.09" />
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((edge) => {
          const midY = (edge.y1 + edge.y2) / 2;
          const d = `M ${edge.x1} ${edge.y1} C ${edge.x1} ${midY}, ${edge.x2} ${midY}, ${edge.x2} ${edge.y2}`;
          const lx = (edge.x1 * 0.35 + edge.x2 * 0.65);
          const ly = (edge.y1 * 0.35 + edge.y2 * 0.65);
          const isZero = edge.label === "0";
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <path d={d} fill="none" stroke="#d1d5db" strokeWidth={1.5} />
              <rect
                x={lx - 8}
                y={ly - 8}
                width={16}
                height={14}
                rx={4}
                fill="#ffffff"
                stroke={isZero ? "#93c5fd" : "#c4b5fd"}
                strokeWidth={1}
              />
              <text
                x={lx}
                y={ly + 2.5}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill={isZero ? "#2563eb" : "#7c3aed"}
              >
                {edge.label}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(({ node, x, y, id }) => {
          const isLeaf = node.symbol !== null;
          return (
            <g key={id} filter={isLeaf ? "url(#leaf-glow)" : "url(#node-shadow)"}>
              <circle
                cx={x}
                cy={y}
                r={R}
                fill={isLeaf ? "#2563eb" : "#ffffff"}
                stroke={isLeaf ? "#1d4ed8" : "#e2e8f0"}
                strokeWidth={isLeaf ? 0 : 1.5}
              />
              {isLeaf ? (
                <>
                  <text x={x} y={y - 3.5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#ffffff">
                    {node.symbol === " " ? "·" : node.symbol}
                  </text>
                  <text x={x} y={y + 10} textAnchor="middle" fontSize={8.5} fill="rgba(255,255,255,0.65)">
                    {node.frequency}
                  </text>
                </>
              ) : (
                <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fill="#64748b" fontWeight={500}>
                  {node.frequency}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
