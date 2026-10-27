import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Globe,
  RefreshCw,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { Favicon } from '../components/common/Favicon';
import type { HistoryRecord } from '../types';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    history,
    resources,
    openResource,
    isBackendConnected,
    isExtensionDetected,
    chromeSyncSummary,
    triggerChromeSync,
    refreshData,
    isSyncing,
    syncNotification,
    clearSyncNotification,
  } = useResearch();

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Real statistics derived purely from genuine state
  const totalHistory = history.length;
  const chromeCount = useMemo(
    () => history.filter((h) => h.source === 'chrome').length,
    [history]
  );
  const appCount = totalHistory - chromeCount;
  const totalSaved = resources.length;

  const uniqueDomainsCount = useMemo(() => {
    const domains = new Set<string>();
    const extract = (rawUrl: string) => {
      try {
        const u = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
        return u.hostname.replace(/^www\./, '').toLowerCase();
      } catch {
        return '';
      }
    };

    history.forEach((h) => {
      const d = extract(h.url);
      if (d) domains.add(d);
    });
    resources.forEach((r) => {
      const d = extract(r.url);
      if (d) domains.add(d);
    });

    return domains.size;
  }, [history, resources]);

  // Latest 10 genuine visits from history
  const recentVisits = useMemo(() => {
    return history.slice(0, 10);
  }, [history]);

  // Helper for domain formatting
  const getDomain = (rawUrl: string) => {
    try {
      const u = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return rawUrl;
    }
  };

  // Helper for human-readable timestamps
  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleCopy = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }).catch(() => null);
  };

  const handleVisit = (record: HistoryRecord) => {
    const match = resources.find((r) => r.url === record.url || r.id === record.resourceId);
    if (match) {
      openResource(match);
    } else {
      openResource({
        id: record.resourceId || `hist-ref-${record.id}`,
        title: record.title,
        url: record.url,
        category: record.category || 'General',
        tags: [],
        notes: '',
        createdAt: record.visitedAt,
        visitCount: 1,
        isPinned: false,
      });
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Sync / Operation Notification Toast */}
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
            {syncNotification.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
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

      {/* 4 Summary Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Card 1: Total Browsing Records */}
        <div
          className="card"
          onClick={() => navigate('/history')}
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderLeft: '4px solid #0284c7',
            transition: 'all var(--transition-fast)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-subtle)' }}>
              Total History Records
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <History size={16} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              marginTop: '0.4rem',
              lineHeight: 1.1,
            }}
          >
            {totalHistory}
          </div>
          <div
            style={{
              fontSize: '0.725rem',
              color: 'var(--text-muted)',
              marginTop: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>{chromeCount} Chrome visits</span>
            <span>•</span>
            <span>{appCount} App visits</span>
          </div>
        </div>

        {/* Card 2: Chrome Extension Sync Status */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            borderLeft: `4px solid ${isExtensionDetected ? '#2563eb' : '#f59e0b'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-subtle)' }}>
              Chrome Extension Status
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: isExtensionDetected ? '#eff6ff' : '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isExtensionDetected ? '#2563eb' : '#d97706',
              }}
            >
              <Globe size={16} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#0f172a',
              marginTop: '0.65rem',
              lineHeight: 1.2,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isExtensionDetected ? '#2563eb' : '#f59e0b',
              }}
            />
            {isExtensionDetected ? 'Extension Connected' : 'Extension Standby'}
          </div>
          <div
            style={{
              fontSize: '0.725rem',
              color: 'var(--text-muted)',
              marginTop: '0.35rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {chromeSyncSummary?.lastImportedTimestamp
              ? `Last synced: ${formatTimestamp(chromeSyncSummary.lastImportedTimestamp)}`
              : 'Ready for synchronization'}
          </div>
        </div>

        {/* Card 3: Unique Domains Visited */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid #10b981',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-subtle)' }}>
              Unique Domains Visited
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <Globe size={16} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              marginTop: '0.4rem',
              lineHeight: 1.1,
            }}
          >
            {uniqueDomainsCount}
          </div>
          <div
            style={{
              fontSize: '0.725rem',
              color: 'var(--text-muted)',
              marginTop: '0.35rem',
            }}
          >
            Indexed in Hash Table lookup index
          </div>
        </div>

        {/* Card 4: Saved Research Bookmarks */}
        <div
          className="card"
          onClick={() => navigate('/library')}
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderLeft: '4px solid #8b5cf6',
            transition: 'all var(--transition-fast)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-subtle)' }}>
              Saved Research Resources
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#f3e8ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed',
              }}
            >
              <Bookmark size={16} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              marginTop: '0.4rem',
              lineHeight: 1.1,
            }}
          >
            {totalSaved}
          </div>
          <div
            style={{
              fontSize: '0.725rem',
              color: '#7c3aed',
              marginTop: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 600,
            }}
          >
            <span>Open Research Library</span>
            <ArrowRight size={11} />
          </div>
        </div>
      </div>

      {/* Chrome History Live Sync Banner */}
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
              width: '40px',
              height: '40px',
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
            <Globe size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Live Google Chrome History Synchronization
              </h3>
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
                {isBackendConnected ? 'H2 Database Persistent' : 'Backend Offline'}
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
            <span>{isSyncing ? 'Synchronizing...' : 'Sync Chrome History'}</span>
          </button>

          <button
            onClick={() => refreshData()}
            disabled={isSyncing}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Recently Visited Websites Table */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="#0284c7" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Recently Visited Websites
            </h3>
            <span
              style={{
                fontSize: '0.725rem',
                color: 'var(--text-subtle)',
                backgroundColor: 'var(--bg-app)',
                padding: '0.1rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Real Database Records
            </span>
          </div>

          <button
            onClick={() => navigate('/history')}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}
          >
            <span>View Full History ({totalHistory})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Table or Empty State */}
        {recentVisits.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed #cbd5e1',
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
              No browsing records yet
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1rem auto' }}>
              No browsing history records have been imported yet. Load the Chrome extension at <code>chrome://extensions</code> and click "Sync Chrome History" above to import your genuine browsing timeline.
            </p>
            <button
              onClick={() => triggerChromeSync()}
              disabled={isSyncing}
              className="btn btn-primary btn-sm"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>Sync Chrome History</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.825rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-subtle)',
                    fontSize: '0.725rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <th style={{ padding: '0.65rem 0.75rem' }}>Website / Page Title</th>
                  <th style={{ padding: '0.65rem 0.75rem', width: '130px' }}>Source</th>
                  <th style={{ padding: '0.65rem 0.75rem', width: '160px' }}>Visited Time</th>
                  <th style={{ padding: '0.65rem 0.75rem', width: '90px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleVisit(item)}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    className="hover-row"
                  >
                    {/* Title and Domain */}
                    <td style={{ padding: '0.75rem', maxWidth: '420px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Favicon url={item.url} title={item.title} size={18} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: 'var(--text-main)',
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
                              color: 'var(--text-subtle)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontFamily: 'var(--font-mono)',
                            }}
                            title={item.url}
                          >
                            <span style={{ fontWeight: 600, color: '#334155', marginRight: '0.4rem' }}>
                              {getDomain(item.url)}
                            </span>
                            <span>{item.url}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td style={{ padding: '0.75rem' }}>
                      {item.source === 'chrome' ? (
                        <span
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#fffbeb',
                            color: '#92400e',
                            border: '1px solid #fde68a',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
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
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#eff6ff',
                            color: '#1e40af',
                            border: '1px solid #bfdbfe',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          App
                        </span>
                      )}
                    </td>

                    {/* Visited Time */}
                    <td style={{ padding: '0.75rem', color: 'var(--text-subtle)', fontSize: '0.775rem' }}>
                      {formatTimestamp(item.visitedAt)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <div
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => handleCopy(item.url, e)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.25rem 0.4rem', color: 'var(--text-subtle)' }}
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
                          style={{ padding: '0.25rem 0.4rem', color: '#2563eb' }}
                          title="Open URL in new tab"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .hover-row:hover {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
};
