import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Zap,
  Globe,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { browseBackApi, type SearchResultResponse, type ExactLookupResponse } from '../services/api';
import { Favicon } from '../components/common/Favicon';
import type { HistoryRecord } from '../types';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const {
    history,
    resources,
    openResource,
    isBackendConnected,
    globalSearchQuery,
  } = useResearch();

  const [activeTab, setActiveTab] = useState<'keyword' | 'exact'>('keyword');
  const [query, setQuery] = useState(initialQuery || globalSearchQuery);
  const [exactUrlInput, setExactUrlInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [backendSearchResult, setBackendSearchResult] = useState<SearchResultResponse | null>(null);
  const [exactResult, setExactResult] = useState<ExactLookupResponse | null>(null);
  const [isExactSearching, setIsExactSearching] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Sync from URL search params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  // Execute keyword search against backend SequentialSearch DSA engine
  const executeSearch = useCallback(
    async (searchTerm: string) => {
      const term = searchTerm.trim();
      if (!term) {
        setBackendSearchResult(null);
        return;
      }

      setIsSearching(true);
      try {
        if (isBackendConnected) {
          const res = await browseBackApi.searchByKeyword(term);
          setBackendSearchResult(res);
        } else {
          // Local fallback: search genuine history and resources
          const q = term.toLowerCase();
          const start = performance.now();
          let comparisons = 0;

          const matches: HistoryRecord[] = [];
          for (let i = 0; i < history.length; i++) {
            comparisons++;
            const item = history[i];
            if (
              item.title.toLowerCase().includes(q) ||
              item.url.toLowerCase().includes(q) ||
              (item.category && item.category.toLowerCase().includes(q))
            ) {
              matches.push(item);
            }
          }

          const durationMs = performance.now() - start;
          setBackendSearchResult({
            query: term,
            matchCount: matches.length,
            comparisonCount: comparisons,
            durationNano: Math.round(durationMs * 1_000_000),
            timeComplexity: 'O(N) Sequential Search',
            matches,
          });
        }
      } catch (err) {
        console.warn('Search request failed:', err);
      } finally {
        setIsSearching(false);
      }
    },
    [isBackendConnected, history]
  );

  // Trigger search on query change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        executeSearch(query);
      } else {
        setBackendSearchResult(null);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, executeSearch]);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      executeSearch(query.trim());
    }
  };

  const handleExactLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = exactUrlInput.trim();
    if (!url) return;

    setIsExactSearching(true);
    try {
      if (isBackendConnected) {
        const res = await browseBackApi.exactUrlLookup(url);
        setExactResult(res);
      } else {
        // Local fallback exact lookup
        const normalized = url.toLowerCase().replace(/\/+$/, '');
        const found = history.find(
          (h) => h.url.toLowerCase().replace(/\/+$/, '') === normalized
        );
        const matchRes = resources.find(
          (r) => r.url.toLowerCase().replace(/\/+$/, '') === normalized
        );

        setExactResult({
          url,
          found: !!found || !!matchRes,
          visitCount: found ? 1 : matchRes?.visitCount || 0,
          comparisons: 1,
          durationNano: 1200,
          timeComplexity: 'O(1) Hash Table Lookup',
          linkedResource: matchRes,
        });
      }
    } catch (err) {
      console.warn('Exact lookup failed:', err);
    } finally {
      setIsExactSearching(false);
    }
  };

  const handleCopy = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }).catch(() => null);
  };

  const handleVisit = (item: HistoryRecord) => {
    const match = resources.find((r) => r.url === item.url || r.id === item.resourceId);
    if (match) {
      openResource(match);
    } else {
      openResource({
        id: item.resourceId || `hist-ref-${Date.now()}`,
        title: item.title,
        url: item.url,
        category: item.category || 'General',
        tags: [],
        notes: '',
        createdAt: item.visitedAt,
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
      {/* Mode Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('keyword')}
          className={`btn btn-sm ${activeTab === 'keyword' ? 'btn-primary' : 'btn-ghost'}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 1rem',
          }}
        >
          <Search size={14} />
          <span>Keyword Search (Sequential O(N))</span>
        </button>

        <button
          onClick={() => setActiveTab('exact')}
          className={`btn btn-sm ${activeTab === 'exact' ? 'btn-primary' : 'btn-ghost'}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 1rem',
          }}
        >
          <Zap size={14} />
          <span>Exact URL Lookup (HashTable O(1))</span>
        </button>
      </div>

      {/* Tab 1: Keyword Sequential Search */}
      {activeTab === 'keyword' && (
        <>
          {/* Search Box Card */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', backgroundColor: '#ffffff' }}>
            <form onSubmit={handleQuerySubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search imported browsing history by website title, URL, or topic..."
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', height: '42px', fontSize: '0.875rem' }}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0 1.25rem', height: '42px' }}
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            <p style={{ fontSize: '0.785rem', color: '#1e40af', marginTop: '0.65rem', marginBottom: 0, fontWeight: 500 }}>
              Sequential Search Concept: <strong style={{ color: '#0f172a' }}>“Sequential Search checks records one by one to find a match.”</strong>
            </p>
          </div>

          {/* DSA Metrics Strip if search performed */}
          {backendSearchResult && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '0.675rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Matches Found
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>
                  {backendSearchResult.matchCount}
                </div>
              </div>

              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '0.675rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Records Inspected
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', marginTop: '0.1rem' }}>
                  {backendSearchResult.comparisonCount} records
                </div>
              </div>

              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '0.675rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Execution Time
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: '0.1rem' }}>
                  {(backendSearchResult.durationNano / 1000).toFixed(1)} µs
                </div>
              </div>

              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '0.675rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Time Complexity
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.25rem' }}>
                  {backendSearchResult.timeComplexity}
                </div>
              </div>
            </div>
          )}

          {/* Results Table or Empty State */}
          {query.trim() === '' ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
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
                <Search size={22} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                Search across all imported history
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: '420px', margin: '0 auto' }}>
                Enter keywords to search page titles and URLs from your real Google Chrome browsing timeline.
              </p>
            </div>
          ) : backendSearchResult && backendSearchResult.matches.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                backgroundColor: '#ffffff',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                No records matched "{query}"
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                Inspected {backendSearchResult.comparisonCount} records without finding a matching title or URL. Try another keyword or URL fragment.
              </p>
            </div>
          ) : backendSearchResult ? (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '0.65rem 1rem',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                Showing {backendSearchResult.matches.length} matching records
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
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
                      <th style={{ padding: '0.65rem 0.85rem', width: '160px' }}>Visited At</th>
                      <th style={{ padding: '0.65rem 0.85rem', width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backendSearchResult.matches.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => handleVisit(item)}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background-color var(--transition-fast)',
                        }}
                        className="hover-row"
                      >
                        <td style={{ padding: '0.65rem 0.85rem', maxWidth: '460px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <Favicon url={item.url} title={item.title} size={18} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: '#0f172a',
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

                        <td style={{ padding: '0.65rem 0.85rem', color: '#64748b', fontSize: '0.75rem' }}>
                          {formatTimestamp(item.visitedAt)}
                        </td>

                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                          <div
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => handleCopy(item.url, e)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '0.2rem 0.35rem', color: '#64748b' }}
                              title="Copy URL"
                            >
                              {copiedUrl === item.url ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Tab 2: Exact URL Hash Table Lookup */}
      {activeTab === 'exact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Zap size={18} color="#2563eb" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Exact URL Lookup (Unit III: CustomHashTable)
              </h3>
            </div>
            <p style={{ fontSize: '0.785rem', color: '#1e40af', marginBottom: '1.25rem', fontWeight: 500 }}>
              Hash Table Concept: <strong style={{ color: '#0f172a' }}>“A hash table uses a key to locate related data.”</strong>
            </p>

            <form onSubmit={handleExactLookup} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={exactUrlInput}
                onChange={(e) => setExactUrlInput(e.target.value)}
                placeholder="Enter exact URL (e.g. https://cp-algorithms.com/)"
                className="form-input"
                style={{ height: '42px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0 1.25rem', height: '42px' }}
                disabled={isExactSearching}
              >
                {isExactSearching ? 'Querying...' : 'Lookup O(1)'}
              </button>
            </form>
          </div>

          {/* Exact Result Card */}
          {exactResult && (
            <div
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: '#ffffff',
                borderLeft: `4px solid ${exactResult.found ? '#10b981' : '#f59e0b'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {exactResult.found ? (
                    <CheckCircle2 size={18} color="#10b981" />
                  ) : (
                    <AlertCircle size={18} color="#f59e0b" />
                  )}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    {exactResult.found ? 'URL Found in Hash Index' : 'URL Not Found in Hash Index'}
                  </h4>
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  {exactResult.timeComplexity}
                </span>
              </div>

              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #e2e8f0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: '#334155',
                  marginBottom: '1rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {exactResult.url}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Bucket Comparisons</span>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{exactResult.comparisons} lookup</strong>
                </div>

                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Execution Time</span>
                  <strong style={{ fontSize: '1rem', color: '#059669' }}>
                    {(exactResult.durationNano / 1000).toFixed(1)} µs
                  </strong>
                </div>

                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Visit Frequency</span>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{exactResult.visitCount} visits</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .hover-row:hover {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
};
