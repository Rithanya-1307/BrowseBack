import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  Resource,
  HistoryRecord,
  ChromeSyncSummary,
  HistoryBatchImportItem,
  HistoryBatchImportResponse,
} from '../types';
import { browseBackApi, API_BASE_URL } from '../services/api';

interface ResearchContextType {
  resources: Resource[];
  history: HistoryRecord[];
  activeHistoryIndex: number;
  addResource: (data: Omit<Resource, 'id' | 'createdAt' | 'visitCount'>) => Resource;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  openResource: (resource: Resource) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  historyGoBack: () => HistoryRecord | null;
  historyGoForward: () => HistoryRecord | null;
  canGoBack: boolean;
  canGoForward: boolean;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  isLoading: boolean;
  isBackendConnected: boolean;
  isExtensionDetected: boolean;
  refreshData: () => Promise<void>;
  chromeSyncSummary: ChromeSyncSummary | null;
  importChromeHistoryBatch: (
    items: HistoryBatchImportItem[],
    defaultSource?: string
  ) => Promise<HistoryBatchImportResponse>;
  refreshChromeSyncSummary: () => Promise<void>;
  triggerChromeSync: (options?: { timeRangeMs?: number; maxResults?: number }) => Promise<void>;
  isSyncing: boolean;
  sortOrder: 'newest' | 'oldest';
  setSortOrder: (order: 'newest' | 'oldest') => void;
  syncNotification: { text: string; type: 'success' | 'error' | 'info' } | null;
  clearSyncNotification: () => void;
}

const STORAGE_KEY_RESOURCES = 'browseback_resources_v1';
const STORAGE_KEY_HISTORY = 'browseback_history_v1';
const STORAGE_KEY_BACKEND = 'browseback_backend_url';

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export const ResearchProvider = ({ children }: { children: ReactNode }) => {
  // Strict Real-Data: initialize from local storage cache of real data, defaulting to empty arrays
  const [resources, setResources] = useState<Resource[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RESOURCES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [activeHistoryIndex, setActiveHistoryIndex] = useState<number>(0);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [backendUrl, setBackendUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_BACKEND) || API_BASE_URL;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isExtensionDetected, setIsExtensionDetected] = useState<boolean>(false);
  const [chromeSyncSummary, setChromeSyncSummary] = useState<ChromeSyncSummary | null>(null);
  const [sortOrder, setSortOrderState] = useState<'newest' | 'oldest'>('newest');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotification, setSyncNotification] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const clearSyncNotification = useCallback(() => {
    setSyncNotification(null);
  }, []);

  const setSortOrder = useCallback(
    async (order: 'newest' | 'oldest') => {
      setSortOrderState(order);
      if (isBackendConnected) {
        try {
          const backendHistory = await browseBackApi.getHistory(order);
          if (Array.isArray(backendHistory)) {
            setHistory(backendHistory);
          }
        } catch (err) {
          console.warn('Backend sorting failed:', err);
        }
      } else {
        setHistory((prev) => {
          const copy = [...prev];
          copy.sort((a, b) => {
            const t1 = a.visitedAt || '';
            const t2 = b.visitedAt || '';
            return order === 'newest' ? t2.localeCompare(t1) : t1.localeCompare(t2);
          });
          return copy;
        });
      }
    },
    [isBackendConnected]
  );

  // Fetch genuine records from Spring Boot backend
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const isHealthy = await browseBackApi.checkHealth();
      if (isHealthy) {
        setIsBackendConnected(true);
        const [backendResources, backendHistory, navState, syncSummary] = await Promise.all([
          browseBackApi.getResources().catch(() => null),
          browseBackApi.getHistory(sortOrder).catch(() => null),
          browseBackApi.getNavigationCurrent().catch(() => null),
          browseBackApi.getChromeSyncSummary().catch(() => null),
        ]);

        if (Array.isArray(backendResources)) {
          setResources(backendResources);
        }
        if (Array.isArray(backendHistory)) {
          setHistory(backendHistory);
        }
        if (navState && navState.current) {
          setActiveHistoryIndex(0);
        }
        if (syncSummary) {
          setChromeSyncSummary(syncSummary);
        }
      } else {
        setIsBackendConnected(false);
      }
    } catch (err) {
      console.warn('Backend sync check failed:', err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshChromeSyncSummary = useCallback(async () => {
    if (isBackendConnected) {
      try {
        const summary = await browseBackApi.getChromeSyncSummary();
        setChromeSyncSummary(summary);
      } catch (err) {
        console.warn('Failed to fetch Chrome sync summary:', err);
      }
    }
  }, [isBackendConnected]);

  // Extension status detection and sync completion event handling
  useEffect(() => {
    const checkExt = () => {
      const isPresent = document.documentElement.getAttribute('data-browseback-extension') !== null;
      if (isPresent) setIsExtensionDetected(true);
    };

    checkExt();

    const handleReady = () => setIsExtensionDetected(true);
    const handleStatus = (e: any) => {
      if (e.detail?.connected) {
        setIsExtensionDetected(true);
      }
    };

    const handleSyncComplete = async (e: any) => {
      setIsSyncing(false);
      const res = e.detail;
      if (res && res.success) {
        await refreshData();
        setSyncNotification({
          text:
            res.message ||
            `Successfully synced ${res.totalImported} Chrome visits (${res.totalDuplicates} duplicate records skipped).`,
          type: 'success',
        });
        setTimeout(() => setSyncNotification(null), 6000);
      } else {
        setSyncNotification({
          text: `Sync failed: ${res?.error || 'Could not synchronize history from Chrome extension.'}`,
          type: 'error',
        });
      }
    };

    window.addEventListener('BROWSEBACK_EXTENSION_READY', handleReady);
    window.addEventListener('BROWSEBACK_STATUS_RESPONSE', handleStatus);
    window.addEventListener('BROWSEBACK_SYNC_COMPLETED', handleSyncComplete);

    window.dispatchEvent(new CustomEvent('BROWSEBACK_CHECK_STATUS'));
    const t = setTimeout(checkExt, 600);

    return () => {
      clearTimeout(t);
      window.removeEventListener('BROWSEBACK_EXTENSION_READY', handleReady);
      window.removeEventListener('BROWSEBACK_STATUS_RESPONSE', handleStatus);
      window.removeEventListener('BROWSEBACK_SYNC_COMPLETED', handleSyncComplete);
    };
  }, [refreshData]);

  const triggerChromeSync = useCallback(
    async (options?: { timeRangeMs?: number; maxResults?: number }) => {
      if (isExtensionDetected) {
        setIsSyncing(true);
        setSyncNotification({
          text: 'Querying Chrome History API and synchronizing batches with Spring Boot backend...',
          type: 'info',
        });
        window.dispatchEvent(
          new CustomEvent('BROWSEBACK_TRIGGER_SYNC', {
            detail: {
              timeRangeMs: options?.timeRangeMs ?? 604800000, // 7 days
              maxResults: options?.maxResults ?? 500,
            },
          })
        );
      } else {
        // Ping extension once more
        window.dispatchEvent(new CustomEvent('BROWSEBACK_CHECK_STATUS'));
        setSyncNotification({
          text: 'Chrome extension not detected in this tab. Ensure the extension is loaded at chrome://extensions.',
          type: 'info',
        });
      }
    },
    [isExtensionDetected]
  );

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Persist to localStorage cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RESOURCES, JSON.stringify(resources));
    } catch (e) {
      console.warn('Failed to persist resources cache', e);
    }
  }, [resources]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to persist history cache', e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BACKEND, backendUrl);
    } catch (e) {
      console.warn('Failed to persist backend url', e);
    }
  }, [backendUrl]);

  const addResource = (data: Omit<Resource, 'id' | 'createdAt' | 'visitCount'>): Resource => {
    const tempId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newResource: Resource = {
      ...data,
      id: tempId,
      createdAt: now,
      visitCount: 0,
      isPinned: false,
    };

    setResources((prev) => [newResource, ...prev]);

    if (isBackendConnected) {
      browseBackApi
        .createResource({
          title: data.title,
          url: data.url,
          category: data.category,
          tags: data.tags,
          notes: data.notes,
          isPinned: false,
        })
        .then((created) => {
          setResources((prev) => prev.map((r) => (r.id === tempId ? created : r)));
        })
        .catch((err) => console.warn('Backend addResource failed:', err));
    }

    return newResource;
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    if (isBackendConnected) {
      browseBackApi
        .updateResource(id, updates)
        .catch((err) => console.warn('Backend updateResource failed:', err));
    }
  };

  const deleteResource = (id: string) => {
    setResources((prev) => prev.filter((item) => item.id !== id));

    if (isBackendConnected) {
      browseBackApi
        .deleteResource(id)
        .catch((err) => console.warn('Backend deleteResource failed:', err));
    }
  };

  const openResource = (resource: Resource) => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }

    const now = new Date().toISOString();

    setResources((prev) =>
      prev.map((item) =>
        item.id === resource.id
          ? { ...item, visitCount: (item.visitCount || 0) + 1, lastVisitedAt: now }
          : item
      )
    );

    const newHist: HistoryRecord = {
      id: `hist-${Date.now()}`,
      resourceId: resource.id,
      title: resource.title,
      url: resource.url,
      category: resource.category,
      visitedAt: now,
      source: 'library',
    };

    setHistory((prev) => [newHist, ...prev]);
    setActiveHistoryIndex(0);

    if (isBackendConnected) {
      browseBackApi
        .recordVisit({
          url: resource.url,
          title: resource.title,
          category: resource.category,
          resourceId: resource.id,
          source: 'library',
        })
        .then((recorded) => {
          setHistory((prev) => prev.map((h) => (h.id === newHist.id ? recorded : h)));
        })
        .catch((err) => console.warn('Backend recordVisit failed:', err));
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (activeHistoryIndex >= updated.length) {
        setActiveHistoryIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });

    if (isBackendConnected) {
      browseBackApi
        .deleteHistoryItem(id)
        .catch((err) => console.warn('Backend deleteHistoryItem failed:', err));
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setActiveHistoryIndex(0);

    if (isBackendConnected) {
      browseBackApi
        .clearHistory()
        .catch((err) => console.warn('Backend clearHistory failed:', err));
    }
  };

  // Stack navigation simulation
  const canGoBack = activeHistoryIndex < history.length - 1;
  const canGoForward = activeHistoryIndex > 0;

  const historyGoBack = (): HistoryRecord | null => {
    if (canGoBack) {
      const nextIndex = activeHistoryIndex + 1;
      setActiveHistoryIndex(nextIndex);
      const target = history[nextIndex];

      if (isBackendConnected) {
        browseBackApi.navigateBack().catch(() => null);
      }
      return target;
    }
    return null;
  };

  const historyGoForward = (): HistoryRecord | null => {
    if (canGoForward) {
      const prevIndex = activeHistoryIndex - 1;
      setActiveHistoryIndex(prevIndex);
      const target = history[prevIndex];

      if (isBackendConnected) {
        browseBackApi.navigateForward().catch(() => null);
      }
      return target;
    }
    return null;
  };

  const importChromeHistoryBatch = async (
    items: HistoryBatchImportItem[],
    defaultSource: string = 'chrome'
  ): Promise<HistoryBatchImportResponse> => {
    if (isBackendConnected) {
      const response = await browseBackApi.importHistoryBatch(items, defaultSource);
      await refreshData();
      return response;
    } else {
      const now = new Date().toISOString();
      const imported: HistoryRecord[] = items.map((item, idx) => ({
        id: `hist-local-${Date.now()}-${idx}`,
        title: item.title || item.url,
        url: item.url,
        category: (item.category as any) || 'General',
        visitedAt: item.timestamp || now,
        durationSeconds: item.durationSeconds,
        source: (item.source || defaultSource) as any,
      }));
      setHistory((prev) => [...imported, ...prev]);
      return {
        totalReceived: items.length,
        importedCount: items.length,
        duplicateCount: 0,
        totalHistoryRecords: history.length + items.length,
        message: `Imported ${items.length} items (local mode).`,
        sampleImported: imported.slice(0, 5),
      };
    }
  };

  return (
    <ResearchContext.Provider
      value={{
        resources,
        history,
        activeHistoryIndex,
        addResource,
        updateResource,
        deleteResource,
        openResource,
        deleteHistoryItem,
        clearHistory,
        historyGoBack,
        historyGoForward,
        canGoBack,
        canGoForward,
        globalSearchQuery,
        setGlobalSearchQuery,
        backendUrl,
        setBackendUrl,
        isLoading,
        isBackendConnected,
        isExtensionDetected,
        refreshData,
        chromeSyncSummary,
        importChromeHistoryBatch,
        refreshChromeSyncSummary,
        triggerChromeSync,
        isSyncing,
        sortOrder,
        setSortOrder,
        syncNotification,
        clearSyncNotification,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
};
