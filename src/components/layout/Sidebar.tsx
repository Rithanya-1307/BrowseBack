import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  Search,
  Library,
  BarChart3,
  X,
  Globe,
  Server,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { useResearch } from '../../context/ResearchContext';
import { Modal } from '../common/Modal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const {
    resources,
    history,
    isBackendConnected,
    isExtensionDetected,
    backendUrl,
    setBackendUrl,
  } = useResearch();

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [inputUrl, setInputUrl] = useState(backendUrl);
  const [urlSaved, setUrlSaved] = useState(false);

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/history',
      label: 'Browsing History',
      icon: History,
      badge: history.length > 0 ? history.length : null,
      badgeColor: '#0284c7',
    },
    {
      to: '/search',
      label: 'Smart Search',
      icon: Search,
      badge: null,
    },
    {
      to: '/library',
      label: 'Research Library',
      icon: Library,
      badge: resources.length > 0 ? resources.length : null,
      badgeColor: '#2563eb',
    },
    {
      to: '/analytics',
      label: 'DSA Analytics',
      icon: BarChart3,
      badge: 'DSA',
      badgeColor: '#7c3aed',
    },
  ];

  const handleCopyPath = () => {
    navigator.clipboard.writeText('e:\\BrowseBack\\browser-extension').then(() => {
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2500);
    }).catch(() => null);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendUrl(inputUrl);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2500);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 90,
          }}
          aria-hidden="true"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transition: 'transform var(--transition-normal)',
          transform: isOpen ? 'translateX(0)' : undefined,
        }}
        className={`sidebar ${isOpen ? 'open' : ''}`}
      >
        {/* Brand / Logo */}
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.25rem',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <NavLink
            to="/"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <Globe size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: 'var(--text-main)',
                  lineHeight: 1.2,
                }}
              >
                BrowseBack
              </div>
              <div
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  color: '#2563eb',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Web Research Manager
              </div>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              display: 'none',
            }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* 5 Core Navigation Items */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-disabled)',
              letterSpacing: '0.06em',
              padding: '0.25rem 0.75rem 0.4rem 0.75rem',
            }}
          >
            Core Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#1d4ed8' : '#334155',
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                  border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} style={{ color: 'inherit', strokeWidth: 2 }} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: item.badgeColor ? `${item.badgeColor}18` : '#f1f5f9',
                      color: item.badgeColor || '#475569',
                      border: `1px solid ${item.badgeColor ? `${item.badgeColor}33` : '#e2e8f0'}`,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Live Connectivity Footer & Setup Guide CTA */}
        <div
          style={{
            padding: '0.85rem 0.75rem',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: '#fafbfc',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {/* Status Indicators */}
          <div
            style={{
              padding: '0.65rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            {/* Backend status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                <Server size={13} />
                Spring Boot API
              </span>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  color: isBackendConnected ? '#059669' : '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isBackendConnected ? '#10b981' : '#ef4444',
                  }}
                />
                {isBackendConnected ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Extension status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                <Globe size={13} />
                Chrome Extension
              </span>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  color: isExtensionDetected ? '#2563eb' : '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isExtensionDetected ? '#2563eb' : '#f59e0b',
                  }}
                />
                {isExtensionDetected ? 'Connected' : 'Standby'}
              </span>
            </div>
          </div>

          {/* Setup / Instructions Button */}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="btn btn-ghost btn-sm"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-subtle)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
            }}
          >
            <HelpCircle size={14} />
            <span>Extension & Endpoint Guide</span>
          </button>
        </div>
      </aside>

      {/* Extension & Endpoint Setup Modal */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="BrowseBack Integration Setup"
        maxWidth="560px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem', color: '#0f172a' }}>
              Chrome Manifest V3 Extension
            </h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.8125rem' }}>
              To sync real browsing history, load the unpacked extension in Google Chrome:
            </p>
            <ol style={{ paddingLeft: '1.25rem', lineHeight: 1.6, color: 'var(--text-main)', fontSize: '0.8125rem' }}>
              <li>Open <code>chrome://extensions</code> in your Google Chrome browser.</li>
              <li>Toggle <strong>Developer mode</strong> in the top-right corner.</li>
              <li>Click <strong>Load unpacked</strong> and select the directory:</li>
            </ol>
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#f1f5f9',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.775rem',
              }}
            >
              <span>e:\BrowseBack\browser-extension</span>
              <button
                onClick={handleCopyPath}
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              >
                {copiedPath ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                <span>{copiedPath ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem', color: '#0f172a' }}>
              Spring Boot API Endpoint
            </h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
              BrowseBack connects to Spring Boot with H2 database persistence:
            </p>
            <form onSubmit={handleSaveUrl} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}
                placeholder="http://localhost:8080/api"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Save
              </button>
            </form>
            {urlSaved && (
              <span style={{ fontSize: '0.75rem', color: '#059669', display: 'block', marginTop: '0.35rem' }}>
                Endpoint saved.
              </span>
            )}
          </div>
        </div>
      </Modal>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
        .nav-link:hover:not(.active) {
          background-color: var(--bg-surface-subtle) !important;
          color: var(--text-main) !important;
        }
      `}</style>
    </>
  );
};
