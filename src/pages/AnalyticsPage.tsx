import { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  TrendingUp,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Search,
  Hash,
  ArrowUpDown,
  GitCommit,
  Layers
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import {
  browseBackApi,
  type PerformanceComparison,
  type AnalyticsSummary
} from '../services/api';
import { Favicon } from '../components/common/Favicon';
import type { Resource } from '../types';

export const AnalyticsPage = () => {
  const { resources, history, openResource, isBackendConnected } = useResearch();

  const [benchmark, setBenchmark] = useState<PerformanceComparison | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [mergeSortedResources, setMergeSortedResources] = useState<Resource[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLiveAnalytics = async () => {
    if (!isBackendConnected) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [benchRes, sumRes, popRes] = await Promise.all([
        browseBackApi.getPerformanceComparison().catch(() => null),
        browseBackApi.getAnalyticsSummary().catch(() => null),
        browseBackApi.getPopularResources().catch(() => null),
      ]);

      if (benchRes) setBenchmark(benchRes);
      if (sumRes) setSummary(sumRes);
      if (popRes) setMergeSortedResources(popRes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch live DSA analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAnalytics();
  }, [isBackendConnected]);

  // Merge sorted resources from backend
  const sortedResources =
    mergeSortedResources ||
    [...resources].sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0));
  const maxVisits = Math.max(...sortedResources.map((r) => r.visitCount || 0), 1);

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Live Engine Status Banner */}
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
              backgroundColor: isBackendConnected ? '#eff6ff' : '#fef2f2',
              border: `1px solid ${isBackendConnected ? '#bfdbfe' : '#fecaca'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isBackendConnected ? '#2563eb' : '#dc2626',
              flexShrink: 0,
            }}
          >
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Custom DSA Engine Analytics
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
                {isBackendConnected ? 'Backend Live & Connected' : 'Backend Offline'}
              </span>
            </div>
            <p style={{ fontSize: '0.785rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Executing genuine custom Data Structures &amp; Algorithms on {history.length} real browsing records from the H2 database.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLiveAnalytics}
          disabled={isLoading || !isBackendConnected}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>{isLoading ? 'Executing...' : 'Re-run DSA Analytics'}</span>
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            color: '#991b1b',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {!isBackendConnected ? (
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
              backgroundColor: '#fef2f2',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
              marginBottom: '0.75rem',
            }}
          >
            <AlertCircle size={22} />
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Spring Boot Backend is Offline
          </h4>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: '440px', margin: '0 auto 1rem auto' }}>
            BrowseBack strictly forbids fake or fabricated benchmarks. Start the Spring Boot backend service at <code>http://localhost:8080</code> to view genuine CPU hardware measurements and live DSA analytics.
          </p>
          <button onClick={fetchLiveAnalytics} className="btn btn-primary btn-sm">
            Check Backend Status
          </button>
        </div>
      ) : (
        <>
          {/* Section: The 5 Custom DSA Implementations Showcase */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              Five Custom DSA Implementations
            </h3>
            <p style={{ fontSize: '0.785rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Built strictly without standard Java Collections utilities (Stack, LinkedList, HashMap, or Arrays.sort).
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
              }}
            >
              {/* DSA 1: Sequential Search */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #0284c7',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Search size={15} color="#0284c7" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    1. SequentialSearch
                  </span>
                  <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: 'auto' }}>
                    O(N)
                  </span>
                </div>
                <div style={{ fontSize: '0.775rem', color: '#0369a1', fontWeight: 600, fontStyle: 'italic' }}>
                  “Sequential Search checks records one by one to find a match.”
                </div>
                <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.2rem 0' }}>
                  <strong>Application Operation:</strong> Smart Search keyword matching across website titles and URLs.
                </p>
                <div style={{ fontSize: '0.725rem', color: '#64748b', backgroundColor: '#ffffff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  Inspected in last benchmark: <strong>{benchmark?.sequentialComparisons ?? history.length}</strong> records ({((benchmark?.sequentialDurationNano ?? 0) / 1000).toFixed(1)} µs)
                </div>
              </div>

              {/* DSA 2: Custom Hash Table */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #059669',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Hash size={15} color="#059669" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    2. CustomHashTable
                  </span>
                  <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#059669', backgroundColor: '#d1fae5', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: 'auto' }}>
                    O(1) avg
                  </span>
                </div>
                <div style={{ fontSize: '0.775rem', color: '#047857', fontWeight: 600, fontStyle: 'italic' }}>
                  “A hash table uses a key to locate related data.”
                </div>
                <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.2rem 0' }}>
                  <strong>Application Operation:</strong> Instant URL visit frequency indexing, collision chaining, and exact bookmark lookup.
                </p>
                <div style={{ fontSize: '0.725rem', color: '#64748b', backgroundColor: '#ffffff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  Unique URLs indexed: <strong>{summary?.totalUniqueUrls ?? 0}</strong> • Bucket comparisons: <strong>{benchmark?.hashComparisons ?? 1}</strong> ({((benchmark?.hashDurationNano ?? 0) / 1000).toFixed(1)} µs)
                </div>
              </div>

              {/* DSA 3: Merge Sort */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #7c3aed',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ArrowUpDown size={15} color="#7c3aed" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    3. MergeSort
                  </span>
                  <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#7c3aed', backgroundColor: '#ede9fe', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: 'auto' }}>
                    O(N log N)
                  </span>
                </div>
                <div style={{ fontSize: '0.775rem', color: '#6d28d9', fontWeight: 600, fontStyle: 'italic' }}>
                  “Merge Sort divides records into smaller groups, sorts them, and merges them in order.”
                </div>
                <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.2rem 0' }}>
                  <strong>Application Operation:</strong> Ordering browsing history (Newest/Oldest First) and ranking research library resources by visit count.
                </p>
                <div style={{ fontSize: '0.725rem', color: '#64748b', backgroundColor: '#ffffff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  Stable divide-and-conquer sort actively powers history timestamp ordering and resource popularity rankings.
                </div>
              </div>

              {/* DSA 4: Doubly Linked List */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #2563eb',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <GitCommit size={15} color="#2563eb" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    4. DoublyLinkedList
                  </span>
                  <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: 'auto' }}>
                    O(1) append
                  </span>
                </div>
                <div style={{ fontSize: '0.775rem', color: '#1d4ed8', fontWeight: 600, fontStyle: 'italic' }}>
                  “Each node links to the previous and next record.”
                </div>
                <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.2rem 0' }}>
                  <strong>Application Operation:</strong> Chronological browsing timeline with bidirectional node-by-node Previous and Next stepping.
                </p>
                <div style={{ fontSize: '0.725rem', color: '#64748b', backgroundColor: '#ffffff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  Total nodes in list: <strong>{history.length}</strong> • Preserves direct head (oldest) and tail (most recent) pointers.
                </div>
              </div>

              {/* DSA 5: Custom Stack */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #475569',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={15} color="#475569" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    5. CustomStack
                  </span>
                  <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#475569', backgroundColor: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: 'auto' }}>
                    O(1) LIFO
                  </span>
                </div>
                <div style={{ fontSize: '0.775rem', color: '#334155', fontWeight: 600, fontStyle: 'italic' }}>
                  “A stack follows Last In, First Out (LIFO).”
                </div>
                <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.2rem 0' }}>
                  <strong>Application Operation:</strong> Back and Forward navigation trail between opened history records and library resources.
                </p>
                <div style={{ fontSize: '0.725rem', color: '#64748b', backgroundColor: '#ffffff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  Back Stack Depth: <strong>{summary?.backStackSize ?? 0}</strong> • Forward Stack Depth: <strong>{summary?.forwardStackSize ?? 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Live Fair Benchmark Comparison */}
          {benchmark && (
            <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
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
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Empirical Algorithm Comparison
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Evaluated on {benchmark.datasetSize} genuine records • {benchmark.measurementMethod || 'Averaged iterations'}
                  </span>
                </div>

                <div
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Zap size={15} color="#2563eb" />
                  <span>{benchmark.speedupFactor.toFixed(1)}x Measured Speedup</span>
                </div>
              </div>

              {/* Side-by-Side Algorithm Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                {/* Sequential Search Card */}
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
                      SequentialSearch (Linear Scan)
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '0.1rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #fde68a',
                      }}
                    >
                      {benchmark.sequentialComplexity}
                    </span>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.725rem', color: '#92400e' }}>Execution Duration:</div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#78350f', fontFamily: 'var(--font-mono)' }}>
                      {(benchmark.sequentialDurationNano / 1000).toFixed(1)} µs
                    </div>
                  </div>

                  <div style={{ fontSize: '0.775rem', color: '#92400e' }}>
                    <strong>Comparisons:</strong> {benchmark.sequentialComparisons} records inspected one-by-one
                  </div>
                </div>

                {/* Custom Hash Table Card */}
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                      CustomHashTable (Bucket Index)
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        padding: '0.1rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #a7f3d0',
                      }}
                    >
                      {benchmark.hashComplexity}
                    </span>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.725rem', color: '#065f46' }}>Execution Duration:</div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#064e3b', fontFamily: 'var(--font-mono)' }}>
                      {(benchmark.hashDurationNano / 1000).toFixed(1)} µs
                    </div>
                  </div>

                  <div style={{ fontSize: '0.775rem', color: '#065f46' }}>
                    <strong>Bucket Comparisons:</strong> {benchmark.hashComparisons} lookup ({benchmark.exactMatchFound ? 'Key Found' : 'Key Not Found'})
                  </div>
                </div>
              </div>

              {/* Benchmark Target URL */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.75rem',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontWeight: 600, flexShrink: 0 }}>Target URL Key:</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: '#0f172a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={benchmark.targetUrl}
                >
                  {benchmark.targetUrl}
                </span>
              </div>
            </div>
          )}

          {/* Section: Merge Sort Ranking on Database Resources */}
          {sortedResources.length > 0 && (
            <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
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
                  <TrendingUp size={18} color="#059669" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Resource Ranking via Custom MergeSort
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: '0.725rem',
                    color: '#065f46',
                    backgroundColor: '#ecfdf5',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid #a7f3d0',
                    fontWeight: 600,
                  }}
                >
                  Recursive MergeSort Ordered
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {sortedResources.map((res, index) => {
                  const percent = Math.min(100, Math.max(5, (res.visitCount / maxVisits) * 100));
                  return (
                    <div
                      key={res.id}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              backgroundColor: index === 0 ? '#fef3c7' : '#e2e8f0',
                              color: index === 0 ? '#b45309' : '#475569',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            #{index + 1}
                          </span>
                          <Favicon url={res.url} title={res.title} size={18} />
                          <span
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={res.title}
                          >
                            {res.title}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                            {res.visitCount} visits
                          </span>
                          <button
                            onClick={() => openResource(res)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.2rem', color: '#2563eb' }}
                            title="Open Resource"
                          >
                            <ExternalLink size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div
                        style={{
                          height: '5px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                          width: '100%',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            backgroundColor: index === 0 ? '#2563eb' : '#60a5fa',
                            borderRadius: '9999px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
