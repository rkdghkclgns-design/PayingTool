import { useProductStore } from '../stores/product-store';
import { useFunnelStore } from '../stores/funnel-store';
import { useMetricsStore } from '../stores/metrics-store';
import { useSchemaStore } from '../stores/schema-store';
import { useGenreStore } from '../stores/genre-store';
import { useMindmapStore } from '../stores/mindmap-store';

const SNAPSHOT_PREFIX = 'pt-snapshot-';

/**
 * Save the current state of all data stores as a project snapshot in localStorage.
 */
export function saveProjectSnapshot(projectId: string): void {
  const snapshot = {
    products: useProductStore.getState().products,
    selectedSegment: useProductStore.getState().selectedSegment,
    stages: useFunnelStore.getState().stages,
    metricsConfig: useMetricsStore.getState().config,
    schemas: useSchemaStore.getState().schemas,
    genre: {
      selectedGenre: useGenreStore.getState().selectedGenre,
      genreSource: useGenreStore.getState().genreSource,
    },
    mindmap: {
      uploadedImage: useMindmapStore.getState().uploadedImage,
      analysisResult: useMindmapStore.getState().analysisResult,
    },
  };

  try {
    localStorage.setItem(`${SNAPSHOT_PREFIX}${projectId}`, JSON.stringify(snapshot));
  } catch (e) {
    console.error('[project-snapshot] Failed to save:', e);
  }
}

/**
 * Load a project snapshot from localStorage and inject into all stores.
 */
export function loadProjectSnapshot(projectId: string): boolean {
  try {
    const raw = localStorage.getItem(`${SNAPSHOT_PREFIX}${projectId}`);
    if (!raw) {
      // No snapshot exists — reset all stores to defaults
      resetAllStores();
      return false;
    }

    const snapshot = JSON.parse(raw);

    // Product store
    if (snapshot.products) {
      useProductStore.getState().setProducts(snapshot.products);
    }
    if (snapshot.selectedSegment) {
      useProductStore.getState().setSelectedSegment(snapshot.selectedSegment);
    }

    // Funnel store — reset then load
    useFunnelStore.getState().resetStages();
    if (snapshot.stages && Array.isArray(snapshot.stages)) {
      useFunnelStore.getState().loadStages(snapshot.stages);
    }

    // Metrics store
    if (snapshot.metricsConfig) {
      useMetricsStore.getState().loadConfig(snapshot.metricsConfig);
    }

    // Schema store
    if (snapshot.schemas) {
      useSchemaStore.getState().setSchemas(snapshot.schemas);
    }

    // Genre store
    if (snapshot.genre?.selectedGenre) {
      useGenreStore.getState().setGenre(snapshot.genre.selectedGenre, snapshot.genre.genreSource ?? 'manual');
    } else {
      useGenreStore.getState().clearGenre();
    }

    // Mindmap store
    useMindmapStore.getState().clearAnalysis();
    if (snapshot.mindmap?.uploadedImage) {
      useMindmapStore.getState().setUploadedImage(snapshot.mindmap.uploadedImage);
    }
    if (snapshot.mindmap?.analysisResult) {
      useMindmapStore.getState().setAnalysisResult(snapshot.mindmap.analysisResult);
    }

    return true;
  } catch (e) {
    console.error('[project-snapshot] Failed to load:', e);
    resetAllStores();
    return false;
  }
}

/**
 * Delete a project snapshot from localStorage.
 */
export function deleteProjectSnapshot(projectId: string): void {
  localStorage.removeItem(`${SNAPSHOT_PREFIX}${projectId}`);
}

/**
 * Reset all data stores to their initial defaults.
 */
function resetAllStores(): void {
  useProductStore.getState().setProducts([]);
  useFunnelStore.getState().resetStages();
  useMetricsStore.getState().resetConfig();
  useSchemaStore.getState().setSchemas([]);
  useGenreStore.getState().clearGenre();
  useMindmapStore.getState().clearAnalysis();
}
