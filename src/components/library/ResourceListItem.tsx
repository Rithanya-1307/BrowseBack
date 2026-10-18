import type { Resource } from '../../types';
import { Badge } from '../common/Badge';
import { Favicon } from '../common/Favicon';
import {
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  Link2,
  Calendar
} from 'lucide-react';

interface ResourceListItemProps {
  resource: Resource;
  onOpen: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onTagClick?: (tag: string) => void;
}

export const ResourceListItem = ({
  resource,
  onOpen,
  onEdit,
  onDelete,
  onTagClick,
}: ResourceListItemProps) => {
  const getDomain = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  return (
    <div
      className="card resource-list-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        backgroundColor: '#ffffff',
        gap: '1rem',
        transition: 'all var(--transition-fast)',
      }}
    >
      {/* Left: Title, category, domain */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <Favicon url={resource.url} title={resource.title} size={18} />
          <Badge category={resource.category} />
          <h4
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={resource.title}
          >
            {resource.title}
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Link2 size={12} />
            <span>{getDomain(resource.url)}</span>
          </div>

          {resource.notes && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-subtle)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '320px',
              }}
              title={resource.notes}
            >
              • {resource.notes}
            </span>
          )}

          {resource.tags && resource.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              tag={tag}
              onClick={onTagClick ? () => onTagClick(tag) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Middle: Visit Count & Date */}
      <div
        className="list-item-meta"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.775rem',
            color: 'var(--text-subtle)',
            backgroundColor: 'var(--bg-surface-subtle)',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            fontWeight: 600,
          }}
        >
          <Eye size={13} color="#64748b" />
          <span>{resource.visitCount} visits</span>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-disabled)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <Calendar size={12} />
          {new Date(resource.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        <button
          onClick={() => onEdit(resource)}
          className="btn btn-ghost btn-sm"
          title="Edit Resource"
          style={{ padding: '0.35rem 0.5rem', color: 'var(--text-muted)' }}
        >
          <Edit3 size={15} />
        </button>

        <button
          onClick={() => onDelete(resource.id)}
          className="btn btn-ghost btn-sm"
          title="Delete Resource"
          style={{ padding: '0.35rem 0.5rem', color: 'var(--color-danger)' }}
        >
          <Trash2 size={15} />
        </button>

        <button
          onClick={() => onOpen(resource)}
          className="btn btn-primary btn-sm"
          title="Open Web Page & Record Visit"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
        >
          <span>Open</span>
          <ExternalLink size={13} />
        </button>
      </div>

      <style>{`
        .resource-list-item:hover {
          border-color: #cbd5e1 !important;
          box-shadow: var(--shadow-sm) !important;
          background-color: #fafbfc !important;
        }
        @media (max-width: 768px) {
          .list-item-meta {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
