import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useResearch } from '../../context/ResearchContext';

interface HeaderProps {
  onMenuClick: () => void;
  onOpenAddModal: () => void;
}

export const Header = ({ onMenuClick, onOpenAddModal }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    globalSearchQuery,
    setGlobalSearchQuery,
    triggerChromeSync,
    isSyncing,
    isExtensionDetected,
    isBackendConnected,
    history,
  } = useResearch();

  const [localSearch, setLocalSearch] = useState(globalSearchQuery);

  const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
    switch (pathname) {
      case '/':
        return {
          title: 'Dashboard',
          subtitle: 'Overview of imported Chrome browsing history and research resources',
        };
      case '/history':
        return {
          title: 'Browsing History',
          subtitle: 'Real Chrome history timeline, filters, source labels & stack navigation',
        };
      case '/search':
        return {
          title: 'Smart Search',
          subtitle: 'Search real imported browsing records by title, URL, and category',
        };
      case '/library':
        return {
          title: 'Research Library',
          subtitle: 'Curated bookmarks and saved web research resources',
        };
      case '/analytics':
        return {
          title: 'DSA Analytics',
          subtitle: 'Live hardware benchmarks on custom SequentialSearch, HashTable & MergeSort',
        };
      default:
        return {
          title: 'BrowseBack',
          subtitle: 'Smart Web Research Manager',
        };
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setGlobalSearchQuery(localSearch.trim());
      navigate(`/search?q=${encodeURIComponent(localSearch.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleQuickSync = () => {
    triggerChromeSync();
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
      }}
      className="app-header"
    >
      {/* Left: Mobile hamburger + Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
        <button
          onClick={onMenuClick}
          className="header-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0f172a',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </h1>
          <p
            className="header-subtitle"
            style={{
              fontSize: '0.775rem',
              color: '#64748b',
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Global Search & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            position: 'relative',
            width: '260px',
          }}
          className="global-search-container"
        >
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
            placeholder="Search records, URLs..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 2rem 0.45rem 2.2rem',
              fontSize: '0.8125rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-full)',
              color: '#0f172a',
              outline: 'none',
              transition: 'all var(--transition-fast)',
            }}
            className="global-search-input"
          />
        </form>

        {/* Sync Chrome History Button */}
        <button
          onClick={handleQuickSync}
          disabled={isSyncing}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderColor: '#cbd5e1',
            color: '#1e293b',
          }}
          title={
            isExtensionDetected
              ? 'Synchronize history from Chrome extension'
              : 'Chrome Extension Standby'
          }
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} color="#2563eb" />
          <span className="sync-btn-label">{isSyncing ? 'Syncing...' : 'Sync Chrome'}</span>
        </button>

        {/* Add Resource Button */}
        <button
          onClick={onOpenAddModal}
          className="btn btn-primary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
          }}
        >
          <Plus size={15} />
          <span>Add Resource</span>
        </button>

        {/* Live Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isBackendConnected ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${isBackendConnected ? '#a7f3d0' : '#fecaca'}`,
            fontSize: '0.725rem',
            fontWeight: 600,
            color: isBackendConnected ? '#065f46' : '#991b1b',
          }}
          title={`Backend: ${isBackendConnected ? 'Connected' : 'Offline'} • History: ${history.length} records`}
          className="header-status-pill"
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isBackendConnected ? '#10b981' : '#ef4444',
            }}
          />
          <span>{isBackendConnected ? `${history.length} Records` : 'Offline'}</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .header-menu-btn {
            display: flex !important;
          }
          .app-header {
            padding: 0 1.25rem !important;
          }
        }
        @media (max-width: 768px) {
          .global-search-container {
            display: none !important;
          }
          .header-subtitle {
            display: none !important;
          }
          .sync-btn-label {
            display: none !important;
          }
          .header-status-pill {
            display: none !important;
          }
        }
        .global-search-input:focus {
          background-color: #ffffff !important;
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16) !important;
        }
      `}</style>
    </header>
  );
};
