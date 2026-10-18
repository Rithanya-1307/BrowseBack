import { useState, useMemo } from 'react';
import { Globe } from 'lucide-react';

interface FaviconProps {
  url: string;
  title?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const PASTEL_PALETTES = [
  { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' }, // Blue
  { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }, // Green
  { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff' }, // Purple
  { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' }, // Orange
  { bg: '#f0fdfa', text: '#0d9488', border: '#99f6e4' }, // Teal
  { bg: '#fdf2f8', text: '#db2777', border: '#fbcfe8' }, // Pink
  { bg: '#f8fafc', text: '#475569', border: '#cbd5e1' }, // Slate
];

export const Favicon = ({
  url,
  title,
  size = 20,
  className = '',
  style = {},
}: FaviconProps) => {
  const [hasError, setHasError] = useState(false);

  const { domain, initial, palette } = useMemo(() => {
    let host = '';
    try {
      if (url && url.trim()) {
        const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
        host = parsed.hostname.replace(/^www\./, '');
      }
    } catch {
      host = url || '';
    }

    const fallbackChar = (title && title.trim() ? title[0] : (host ? host[0] : 'W')).toUpperCase();

    // Deterministic palette from domain string
    let hash = 0;
    for (let i = 0; i < host.length; i++) {
      hash = (hash << 5) - hash + host.charCodeAt(i);
      hash |= 0;
    }
    const colorIndex = Math.abs(hash) % PASTEL_PALETTES.length;

    return {
      domain: host,
      initial: fallbackChar,
      palette: PASTEL_PALETTES[colorIndex],
    };
  }, [url, title]);

  if (!domain || hasError) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: size <= 20 ? '4px' : '6px',
          backgroundColor: palette.bg,
          color: palette.text,
          border: `1px solid ${palette.border}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: `${Math.max(10, Math.floor(size * 0.5))}px`,
          userSelect: 'none',
          flexShrink: 0,
          ...style,
        }}
        title={domain || title}
      >
        {initial || <Globe size={Math.floor(size * 0.6)} />}
      </div>
    );
  }

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: size <= 20 ? '4px' : '6px',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        flexShrink: 0,
        ...style,
      }}
      className={className}
    >
      <img
        src={faviconUrl}
        alt=""
        onError={() => setHasError(true)}
        style={{
          width: `${Math.max(12, size - 4)}px`,
          height: `${Math.max(12, size - 4)}px`,
          objectFit: 'contain',
          display: 'block',
        }}
        loading="lazy"
      />
    </div>
  );
};
