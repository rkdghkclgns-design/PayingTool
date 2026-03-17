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
          <td>${c.type === 'hard' ? '하드' : c.type === 'soft' ? '소프트' : c.type === 'premium' ? '프리미엄' : '이벤트'}</td>
          <td>${c.earnableFree ? 'O' : 'X'}</td>
          <td>${c.purchasable ? 'O' : 'X'}</td>
        </tr>`,
    )
    .join('');

  return `
    <section class="section">
      <h2>1. 게임 분석 결과</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">장르</span>
          <span class="value">${GAME_GENRE_LABELS.get(analysis.genre) ?? analysis.genre}</span>
        </div>
        <div class="info-item">
          <span class="label">코어 루프</span>
          <span class="value">${analysis.coreLoop}</span>
        </div>
      </div>

      <h3>성장 시스템</h3>
      <ul>${analysis.progressionSystems.map((s) => `<li>${s}</li>`).join('')}</ul>

      <h3>소셜 기능</h3>
      <ul>${analysis.socialFeatures.map((s) => `<li>${s}</li>`).join('')}</ul>

      <h3>콘텐츠 유형</h3>
      <ul>${analysis.contentTypes.map((s) => `<li>${s}</li>`).join('')}</ul>

      <h3>재화 구조</h3>
      <table>
        <thead>
          <tr><th>재화명</th><th>유형</th><th>무료 획득</th><th>구매 가능</th></tr>
        </thead>
        <tbody>${currencyRows}</tbody>
      </table>

      <h3>리텐션 훅</h3>
      <ul>${analysis.retentionHooks.map((s) => `<li>${s}</li>`).join('')}</ul>

      <h3>경쟁 요소</h3>
      <ul>${analysis.competitiveElements.map((s) => `<li>${s}</li>`).join('')}</ul>
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

  const stageRows = stages
    .map((stage) => {
      const assignedProducts = products.filter((p) =>
        stage.assignedProductIds.includes(p.id),
      );
      const productNames =
        assignedProducts.length > 0
          ? assignedProducts.map((p) => p.name).join(', ')
          : '-';

      return `
        <tr>
          <td>${stage.order + 1}</td>
          <td>${stage.label}</td>
          <td class="text-right">${formatPercent(stage.conversionRate)}</td>
          <td>${stage.description || '-'}</td>
          <td>${productNames}</td>
        </tr>`;
    })
    .join('');

  return `
    <section class="section">
      <h2>3. 퍼널 설계</h2>
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
