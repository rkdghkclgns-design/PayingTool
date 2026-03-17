import type { DataSchema, SchemaField, SchemaRelation } from '../models/schema';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface ErNode {
  readonly id: string;
  readonly name: string;
  readonly fields: readonly ErField[];
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ErField {
  readonly name: string;
  readonly type: string;
  readonly isPrimaryKey: boolean;
  readonly isForeignKey: boolean;
}

export interface ErRelation {
  readonly from: string;
  readonly fromField: string;
  readonly to: string;
  readonly toField: string;
  readonly type: '1:1' | '1:N' | 'N:M';
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const NODE_PADDING_X = 16;
const NODE_PADDING_Y = 12;
const HEADER_HEIGHT = 36;
const FIELD_HEIGHT = 24;
const NODE_MIN_WIDTH = 180;
const GRID_GAP_X = 80;
const GRID_GAP_Y = 60;

const TABLE_COLORS: readonly string[] = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#3b82f6', // blue
  '#84cc16', // lime
] as const;

// ─────────────────────────────────────────────
// Conversion logic
// ─────────────────────────────────────────────
function convertField(field: SchemaField): ErField {
  return {
    name: field.name,
    type: field.type,
    isPrimaryKey: field.isPrimaryKey,
    isForeignKey: field.isForeignKey,
  };
}

function calculateNodeSize(fields: readonly ErField[]): { width: number; height: number } {
  // Estimate width based on longest field name
  const maxFieldLen = Math.max(
    ...fields.map((f) => f.name.length + f.type.length + 6),
    12,
  );
  const width = Math.max(NODE_MIN_WIDTH, maxFieldLen * 8 + NODE_PADDING_X * 2);
  const height = HEADER_HEIGHT + fields.length * FIELD_HEIGHT + NODE_PADDING_Y;
  return { width, height };
}

function mapRelationType(type: SchemaRelation['type']): ErRelation['type'] {
  switch (type) {
    case 'one-to-one':
      return '1:1';
    case 'one-to-many':
      return '1:N';
    case 'many-to-many':
      return 'N:M';
    default:
      return '1:N';
  }
}

export function buildErDiagram(schemas: readonly DataSchema[]): {
  readonly nodes: readonly ErNode[];
  readonly relations: readonly ErRelation[];
  readonly totalWidth: number;
  readonly totalHeight: number;
} {
  if (schemas.length === 0) {
    return { nodes: [], relations: [], totalWidth: 0, totalHeight: 0 };
  }

  // Build nodes
  const columns = Math.max(1, Math.ceil(Math.sqrt(schemas.length)));
  const nodesWithSize = schemas.map((schema) => {
    const fields = schema.fields.map(convertField);
    const { width, height } = calculateNodeSize(fields);
    return { id: schema.tableName, name: schema.tableName, fields, width, height };
  });

  // Grid layout: arrange in rows/columns
  let maxRowHeight = 0;
  let currentX = GRID_GAP_X;
  let currentY = GRID_GAP_Y;
  let colIndex = 0;

  const nodes: ErNode[] = [];

  for (const nodeData of nodesWithSize) {
    if (colIndex >= columns) {
      currentX = GRID_GAP_X;
      currentY += maxRowHeight + GRID_GAP_Y;
      maxRowHeight = 0;
      colIndex = 0;
    }

    nodes.push({
      ...nodeData,
      x: currentX,
      y: currentY,
    });

    currentX += nodeData.width + GRID_GAP_X;
    maxRowHeight = Math.max(maxRowHeight, nodeData.height);
    colIndex++;
  }

  // Collect all relations from all schemas
  const relations: ErRelation[] = [];
  const tableNames = new Set(schemas.map((s) => s.tableName));

  for (const schema of schemas) {
    for (const rel of schema.relations) {
      // Only include relations where both tables exist
      if (tableNames.has(rel.fromTable) && tableNames.has(rel.toTable)) {
        // Avoid duplicates (A→B same as B→A for display)
        const exists = relations.some(
          (r) =>
            (r.from === rel.fromTable && r.to === rel.toTable) ||
            (r.from === rel.toTable && r.to === rel.fromTable),
        );
        if (!exists) {
          relations.push({
            from: rel.fromTable,
            fromField: rel.fromField,
            to: rel.toTable,
            toField: rel.toField,
            type: mapRelationType(rel.type),
          });
        }
      }
    }
  }

  // Calculate total dimensions
  const totalWidth = Math.max(
    ...nodes.map((n) => n.x + n.width),
    0,
  ) + GRID_GAP_X;

  const totalHeight = Math.max(
    ...nodes.map((n) => n.y + n.height),
    0,
  ) + GRID_GAP_Y;

  return { nodes, relations, totalWidth, totalHeight };
}

export function getTableColor(index: number): string {
  return TABLE_COLORS[index % TABLE_COLORS.length] ?? TABLE_COLORS[0];
}

export { HEADER_HEIGHT, FIELD_HEIGHT };
