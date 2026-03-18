import html2canvas from 'html2canvas';
import { useMindmapStore } from '../stores/mindmap-store';
import { useProductStore } from '../stores/product-store';
import { useFunnelStore } from '../stores/funnel-store';
import { useMetricsStore } from '../stores/metrics-store';
import { useSchemaStore } from '../stores/schema-store';
import { useProjectStore } from '../stores/project-store';
import type { Product, FunnelStage, MetricsConfig, DataSchema, GameStructure } from '../models';
import {
  PRODUCT_CATEGORY_LABELS,
  USER_SEGMENT_LABELS,
  RETENTION_STAGE_LABELS,
  GAME_GENRE_LABELS,
} from './constants';
import { formatKRW, formatUSD, formatPercent, formatNumber } from './formatters';
import { buildErDiagram, getTableColor, HEADER_HEIGHT, FIELD_HEIGHT } from './er-diagram-utils';

/**
 * Capture a DOM element by ID and download it as a PNG image.
 */
export async function downloadPageAsPng(
  elementId: string,
  filename: string,
): Promise<void> {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`요소를 찾을 수 없습니다: #${elementId}`);
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format a date string for filenames (YYYY-MM-DD).
 */
function formatDateForFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string for display in the report.
 */
function formatDateForDisplay(): string {
  const now = new Date();
  return now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Build the HTML section for game analysis results.
 */
function buildAnalysisSection(analysis: GameStructure): string {
  const currencyRows = analysis.currencies
    .map(
      (c) => `
        <tr>
          <td>${c.name}</td>
          <td><span class="badge ${c.type === 'hard' ? 'badge-hard' : c.type === 'soft' ? 'badge-soft' : c.type === 'premium' ? 'badge-premium' : 'badge-event'}">${c.type === 'hard' ? '유료 재화' : c.type === 'soft' ? '무료 재화' : c.type === 'premium' ? '프리미엄' : '이벤트'}</span></td>
          <td>${c.earnableFree ? 'O' : 'X'}</td>
          <td>${c.purchasable ? 'O' : 'X'}</td>
        </tr>`,
    )
    .join('');

  const progressionTags = analysis.progressionSystems
    .map((s) => `<span class="tag">${s}</span>`)
    .join(' ');

  const socialList = analysis.socialFeatures
    .map((s) => `<li>${s}</li>`)
    .join('');

  const retentionList = analysis.retentionHooks
    .map((s) => `<li class="retention-item">${s}</li>`)
    .join('');

  const competitiveList = analysis.competitiveElements
    .map((s) => `<li class="competitive-item">${s}</li>`)
    .join('');

  return `
    <section class="section">
      <h2>게임 구조 분석 결과</h2>
      <p class="section-subtitle">AI가 마인드맵에서 추출한 게임 유료화 구조</p>

      <h3>장르</h3>
      <div class="genre-badge">${GAME_GENRE_LABELS.get(analysis.genre) ?? analysis.genre}</div>

      <h3>코어 루프</h3>
      <div class="core-loop-box">${analysis.coreLoop}</div>

      ${analysis.progressionSystems.length > 0 ? `
      <h3>성장 시스템</h3>
      <div class="tag-list">${progressionTags}</div>
      ` : ''}

      ${analysis.socialFeatures.length > 0 ? `
      <h3>소셜 기능</h3>
      <ul class="feature-list">${socialList}</ul>
      ` : ''}

      ${analysis.currencies.length > 0 ? `
      <h3>재화 시스템</h3>
      <table>
        <thead>
          <tr><th>이름</th><th>유형</th><th>무료 획득</th><th>구매 가능</th></tr>
        </thead>
        <tbody>${currencyRows}</tbody>
      </table>
      ` : ''}

      ${analysis.retentionHooks.length > 0 ? `
      <h3>리텐션 장치</h3>
      <ul class="feature-list retention-list">${retentionList}</ul>
      ` : ''}

      ${analysis.competitiveElements.length > 0 ? `
      <h3>경쟁 요소</h3>
      <ul class="feature-list competitive-list">${competitiveList}</ul>
      ` : ''}

      ${analysis.adPlacements && analysis.adPlacements.length > 0 ? `
      <h3>보상형 광고 배치 추천</h3>
      <div class="ad-placements">
        ${analysis.adPlacements.map((ad) => `
          <div class="ad-card">
            <div class="ad-header">
              <span class="ad-location">${ad.location}</span>
              <span class="ad-type-badge">${ad.adType}</span>
            </div>
            <p class="ad-reward">보상: ${ad.reward}</p>
            <p class="ad-desc">${ad.description}</p>
          </div>
        `).join('')}
      </div>
      ` : ''}
    </section>`;
}

/**
 * Build the HTML section for products list.
 */
function buildProductsSection(products: readonly Product[]): string {
  if (products.length === 0) {
    return `
      <section class="section">
        <h2>2. 상품 목록</h2>
        <p class="empty-state">등록된 상품이 없습니다.</p>
      </section>`;
  }

  const productRows = products
    .map(
      (p) => `
        <tr>
          <td>${p.name}</td>
          <td>${PRODUCT_CATEGORY_LABELS.get(p.category) ?? p.category}</td>
          <td>${p.targetSegments.map((s) => USER_SEGMENT_LABELS.get(s) ?? s).join(', ')}</td>
          <td>${RETENTION_STAGE_LABELS.get(p.targetRetentionStage) ?? p.targetRetentionStage}</td>
          <td class="text-right">${formatUSD(p.priceUSD)}</td>
          <td class="text-right">${formatKRW(p.priceKRW)}</td>
          <td>${p.purchaseLimit.type === 'unlimited' ? '무제한' : `${p.purchaseLimit.type}(${p.purchaseLimit.maxCount}회)`}</td>
          <td>${p.isActive ? '활성' : '비활성'}</td>
        </tr>`,
    )
    .join('');

  return `
    <section class="section">
      <h2>2. 상품 목록</h2>
      <p class="summary">총 ${products.length}개 상품</p>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>상품명</th><th>카테고리</th><th>타겟 세그먼트</th>
              <th>리텐션 단계</th><th>USD</th><th>KRW</th>
              <th>구매 제한</th><th>상태</th>
            </tr>
          </thead>
          <tbody>${productRows}</tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Build the HTML section for funnel stages.
 */
function buildFunnelSection(
  stages: readonly FunnelStage[],
  products: readonly Product[],
): string {
  if (stages.length === 0) {
    return `
      <section class="section">
        <h2>3. 퍼널 설계</h2>
        <p class="empty-state">퍼널 단계가 설정되지 않았습니다.</p>
      </section>`;
  }

  const FUNNEL_COLORS = ['#6366f1', '#818cf8', '#a78bfa', '#c4b5fd', '#ddd6fe', '#e0e7ff', '#eef2ff', '#f5f3ff'];
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);
  const maxRate = Math.max(...sortedStages.map((s) => s.conversionRate), 1);

  const funnelCards = sortedStages
    .map((stage, idx) => {
      const assignedProducts = products.filter((p) =>
        stage.assignedProductIds.includes(p.id),
      );
      const productTags = assignedProducts.length > 0
        ? assignedProducts.map((p) => `<span class="funnel-product-tag">${p.name}</span>`).join(' ')
        : '<span class="funnel-no-product">배치 상품 없음</span>';

      const widthPct = Math.max(30, Math.round((stage.conversionRate / maxRate) * 100));
      const color = FUNNEL_COLORS[idx % FUNNEL_COLORS.length];
      const rateDisplay = stage.conversionRate < 1
        ? `${(stage.conversionRate * 100).toFixed(1)}%`
        : `${stage.conversionRate.toFixed(1)}%`;

      return `
        <div class="funnel-stage">
          <div class="funnel-bar-container">
            <div class="funnel-bar" style="width: ${widthPct}%; background: ${color};">
              <span class="funnel-label">${stage.label}</span>
              <span class="funnel-rate">${rateDisplay}</span>
            </div>
          </div>
          <div class="funnel-details">
            ${stage.description ? `<p class="funnel-desc">${stage.description}</p>` : ''}
            <div class="funnel-products">${productTags}</div>
          </div>
        </div>`;
    })
    .join('');

  // 테이블도 함께 제공
  const stageRows = sortedStages
    .map((stage) => {
      const assignedProducts = products.filter((p) =>
        stage.assignedProductIds.includes(p.id),
      );
      const productNames =
        assignedProducts.length > 0
          ? assignedProducts.map((p) => p.name).join(', ')
          : '-';
      const rateDisplay = stage.conversionRate < 1
        ? `${(stage.conversionRate * 100).toFixed(1)}%`
        : `${stage.conversionRate.toFixed(1)}%`;

      return `
        <tr>
          <td>${stage.order + 1}</td>
          <td>${stage.label}</td>
          <td class="text-right">${rateDisplay}</td>
          <td>${stage.description || '-'}</td>
          <td>${productNames}</td>
        </tr>`;
    })
    .join('');

  return `
    <section class="section">
      <h2>3. 퍼널 설계</h2>
      <div class="funnel-visual">
        ${funnelCards}
      </div>
      <h3 style="margin-top: 24px;">퍼널 상세 데이터</h3>
      <table>
        <thead>
          <tr><th>#</th><th>단계</th><th>전환율</th><th>설명</th><th>배치 상품</th></tr>
        </thead>
        <tbody>${stageRows}</tbody>
      </table>
    </section>`;
}

/**
 * Build the HTML section for metrics / KPI.
 */
function buildMetricsSection(config: MetricsConfig): string {
  return `
    <section class="section">
      <h2>4. 지표 & KPI 전략</h2>
      <div class="metrics-grid">
        <div class="metric-group">
          <h3>현재 지표</h3>
          <div class="info-grid">
            <div class="info-item"><span class="label">DAU</span><span class="value">${formatNumber(config.dau)}</span></div>
            <div class="info-item"><span class="label">MAU</span><span class="value">${formatNumber(config.mau)}</span></div>
            <div class="info-item"><span class="label">ARPDAU</span><span class="value">${formatUSD(config.arpdau)}</span></div>
            <div class="info-item"><span class="label">ARPPU</span><span class="value">${formatUSD(config.arppu)}</span></div>
            <div class="info-item"><span class="label">과금 전환율</span><span class="value">${formatPercent(config.conversionRate)}</span></div>
            <div class="info-item"><span class="label">CPI</span><span class="value">${formatUSD(config.cpi)}</span></div>
          </div>
        </div>
        <div class="metric-group">
          <h3>리텐션</h3>
          <div class="info-grid">
            <div class="info-item"><span class="label">D1</span><span class="value">${formatPercent(config.d1Retention)}</span></div>
            <div class="info-item"><span class="label">D7</span><span class="value">${formatPercent(config.d7Retention)}</span></div>
            <div class="info-item"><span class="label">D30</span><span class="value">${formatPercent(config.d30Retention)}</span></div>
          </div>
        </div>
        <div class="metric-group">
          <h3>목표 지표</h3>
          <div class="info-grid">
            <div class="info-item"><span class="label">목표 LTV</span><span class="value">${formatUSD(config.targetLtv)}</span></div>
            <div class="info-item"><span class="label">목표 ARPU</span><span class="value">${formatUSD(config.targetArpu)}</span></div>
            <div class="info-item"><span class="label">목표 전환율</span><span class="value">${formatPercent(config.targetConversion)}</span></div>
            <div class="info-item"><span class="label">목표 D1</span><span class="value">${formatPercent(config.targetD1Retention)}</span></div>
            <div class="info-item"><span class="label">목표 D7</span><span class="value">${formatPercent(config.targetD7Retention)}</span></div>
            <div class="info-item"><span class="label">목표 D30</span><span class="value">${formatPercent(config.targetD30Retention)}</span></div>
          </div>
        </div>
      </div>
    </section>`;
}

/**
 * Build the HTML section for data schemas.
 */
function buildSchemaSection(schemas: readonly DataSchema[]): string {
  if (schemas.length === 0) {
    return `
      <section class="section">
        <h2>5. 데이터 스키마</h2>
        <p class="empty-state">설계된 스키마가 없습니다.</p>
      </section>`;
  }

  const schemaTables = schemas
    .map((schema) => {
      const fieldRows = schema.fields
        .map(
          (f) => `
            <tr>
              <td>${f.isPrimaryKey ? '🔑 ' : ''}${f.name}</td>
              <td>${f.type}${f.enumValues ? ` (${f.enumValues.join(', ')})` : ''}</td>
              <td>${f.nullable ? 'YES' : 'NO'}</td>
              <td>${f.description}</td>
            </tr>`,
        )
        .join('');

      return `
        <div class="schema-table">
          <h3>${schema.tableName}</h3>
          <p class="description">${schema.description}</p>
          <table>
            <thead>
              <tr><th>필드명</th><th>타입</th><th>Nullable</th><th>설명</th></tr>
            </thead>
            <tbody>${fieldRows}</tbody>
          </table>
        </div>`;
    })
    .join('');

  return `
    <section class="section">
      <h2>5. 데이터 스키마</h2>
      <p class="summary">총 ${schemas.length}개 테이블</p>
      ${schemaTables}
    </section>`;
}

/**
 * Build ER Diagram as static SVG for report.
 */
function buildErDiagramSection(schemas: readonly DataSchema[]): string {
  if (schemas.length === 0) return '';

  const { nodes, relations, totalWidth, totalHeight } = buildErDiagram(schemas);
  const viewBoxWidth = Math.max(totalWidth, 600);
  const viewBoxHeight = Math.max(totalHeight, 400);

  const nodesSvg = nodes.map((node, idx) => {
    const color = getTableColor(idx);
    const fieldsSvg = node.fields.map((field, fIdx) => {
      const y = HEADER_HEIGHT + fIdx * FIELD_HEIGHT + FIELD_HEIGHT / 2;
      const icon = field.isPrimaryKey ? '🔑 ' : field.isForeignKey ? '🔗 ' : '';
      const divider = fIdx > 0 ? `<line x1="8" y1="${HEADER_HEIGHT + fIdx * FIELD_HEIGHT}" x2="${node.width - 8}" y2="${HEADER_HEIGHT + fIdx * FIELD_HEIGHT}" stroke="#e5e7eb" stroke-width="0.5"/>` : '';
      return `${divider}<text x="12" y="${y}" dominant-baseline="central" fill="#374151" font-size="11" font-family="monospace">${icon}${field.name}</text><text x="${node.width - 12}" y="${y}" text-anchor="end" dominant-baseline="central" fill="#9ca3af" font-size="10" font-family="monospace">${field.type}</text>`;
    }).join('');

    return `<g transform="translate(${node.x}, ${node.y})"><rect x="2" y="2" width="${node.width}" height="${node.height}" rx="8" fill="rgba(0,0,0,0.08)"/><rect width="${node.width}" height="${node.height}" rx="8" fill="#fff" stroke="${color}" stroke-width="2"/><rect width="${node.width}" height="${HEADER_HEIGHT}" rx="8" fill="${color}"/><rect y="${HEADER_HEIGHT - 8}" width="${node.width}" height="8" fill="${color}"/><text x="${node.width / 2}" y="${HEADER_HEIGHT / 2 + 1}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="13" font-weight="700" font-family="monospace">${node.name}</text>${fieldsSvg}</g>`;
  }).join('');

  const relationsSvg = relations.map((rel) => {
    const fromNode = nodes.find((n) => n.name === rel.from);
    const toNode = nodes.find((n) => n.name === rel.to);
    if (!fromNode || !toNode) return '';
    const fCx = fromNode.x + fromNode.width / 2;
    const fCy = fromNode.y + fromNode.height / 2;
    const tCx = toNode.x + toNode.width / 2;
    const tCy = toNode.y + toNode.height / 2;
    const [sx, sy, ex, ey] = fCx < tCx
      ? [fromNode.x + fromNode.width, fCy, toNode.x, tCy]
      : [fromNode.x, fCy, toNode.x + toNode.width, tCy];
    const mx = (sx + ex) / 2;
    const ly = (sy + ey) / 2 - 8;
    const dash = rel.type === 'N:M' ? ' stroke-dasharray="6 4"' : '';
    return `<path d="M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}" fill="none" stroke="#94a3b8" stroke-width="1.5"${dash} marker-end="url(#ah)"/><rect x="${mx - 16}" y="${ly - 8}" width="32" height="16" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.5"/><text x="${mx}" y="${ly}" text-anchor="middle" dominant-baseline="central" fill="#64748b" font-size="9" font-weight="600" font-family="monospace">${rel.type}</text>`;
  }).join('');

  return `
    <section class="section">
      <h2>6. 데이터 구조도 (ER Diagram)</h2>
      <p class="summary">테이블 ${nodes.length}개, 관계 ${relations.length}개</p>
      <div style="overflow-x: auto;">
        <svg viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" style="width: 100%; min-height: 300px; max-height: 600px;">
          <defs><marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/></marker></defs>
          ${relationsSvg}
          ${nodesSvg}
        </svg>
      </div>
    </section>`;
}

/**
 * Build the complete inline CSS for the report.
 */
function buildReportStyles(): string {
  return `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
        color: #1a1a2e;
        background: #f8f9fa;
        line-height: 1.6;
        padding: 0;
        word-break: keep-all;
        overflow-wrap: break-word;
      }
      .report-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 40px 32px;
        background: #ffffff;
      }
      .report-header {
        text-align: center;
        padding: 32px 0;
        border-bottom: 3px solid #4f46e5;
        margin-bottom: 32px;
      }
      .report-header h1 {
        font-size: 28px;
        color: #4f46e5;
        margin-bottom: 8px;
      }
      .report-header .subtitle {
        font-size: 14px;
        color: #6b7280;
      }
      .report-header .project-name {
        font-size: 20px;
        color: #1f2937;
        margin-top: 12px;
        font-weight: 600;
      }
      .section {
        margin-bottom: 36px;
        padding: 24px;
        background: #fafbfc;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        overflow: hidden;
      }
      .section h2 {
        font-size: 20px;
        color: #4f46e5;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 8px;
        margin-bottom: 16px;
      }
      .section h3 {
        font-size: 16px;
        color: #374151;
        margin-top: 16px;
        margin-bottom: 8px;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
        margin-bottom: 12px;
      }
      .info-item {
        display: flex;
        flex-direction: column;
        padding: 8px 12px;
        background: #ffffff;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
      }
      .info-item .label {
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .info-item .value {
        font-size: 15px;
        font-weight: 600;
        color: #1f2937;
        margin-top: 2px;
        word-break: break-all;
        overflow-wrap: break-word;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
        font-size: 13px;
        table-layout: fixed;
      }
      thead th {
        background: #4f46e5;
        color: #ffffff;
        padding: 10px 12px;
        text-align: left;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      tbody td {
        padding: 8px 12px;
        border-bottom: 1px solid #e5e7eb;
        word-break: keep-all;
        overflow-wrap: break-word;
        white-space: pre-wrap;
      }
      tbody tr:nth-child(even) {
        background: #f9fafb;
      }
      tbody tr:hover {
        background: #eef2ff;
      }
      .text-right { text-align: right; }
      .table-wrapper { overflow-x: auto; }
      .summary {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 12px;
      }
      .empty-state {
        text-align: center;
        padding: 24px;
        color: #9ca3af;
        font-style: italic;
      }
      .description {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 8px;
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .metric-group {
        padding: 16px;
        background: #ffffff;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
      }
      .metric-group h3 {
        margin-top: 0;
        margin-bottom: 12px;
        color: #4f46e5;
      }
      .schema-table {
        margin-bottom: 20px;
        padding: 16px;
        background: #ffffff;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
      }
      .schema-table h3 {
        margin-top: 0;
        color: #1f2937;
        font-family: 'SF Mono', 'Fira Code', monospace;
      }
      .section-subtitle {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 16px;
      }
      .genre-badge {
        display: inline-block;
        padding: 4px 12px;
        background: #eef2ff;
        color: #4f46e5;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .core-loop-box {
        padding: 12px 16px;
        background: #f3f4f6;
        border-radius: 6px;
        font-size: 13px;
        line-height: 1.7;
        color: #374151;
        word-break: keep-all;
        overflow-wrap: break-word;
      }
      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 8px;
      }
      .tag {
        display: inline-block;
        padding: 3px 10px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        font-size: 12px;
        color: #374151;
      }
      .feature-list {
        list-style: none;
        padding-left: 0;
      }
      .feature-list li {
        padding: 3px 0 3px 18px;
        position: relative;
        font-size: 13px;
        color: #374151;
      }
      .feature-list li::before {
        content: '\\2022';
        position: absolute;
        left: 4px;
        font-weight: bold;
      }
      .retention-list li::before {
        color: #10b981;
      }
      .competitive-list li::before {
        color: #ef4444;
      }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
      .badge-hard { background: #fef3c7; color: #92400e; }
      .badge-soft { background: #d1fae5; color: #065f46; }
      .badge-premium { background: #ede9fe; color: #5b21b6; }
      .badge-event { background: #fce7f3; color: #9d174d; }
      .ad-placements { display: grid; gap: 8px; }
      .ad-card {
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #fbbf24;
        background: #fffbeb;
      }
      .ad-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
      .ad-location { font-size: 13px; font-weight: 600; color: #92400e; }
      .ad-type-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        background: #fef3c7;
        color: #92400e;
      }
      .ad-reward { font-size: 12px; color: #b45309; margin-bottom: 4px; }
      .ad-desc { font-size: 12px; color: #6b7280; line-height: 1.6; }
      .funnel-visual { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
      .funnel-stage { display: flex; flex-direction: column; gap: 4px; }
      .funnel-bar-container { width: 100%; display: flex; justify-content: center; }
      .funnel-bar {
        display: flex; justify-content: space-between; align-items: center;
        padding: 10px 16px; border-radius: 6px; color: #fff; font-size: 13px;
        min-height: 40px; transition: width 0.3s;
      }
      .funnel-label { font-weight: 600; }
      .funnel-rate { font-weight: 700; font-size: 14px; }
      .funnel-details { padding: 0 16px 8px; }
      .funnel-desc { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
      .funnel-products { display: flex; flex-wrap: wrap; gap: 4px; }
      .funnel-product-tag {
        display: inline-block; padding: 2px 8px; border-radius: 4px;
        font-size: 11px; background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe;
      }
      .funnel-no-product { font-size: 11px; color: #9ca3af; font-style: italic; }
      ul {
        list-style: none;
        padding-left: 0;
      }
      ul li {
        padding: 4px 0 4px 20px;
        position: relative;
        font-size: 14px;
      }
      ul li::before {
        content: '\\2022';
        color: #4f46e5;
        font-weight: bold;
        position: absolute;
        left: 4px;
      }
      .report-footer {
        text-align: center;
        padding: 24px 0;
        margin-top: 32px;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
        color: #9ca3af;
      }
      @media print {
        body { background: #ffffff; }
        .report-container { padding: 20px; }
        .section { break-inside: avoid; }
      }
    </style>`;
}

/**
 * Generate a comprehensive HTML report from all Zustand store data
 * and download it as a self-contained .html file.
 */
export function downloadReport(): void {
  const analysisResult = useMindmapStore.getState().analysisResult;
  const products = useProductStore.getState().products;
  const stages = useFunnelStore.getState().stages;
  const metricsConfig = useMetricsStore.getState().config;
  const schemas = useSchemaStore.getState().schemas;
  const projectState = useProjectStore.getState();
  const activeProject = projectState.projects.find(
    (p) => p.id === projectState.activeProjectId,
  );

  const projectNameDisplay = activeProject
    ? `${activeProject.name} (${GAME_GENRE_LABELS.get(activeProject.gameGenre) ?? activeProject.gameGenre})`
    : 'PayingTool';

  const analysisSection = analysisResult
    ? buildAnalysisSection(analysisResult)
    : `<section class="section">
        <h2>1. 게임 분석 결과</h2>
        <p class="empty-state">분석 결과가 없습니다. 마인드맵 분석을 먼저 실행해 주세요.</p>
      </section>`;

  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PayingTool 리포트 - ${projectNameDisplay}</title>
  ${buildReportStyles()}
</head>
<body>
  <div class="report-container">
    <header class="report-header">
      <h1>PayingTool 리포트</h1>
      <div class="project-name">${projectNameDisplay}</div>
      <div class="subtitle">생성일: ${formatDateForDisplay()}</div>
    </header>

    ${analysisSection}
    ${buildProductsSection(products)}
    ${buildFunnelSection(stages, products)}
    ${buildMetricsSection(metricsConfig)}
    ${buildSchemaSection(schemas)}
    ${buildErDiagramSection(schemas)}

    <footer class="report-footer">
      <p>PayingTool &mdash; 게임 과금 설계 도구</p>
      <p>이 리포트는 자동으로 생성되었습니다.</p>
    </footer>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `PayingTool_Report_${formatDateForFilename()}.html`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
