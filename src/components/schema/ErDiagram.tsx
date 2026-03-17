import { useMemo, useState, useCallback, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { DataSchema } from '../../models/schema';
import {
  buildErDiagram,
  getTableColor,
  HEADER_HEIGHT,
  FIELD_HEIGHT,
} from '../../utils/er-diagram-utils';
import type { ErNode, ErRelation } from '../../utils/er-diagram-utils';

// ─────────────────────────────────────────────
// Table Node Component
// ─────────────────────────────────────────────
interface TableNodeProps {
  readonly node: ErNode;
  readonly colorIndex: number;
}

function TableNode({ node, colorIndex }: TableNodeProps) {
  const color = getTableColor(colorIndex);

  return (
    <g transform={`translate(${node.x}, ${node.y})`}>
      {/* Shadow */}
      <rect
        x={2}
        y={2}
        width={node.width}
        height={node.height}
        rx={8}
        ry={8}
        fill="rgba(0,0,0,0.08)"
      />
      {/* Background */}
      <rect
        width={node.width}
        height={node.height}
        rx={8}
        ry={8}
        fill="#ffffff"
        stroke={color}
        strokeWidth={2}
      />
      {/* Header */}
      <rect
        width={node.width}
        height={HEADER_HEIGHT}
        rx={8}
        ry={8}
        fill={color}
      />
      {/* Header bottom corners fix */}
      <rect
        y={HEADER_HEIGHT - 8}
        width={node.width}
        height={8}
        fill={color}
      />
      {/* Table name */}
      <text
        x={node.width / 2}
        y={HEADER_HEIGHT / 2 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize={13}
        fontWeight={700}
        fontFamily="'SF Mono', 'Fira Code', monospace"
      >
        {node.name}
      </text>
      {/* Fields */}
      {node.fields.map((field, idx) => {
        const y = HEADER_HEIGHT + idx * FIELD_HEIGHT + FIELD_HEIGHT / 2;
        const icon = field.isPrimaryKey ? '\uD83D\uDD11' : field.isForeignKey ? '\uD83D\uDD17' : '';
        return (
          <g key={field.name}>
            {idx > 0 && (
              <line
                x1={8}
                y1={HEADER_HEIGHT + idx * FIELD_HEIGHT}
                x2={node.width - 8}
                y2={HEADER_HEIGHT + idx * FIELD_HEIGHT}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
            )}
            <text
              x={12}
              y={y}
              dominantBaseline="central"
              fill="#374151"
              fontSize={11}
              fontFamily="'SF Mono', 'Fira Code', monospace"
            >
              {icon ? `${icon} ` : ''}{field.name}
            </text>
            <text
              x={node.width - 12}
              y={y}
              textAnchor="end"
              dominantBaseline="central"
              fill="#9ca3af"
              fontSize={10}
              fontFamily="'SF Mono', 'Fira Code', monospace"
            >
              {field.type}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ─────────────────────────────────────────────
// Relation Line Component
// ─────────────────────────────────────────────
interface RelationLineProps {
  readonly relation: ErRelation;
  readonly nodes: readonly ErNode[];
}

function RelationLine({ relation, nodes }: RelationLineProps) {
  const fromNode = nodes.find((n) => n.name === relation.from);
  const toNode = nodes.find((n) => n.name === relation.to);

  if (!fromNode || !toNode) return null;

  const fromCenterX = fromNode.x + fromNode.width / 2;
  const fromCenterY = fromNode.y + fromNode.height / 2;
  const toCenterX = toNode.x + toNode.width / 2;
  const toCenterY = toNode.y + toNode.height / 2;

  let startX: number;
  let startY: number;
  let endX: number;
  let endY: number;

  if (fromCenterX < toCenterX) {
    startX = fromNode.x + fromNode.width;
    startY = fromCenterY;
    endX = toNode.x;
    endY = toCenterY;
  } else {
    startX = fromNode.x;
    startY = fromCenterY;
    endX = toNode.x + toNode.width;
    endY = toCenterY;
  }

  const midX = (startX + endX) / 2;
  const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

  const labelX = midX;
  const labelY = (startY + endY) / 2 - 8;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1.5}
        strokeDasharray={relation.type === 'N:M' ? '6 4' : 'none'}
        markerEnd="url(#arrowhead)"
      />
      <rect
        x={labelX - 16}
        y={labelY - 8}
        width={32}
        height={16}
        rx={4}
        fill="#f1f5f9"
        stroke="#cbd5e1"
        strokeWidth={0.5}
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#64748b"
        fontSize={9}
        fontWeight={600}
        fontFamily="'SF Mono', 'Fira Code', monospace"
      >
        {relation.type}
      </text>
    </g>
  );
}

// ─────────────────────────────────────────────
// Main ER Diagram Component with Pan & Zoom
// ─────────────────────────────────────────────
interface ErDiagramProps {
  readonly schemas: readonly DataSchema[];
}

const MIN_SCALE = 0.3;
const MAX_SCALE = 3.0;
const ZOOM_STEP = 0.15;

export default function ErDiagram({ schemas }: ErDiagramProps) {
  const { nodes, relations, totalWidth, totalHeight } = useMemo(
    () => buildErDiagram(schemas),
    [schemas],
  );

  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => {
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      return Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta));
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, panX, panY };
  }, [panX, panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanX(dragStartRef.current.panX + dx);
    setPanY(dragStartRef.current.panY + dy);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(MAX_SCALE, prev + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(MIN_SCALE, prev - ZOOM_STEP));
  }, []);

  if (schemas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
        <p className="text-sm">스키마를 먼저 생성하세요</p>
        <p className="text-xs mt-1">자동 생성 또는 템플릿 로드 버튼을 이용하세요</p>
      </div>
    );
  }

  const viewBoxWidth = Math.max(totalWidth, 600);
  const viewBoxHeight = Math.max(totalHeight, 400);

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      {/* Zoom controls */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title="축소"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title="확대"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title="리셋"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="ml-2 text-xs text-gray-400">마우스 드래그: 이동 / 휠: 확대·축소</span>
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="overflow-hidden p-4"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', minHeight: 400, maxHeight: 700 }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth={8}
              markerHeight={6}
              refX={8}
              refY={3}
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
            </marker>
          </defs>

          {relations.map((rel, idx) => (
            <RelationLine
              key={`rel-${idx}`}
              relation={rel}
              nodes={nodes}
            />
          ))}

          {nodes.map((node, idx) => (
            <TableNode
              key={node.id}
              node={node}
              colorIndex={idx}
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      {relations.length > 0 && (
        <div className="px-4 pb-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0 border-t-2 border-gray-400" />
            <span>1:1 / 1:N 관계</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0 border-t-2 border-dashed border-gray-400" />
            <span>N:M 관계</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🔑 기본키</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🔗 외래키</span>
          </div>
        </div>
      )}
    </div>
  );
}
