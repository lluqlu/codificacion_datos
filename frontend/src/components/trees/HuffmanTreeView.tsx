import { useMemo, useRef, useState, useEffect } from "react";
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

interface TreeContentProps {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  withFilters?: boolean;
}

function TreeContent({ nodes, edges, withFilters = false }: TreeContentProps) {
  return (
    <>
      {edges.map((edge) => {
        const midY = (edge.y1 + edge.y2) / 2;
        const d = `M ${edge.x1} ${edge.y1} C ${edge.x1} ${midY}, ${edge.x2} ${midY}, ${edge.x2} ${edge.y2}`;
        const lx = edge.x1 * 0.35 + edge.x2 * 0.65;
        const ly = edge.y1 * 0.35 + edge.y2 * 0.65;
        const isZero = edge.label === "0";
        return (
          <g key={`${edge.from}-${edge.to}`}>
            <path d={d} fill="none" stroke="#d1d5db" strokeWidth={1.5} />
            <rect x={lx - 8} y={ly - 8} width={16} height={14} rx={4} fill="#ffffff" stroke={isZero ? "#93c5fd" : "#c4b5fd"} strokeWidth={1} />
            <text x={lx} y={ly + 2.5} textAnchor="middle" fontSize={9} fontWeight={600} fill={isZero ? "#2563eb" : "#7c3aed"}>
              {edge.label}
            </text>
          </g>
        );
      })}

      {nodes.map(({ node, x, y, id }) => {
        const isLeaf = node.symbol !== null;
        const filterId = withFilters ? `url(#${isLeaf ? "leaf-glow" : "node-shadow"})` : undefined;
        return (
          <g key={id} filter={filterId}>
            <circle cx={x} cy={y} r={R} fill={isLeaf ? "#2563eb" : "#ffffff"} stroke={isLeaf ? "#1d4ed8" : "#e2e8f0"} strokeWidth={isLeaf ? 0 : 1.5} />
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
    </>
  );
}

interface HuffmanTreeViewProps {
  tree: TreeNode;
}

const MIN_SCALE = 0.08;
const MAX_SCALE = 4;

export default function HuffmanTreeView({ tree }: HuffmanTreeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 20, scale: 1 });
  const [dragging, setDragging] = useState<{
    startX: number;
    startY: number;
    txStart: number;
    tyStart: number;
  } | null>(null);

  const { nodes, edges, treeW, treeH } = useMemo(() => {
    const depth = treeDepth(tree);
    const leaves = countLeaves(tree);
    const width = Math.max(leaves * MIN_LEAF_GAP, 380);
    const height = depth * LEVEL_H + R * 2 + 32;

    const layoutNodes: LayoutNode[] = [];
    const layoutEdges: LayoutEdge[] = [];
    buildLayout(tree, 0, 0, width, "root", layoutNodes, layoutEdges, null, "");

    return { nodes: layoutNodes, edges: layoutEdges, treeW: width, treeH: height };
  }, [tree]);

  function fitToContainer() {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    const scale = Math.min(width / treeW, height / treeH) * 0.88;
    setTransform({
      x: (width - treeW * scale) / 2,
      y: Math.max(12, (height - treeH * scale) / 2),
      scale,
    });
  }

  useEffect(() => {
    fitToContainer();
  }, [treeW, treeH]);

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.13 : 1 / 1.13;
    setTransform((prev) => {
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * factor));
      const ratio = newScale / prev.scale;
      return {
        scale: newScale,
        x: cx - ratio * (cx - prev.x),
        y: cy - ratio * (cy - prev.y),
      };
    });
  }

  function onMouseDown(e: React.MouseEvent) {
    setDragging({ startX: e.clientX, startY: e.clientY, txStart: transform.x, tyStart: transform.y });
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    setTransform((prev) => ({
      ...prev,
      x: dragging.txStart + (e.clientX - dragging.startX),
      y: dragging.tyStart + (e.clientY - dragging.startY),
    }));
  }

  function onMouseUp() {
    setDragging(null);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Hidden full-tree SVG used exclusively by PDF export */}
      <svg
        data-tree-export=""
        data-tree-width={treeW}
        data-tree-height={treeH}
        viewBox={`0 0 ${treeW} ${treeH}`}
        style={{ display: "none", position: "absolute" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <TreeContent nodes={nodes} edges={edges} />
      </svg>

      {/* Interactive SVG */}
      <svg
        width="100%"
        height="100%"
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

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          <TreeContent nodes={nodes} edges={edges} withFilters />
        </g>
      </svg>

      <button
        className="absolute bottom-3 right-3 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 transition-colors shadow-sm"
        onClick={fitToContainer}
      >
        Ajustar vista
      </button>

      <span className="absolute bottom-3 left-3 text-xs text-slate-400 pointer-events-none">
        Rueda para zoom · Arrastrar para mover
      </span>
    </div>
  );
}
