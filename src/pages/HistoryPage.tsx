import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  History,
  ArrowLeft,
  ArrowRight,
  Search,
  Trash2,
  ExternalLink,
  Globe,
  RefreshCw,
  HelpCircle,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  GitCommit
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { browseBackApi, type HistoryNodeNavigation } from '../services/api';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Favicon } from '../components/common/Favicon';
import { Modal } from '../components/common/Modal';
import type { HistoryRecord } from '../types';

export const HistoryPage = () => {
  const {
    history,
    deleteHistoryItem,
    clearHistory,
    activeHistoryIndex,
    historyGoBack,
    historyGoForward,
    canGoBack,
    canGoForward,
    openResource,
    resources,
    refreshData,
    isBackendConnected,
    isExtensionDetected,
    sortOrder,
    setSortOrder,
    triggerChromeSync,
    isSyncing,
    syncNotification,
    clearSyncNotification,
  } = useResearch();

  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'chrome' | 'app'>('all');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);

  // Doubly Linked List node navigation state
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [nodeNav, setNodeNav] = useState<HistoryNodeNavigation | null>(null);
  const [isNavLoading, setIsNavLoading] = useState(false);

  // Statistics breakdown from genuine data
  const chromeCount = useMemo(
    () => history.filter((h) => h.source === 'chrome').length,
    [history]
  );
  const appCount = history.length - chromeCount;

  // Derived active record ID for DoublyLinkedList navigation
  const activeRecordId = selectedRecordId || (history.length > 0 ? history[0].id : null);

  // Synchronize DoublyLinkedList node navigation with backend
  const updateNodeNavigation = useCallback(
    async (id: string) => {
      setIsNavLoading(true);
      try {
        if (isBackendConnected) {
          const res = await browseBackApi.getNodeNavigation(id);
          setNodeNav(res);
        } else {
          // Local fallback using array linkage
          const idx = history.findIndex((h) => h.id === id);
          if (idx !== -1) {
            const current = history[idx];
            const prev = idx < history.length - 1 ? history[idx + 1] : null;
            const next = idx > 0 ? history[idx - 1] : null;
            setNodeNav({
              currentRecord: current,
              previousRecord: prev,
              nextRecord: next,
              hasPrevious: prev !== null,
              hasNext: next !== null,
              totalRecords: history.length,
              explanation: 'Each node links to the previous and next record.',
            });
          }
        }
      } catch (err) {
        console.warn('Failed to fetch node navigation:', err);
      } finally {
        setIsNavLoading(false);
      }
    },
    [isBackendConnected, history]
  );

  useEffect(() => {
    if (activeRecordId) {
      void Promise.resolve().then(() => {
        updateNodeNavigation(activeRecordId);
      });
    }
  }, [activeRecordId, updateNodeNavigation]);

  // Handle DoublyLinkedList Previous (Older Node)
  const handleStepPrevious = () => {
    if (nodeNav?.previousRecord) {
      setSelectedRecordId(nodeNav.previousRecord.id);
    }
  };

  // Handle DoublyLinkedList Next (Newer Node)
  const handleStepNext = () => {
    if (nodeNav?.nextRecord) {
      setSelectedRecordId(nodeNav.nextRecord.id);
    }
  };

  // Filter history records based on search query and source
  const filteredHistory = useMemo(() => {
    let result = history;

    if (sourceFilter === 'chrome') {
      result = result.filter((h) => h.source === 'chrome');
    } else if (sourceFilter === 'app') {
      result = result.filter((h) => h.source !== 'chrome');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.url.toLowerCase().includes(q) ||
          (h.category && h.category.toLowerCase().includes(q))
      );
    }

    return result;
  }, [history, sourceFilter, searchQuery]);

  const currentSimulatedRecord = history[activeHistoryIndex] || null;

  const handleCopy = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }).catch(() => null);
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText('e:\\BrowseBack\\browser-extension').then(() => {
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    }).catch(() => null);
  };

  const handleRevisit = (hist: HistoryRecord) => {
    setSelectedRecordId(hist.id);
    const match = resources.find((r) => r.url === hist.url || r.id === hist.resourceId);
    if (match) {
      openResource(match);
    } else {
      openResource({
        id: hist.resourceId || `hist-ref-${hist.id}`,
        title: hist.title,
        url: hist.url,
        category: hist.category || 'General',
        tags: [],
        notes: '',
        createdAt: hist.visitedAt,
        visitCount: 1,
        isPinned: false,
      });
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {syncNotification && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: syncNotification.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${syncNotification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: syncNotification.type === 'success' ? '#065f46' : '#991b1b',
            fontSize: '0.825rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {syncNotification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{syncNotification.text}</span>
          </div>
          <button
            onClick={clearSyncNotification}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chrome Extension History Synchronization Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
              flexShrink: 0,
            }}
          >
            <Globe size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Chrome Browsing History
              </h3>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  padding: '0.1rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isExtensionDetected ? '#eff6ff' : '#fffbeb',
                  color: isExtensionDetected ? '#1d4ed8' : '#92400e',
                  border: `1px solid ${isExtensionDetected ? '#bfdbfe' : '#fde68a'}`,
                }}
              >
                {isExtensionDetected ? 'Chrome Extension Connected' : 'Extension Standby'}
              </span>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  padding: '0.1rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isBackendConnected ? '#ecfdf5' : '#fef2f2',
                  color: isBackendConnected ? '#065f46' : '#991b1b',
                  border: `1px solid ${isBackendConnected ? '#a7f3d0' : '#fecaca'}`,
                }}
              >
                {isBackendConnected ? `${history.length} Real Records in H2` : 'Backend Offline'}
              </span>
            </div>
            <p style={{ fontSize: '0.785rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Import genuine browser visits via Chrome History API into custom DoublyLinkedList &amp; HashTable data structures.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => triggerChromeSync()}
            disabled={isSyncing}
            className="btn btn-primary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Chrome History'}</span>
          </button>

          <button
            onClick={() => refreshData()}
            disabled={isSyncing}
            className="btn btn-secondary btn-sm"
            title="Refresh database records"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="btn btn-secondary btn-sm"
            title="View extension setup guide"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <HelpCircle size={14} />
            <span>Extension Setup</span>
          </button>
        </div>
      </div>

      {/* DSA Integration 1: Doubly Linked List — Previous and Next Navigation */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#ffffff',
          border: '1px solid #bfdbfe',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <GitCommit size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Doubly Linked List — Previous and Next Navigation
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#1d4ed8', margin: '0.1rem 0 0 0', fontWeight: 600 }}>
                “Each node links to the previous and next record.”
              </p>
            </div>
          </div>

          {/* Stepper Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleStepPrevious}
              disabled={!nodeNav?.hasPrevious || isNavLoading}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.775rem',
                padding: '0.4rem 0.75rem',
              }}
              title={nodeNav?.previousRecord ? `Step to previous node: ${nodeNav.previousRecord.title}` : 'Beginning of list (No previous record)'}
            >
              <ChevronLeft size={14} />
              <span>Previous Record</span>
            </button>

            <button
              onClick={handleStepNext}
              disabled={!nodeNav?.hasNext || isNavLoading}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.775rem',
                padding: '0.4rem 0.75rem',
              }}
              title={nodeNav?.nextRecord ? `Step to next node: ${nodeNav.nextRecord.title}` : 'End of list (No next record)'}
            >
              <span>Next Record</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Active Node Synchronized Preview */}
        {nodeNav?.currentRecord ? (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
              <Favicon url={nodeNav.currentRecord.url} title={nodeNav.currentRecord.title} size={18} />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={nodeNav.currentRecord.title}
                >
                  {nodeNav.currentRecord.title}
                </div>
                <div
                  style={{
                    fontSize: '0.725rem',
                    color: '#64748b',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={nodeNav.currentRecord.url}
                >
                  {nodeNav.currentRecord.url}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                Visited: {formatTimestamp(nodeNav.currentRecord.visitedAt)}
              </span>
              <button
                onClick={() => handleRevisit(nodeNav.currentRecord!)}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              >
                <span>Visit Node</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.775rem', color: '#64748b', margin: 0 }}>
            Select any record in the table below to inspect its previous and next node links.
          </p>
        )}
      </div>

      {/* DSA Integration 2: Custom Stack — Back and Forward Navigation */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
          >
            <Layers size={15} />
          </div>
          <div>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
              Custom Stack Navigation
            </span>
            <span style={{ fontSize: '0.75rem', color: '#475569', marginLeft: '0.5rem', fontWeight: 500 }}>
              “A stack follows Last In, First Out (LIFO).”
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={historyGoBack}
            disabled={!canGoBack}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
            title="Pop current visit and navigate back in CustomStack"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>

          <button
            onClick={historyGoForward}
            disabled={!canGoForward}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
            title="Navigate forward in CustomStack"
          >
            <span>Forward</span>
            <ArrowRight size={13} />
          </button>

          {currentSimulatedRecord && (
            <span
              style={{
                fontSize: '0.725rem',
                color: '#64748b',
                maxWidth: '220px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                padding: '0.2rem 0.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #e2e8f0',
              }}
              title={`Top of stack: ${currentSimulatedRecord.title}`}
            >
              Top: {currentSimulatedRecord.title}
            </span>
          )}
        </div>
      </div>

      {/* Controls Bar: Search Field, Merge Sort Control, Source Filters */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records by title or URL..."
            className="form-input"
            style={{ paddingLeft: '2.2rem', height: '36px', fontSize: '0.8125rem' }}
          />
        </div>

        {/* Right Controls: Merge Sort and Source Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* DSA Integration 3: Merge Sort Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowUpDown size={14} color="#2563eb" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
              Sort by:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="form-select"
              style={{ height: '36px', fontSize: '0.775rem', padding: '0 1.5rem 0 0.65rem' }}
              title="Merge Sort divides records into smaller groups, sorts them, and merges them in order."
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Source Filter */}
          <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <button
              onClick={() => setSourceFilter('all')}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                backgroundColor: sourceFilter === 'all' ? '#2563eb' : '#ffffff',
                color: sourceFilter === 'all' ? '#ffffff' : '#475569',
                cursor: 'pointer',
              }}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setSourceFilter('chrome')}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                borderLeft: '1px solid #cbd5e1',
                backgroundColor: sourceFilter === 'chrome' ? '#2563eb' : '#ffffff',
                color: sourceFilter === 'chrome' ? '#ffffff' : '#475569',
                cursor: 'pointer',
              }}
            >
              Chrome ({chromeCount})
            </button>
            <button
              onClick={() => setSourceFilter('app')}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                borderLeft: '1px solid #cbd5e1',
                backgroundColor: sourceFilter === 'app' ? '#2563eb' : '#ffffff',
                color: sourceFilter === 'app' ? '#ffffff' : '#475569',
                cursor: 'pointer',
              }}
            >
              App ({appCount})
            </button>
          </div>

          {/* Clear History Button */}
          {history.length > 0 && (
            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="btn btn-ghost btn-sm"
              style={{ color: '#dc2626', fontSize: '0.775rem', padding: '0.35rem 0.65rem' }}
              title="Clear browsing history records"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Sorting Explanation Note */}
      <div style={{ fontSize: '0.75rem', color: '#64748b', paddingLeft: '0.25rem', marginTop: '-0.5rem' }}>
        Merge Sort Concept: <strong style={{ color: '#334155' }}>“Merge Sort divides records into smaller groups, sorts them, and merges them in order.”</strong>
      </div>

      {/* History Records Table / Empty State */}
      {filteredHistory.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
              marginBottom: '0.75rem',
            }}
          >
            <History size={22} />
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            {searchQuery || sourceFilter !== 'all' ? 'No matching records found' : 'No browsing history records yet'}
          </h4>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: '420px', margin: '0 auto 1rem auto' }}>
            {searchQuery || sourceFilter !== 'all'
              ? 'Try adjusting your search query or source filter.'
              : 'Load the Chrome extension and click "Sync Chrome History" above to import your genuine browsing timeline.'}
          </p>
          {searchQuery || sourceFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSourceFilter('all');
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={() => triggerChromeSync()}
              disabled={isSyncing}
              className="btn btn-primary btn-sm"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>Sync Chrome History</span>
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div
            style={{
              padding: '0.65rem 1rem',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Showing {filteredHistory.length} browsing history records</span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Sorted by Timestamp ({sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}) via MergeSort
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.8125rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    color: '#64748b',
                    fontSize: '0.725rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <th style={{ padding: '0.65rem 0.85rem' }}>Page Title / URL</th>
                  <th style={{ padding: '0.65rem 0.85rem', width: '120px' }}>Source</th>
                  <th style={{ padding: '0.65rem 0.85rem', width: '160px' }}>Visited Timestamp</th>
                  <th style={{ padding: '0.65rem 0.85rem', width: '100px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => {
                  const isSelectedNode = selectedRecordId === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRevisit(item)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        backgroundColor: isSelectedNode ? '#eff6ff' : 'transparent',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      className="hover-row"
                    >
                      {/* Title and URL */}
                      <td style={{ padding: '0.65rem 0.85rem', maxWidth: '480px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <Favicon url={item.url} title={item.title} size={18} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                color: isSelectedNode ? '#1d4ed8' : '#0f172a',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={item.title || item.url}
                            >
                              {item.title || item.url}
                            </div>
                            <div
                              style={{
                                fontSize: '0.725rem',
                                color: '#64748b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontFamily: 'var(--font-mono)',
                              }}
                              title={item.url}
                            >
                              {item.url}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Source Tag */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        {item.source === 'chrome' ? (
                          <span
                            style={{
                              fontSize: '0.675rem',
                              fontWeight: 600,
                              padding: '0.125rem 0.45rem',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: '#fffbeb',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <Globe size={11} color="#d97706" />
                            Chrome
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.675rem',
                              fontWeight: 600,
                              padding: '0.125rem 0.45rem',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: '#eff6ff',
                              color: '#1e40af',
                              border: '1px solid #bfdbfe',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            App
                          </span>
                        )}
                      </td>

                      {/* Visited Timestamp */}
                      <td style={{ padding: '0.65rem 0.85rem', color: '#64748b', fontSize: '0.75rem' }}>
                        {formatTimestamp(item.visitedAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                        <div
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => handleCopy(item.url, e)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.2rem 0.35rem', color: '#64748b' }}
                            title="Copy URL"
                          >
                            {copiedUrl === item.url ? (
                              <Check size={13} color="#10b981" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.2rem 0.35rem', color: '#2563eb' }}
                            title="Open website"
                          >
                            <ExternalLink size={13} />
                          </a>

                          <button
                            onClick={() => setDeleteEntryId(item.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.2rem 0.35rem', color: '#dc2626' }}
                            title="Delete this visit"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clear All History Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={() => {
          clearHistory();
          setIsClearConfirmOpen(false);
        }}
        title="Clear All Browsing History?"
        message="This will delete all imported Chrome visits and BrowseBack visits from the local database. This action cannot be undone."
        confirmLabel="Clear All History"
        confirmVariant="danger"
      />

      {/* Delete Single Record Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteEntryId !== null}
        onClose={() => setDeleteEntryId(null)}
        onConfirm={() => {
          if (deleteEntryId) {
            deleteHistoryItem(deleteEntryId);
            setDeleteEntryId(null);
          }
        }}
        title="Delete History Record"
        message="Are you sure you want to remove this visit record from your browsing history?"
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      {/* Setup Guide Modal */}
      <Modal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        title="Chrome Extension Installation Guide"
        maxWidth="540px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.825rem', lineHeight: 1.6 }}>
          <p style={{ color: '#334155' }}>
            BrowseBack connects to a live Google Chrome Manifest V3 extension to synchronize your real browsing records.
          </p>
          <ol style={{ paddingLeft: '1.25rem', color: '#0f172a' }}>
            <li>Open <code>chrome://extensions</code> in Google Chrome.</li>
            <li>Enable <strong>Developer mode</strong> using the switch in the top-right corner.</li>
            <li>Click <strong>Load unpacked</strong> and select the directory:</li>
          </ol>
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#f1f5f9',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.775rem',
            }}
          >
            <span>e:\BrowseBack\browser-extension</span>
            <button onClick={handleCopyPath} className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
              {copiedPath ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
              <span>{copiedPath ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.785rem' }}>
            Once loaded, click the BrowseBack icon in your Chrome toolbar or use the <strong>Sync Chrome History</strong> button to stream visits into BrowseBack.
          </p>
        </div>
      </Modal>

      <style>{`
        .hover-row:hover {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
};
