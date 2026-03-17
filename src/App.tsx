import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import DashboardPage from './components/dashboard/DashboardPage';
import MindmapPage from './components/mindmap/MindmapPage';
import ProductBuilderPage from './components/products/ProductBuilderPage';
import FunnelDesignerPage from './components/funnel/FunnelDesignerPage';
import MetricsStrategyPage from './components/metrics/MetricsStrategyPage';
import DataSchemaPage from './components/schema/DataSchemaPage';
import KnowledgeBasePage from './components/knowledge/KnowledgeBasePage';

const GenreBlueprintPage = lazy(() => import('./components/blueprint/GenreBlueprintPage'));

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/blueprint"
            element={
              <Suspense fallback={<div className="p-8 text-center text-gray-400">로딩 중...</div>}>
                <GenreBlueprintPage />
              </Suspense>
            }
          />
          <Route path="/mindmap" element={<MindmapPage />} />
          <Route path="/products" element={<ProductBuilderPage />} />
          <Route path="/funnel" element={<FunnelDesignerPage />} />
          <Route path="/metrics" element={<MetricsStrategyPage />} />
          <Route path="/schema" element={<DataSchemaPage />} />
          <Route path="/knowledge" element={<KnowledgeBasePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
