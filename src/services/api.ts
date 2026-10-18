import type {
  Resource,
  HistoryRecord,
  ChromeSyncSummary,
  HistoryBatchImportItem,
  HistoryBatchImportResponse,
} from '../types';

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const API_BASE_URL = rawBase.endsWith('/api')
  ? rawBase
  : `${rawBase.replace(/\/+$/, '')}/api`;

const ROOT_URL = rawBase.endsWith('/api')
  ? rawBase.substring(0, rawBase.length - 4)
  : rawBase.replace(/\/+$/, '');

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.message) errorDetail = errJson.message;
      else if (errJson.error) errorDetail = errJson.error;
    } catch {
      // ignored
    }
    throw new Error(errorDetail);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export interface NavigationState {
  current: HistoryRecord | null;
  canGoBack: boolean;
  canGoForward: boolean;
  backStackSize: number;
  forwardStackSize: number;
}

export interface SearchResultResponse {
  query: string;
  matchCount: number;
  comparisonCount: number;
  durationNano: number;
  timeComplexity: string;
  matches: HistoryRecord[];
}

export interface HistoryNodeNavigation {
  currentRecord: HistoryRecord | null;
  previousRecord: HistoryRecord | null;
  nextRecord: HistoryRecord | null;
  hasPrevious: boolean;
  hasNext: boolean;
  totalRecords: number;
  explanation: string;
}

export interface ExactLookupResponse {
  url: string;
  found: boolean;
  visitCount: number;
  firstVisitedAt?: string;
  lastVisitedAt?: string;
  comparisons: number;
  durationNano: number;
  timeComplexity: string;
  linkedResource?: Resource;
}

export interface AnalyticsSummary {
  totalResources: number;
  totalHistoryRecords: number;
  totalUniqueUrls: number;
  totalVisits: number;
  backStackSize: number;
  forwardStackSize: number;
  categoryDistribution: Record<string, number>;
}

export interface PerformanceComparison {
  targetUrl: string;
  datasetSize: number;
  sequentialComparisons: number;
  sequentialDurationNano: number;
  sequentialComplexity: string;
  hashComparisons: number;
  hashDurationNano: number;
  hashComplexity: string;
  speedupFactor: number;
  exactMatchFound: boolean;
  unsuccessfulTargetUrl?: string;
  unsuccessfulSequentialComparisons?: number;
  unsuccessfulSequentialDurationNano?: number;
  unsuccessfulHashComparisons?: number;
  unsuccessfulHashDurationNano?: number;
  repeatedIterations?: number;
  measurementMethod?: string;
  notes?: string;
}

export const browseBackApi = {
  // Health
  checkHealth: async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal })
        .catch(() => fetch(`${ROOT_URL}/health`, { signal: controller.signal }))
        .catch(() => null);
      clearTimeout(timeoutId);
      return !!res && res.ok;
    } catch {
      return false;
    }
  },

  // Resources
  getResources: (): Promise<Resource[]> => {
    return fetchJson<Resource[]>(`${API_BASE_URL}/resources`);
  },

  createResource: (data: Partial<Resource>): Promise<Resource> => {
    return fetchJson<Resource>(`${API_BASE_URL}/resources`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getResourceById: (id: string): Promise<Resource> => {
    return fetchJson<Resource>(`${API_BASE_URL}/resources/${id}`);
  },

  updateResource: (id: string, updates: Partial<Resource>): Promise<Resource> => {
    return fetchJson<Resource>(`${API_BASE_URL}/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteResource: (id: string): Promise<void> => {
    return fetchJson<void>(`${API_BASE_URL}/resources/${id}`, {
      method: 'DELETE',
    });
  },

  // History
  getHistory: (sortOrder?: 'newest' | 'oldest'): Promise<HistoryRecord[]> => {
    const query = sortOrder ? `?sort=${sortOrder}` : '';
    return fetchJson<HistoryRecord[]>(`${API_BASE_URL}/history${query}`);
  },

  getNodeNavigation: (id?: string): Promise<HistoryNodeNavigation> => {
    const query = id ? `?id=${encodeURIComponent(id)}` : '';
    return fetchJson<HistoryNodeNavigation>(`${API_BASE_URL}/history/node${query}`);
  },

  importHistoryBatch: (
    items: HistoryBatchImportItem[],
    defaultSource: string = 'chrome'
  ): Promise<HistoryBatchImportResponse> => {
    return fetchJson<HistoryBatchImportResponse>(`${API_BASE_URL}/history/import`, {
      method: 'POST',
      body: JSON.stringify({ items, defaultSource }),
    });
  },

  getChromeSyncSummary: (): Promise<ChromeSyncSummary> => {
    return fetchJson<ChromeSyncSummary>(`${API_BASE_URL}/history/sync-summary`);
  },

  deleteHistoryItem: (id: string): Promise<void> => {
    return fetchJson<void>(`${API_BASE_URL}/history/${id}`, {
      method: 'DELETE',
    });
  },

  clearHistory: (): Promise<void> => {
    return fetchJson<void>(`${API_BASE_URL}/history`, {
      method: 'DELETE',
    });
  },


  // Navigation
  recordVisit: (visitData: {
    url: string;
    title?: string;
    category?: string;
    resourceId?: string;
    source?: string;
  }): Promise<HistoryRecord> => {
    return fetchJson<HistoryRecord>(`${API_BASE_URL}/navigation/visit`, {
      method: 'POST',
      body: JSON.stringify(visitData),
    });
  },

  navigateBack: (): Promise<HistoryRecord> => {
    return fetchJson<HistoryRecord>(`${API_BASE_URL}/navigation/back`, {
      method: 'POST',
    });
  },

  navigateForward: (): Promise<HistoryRecord> => {
    return fetchJson<HistoryRecord>(`${API_BASE_URL}/navigation/forward`, {
      method: 'POST',
    });
  },

  getNavigationCurrent: (): Promise<NavigationState> => {
    return fetchJson<NavigationState>(`${API_BASE_URL}/navigation/current`);
  },

  // Search
  searchByKeyword: (q: string): Promise<SearchResultResponse> => {
    return fetchJson<SearchResultResponse>(
      `${API_BASE_URL}/search?q=${encodeURIComponent(q)}`
    );
  },

  exactUrlLookup: (url: string): Promise<ExactLookupResponse> => {
    return fetchJson<ExactLookupResponse>(
      `${API_BASE_URL}/search/url?url=${encodeURIComponent(url)}`
    );
  },

  // Analytics
  getAnalyticsSummary: (): Promise<AnalyticsSummary> => {
    return fetchJson<AnalyticsSummary>(`${API_BASE_URL}/analytics/summary`);
  },

  getPopularResources: (): Promise<Resource[]> => {
    return fetchJson<Resource[]>(`${API_BASE_URL}/analytics/popular`);
  },

  getPerformanceComparison: (targetUrl?: string): Promise<PerformanceComparison> => {
    const query = targetUrl ? `?url=${encodeURIComponent(targetUrl)}` : '';
    return fetchJson<PerformanceComparison>(
      `${API_BASE_URL}/analytics/performance${query}`
    );
  },

  resetSampleData: (): Promise<void> => {
    return fetchJson<void>(`${API_BASE_URL}/resources/reset`, {
      method: 'POST',
    });
  },
};
