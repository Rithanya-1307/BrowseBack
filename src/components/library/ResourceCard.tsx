import type { Resource } from '../../types';
import { Badge } from '../common/Badge';
import { Favicon } from '../common/Favicon';
import {
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  Link2
} from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onOpen: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onTagClick?: (tag: string) => void;
}

export const ResourceCard = ({
  resource,
  onOpen,
  onEdit,
  onDelete,
  onTagClick,
}: ResourceCardProps) => {
  // Format readable domain from URL
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
      className="card resource-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        backgroundColor: '#ffffff',
        height: '100%',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)',
      }}
    >
      <div>
        {/* Header: Category Badge + Visit Count */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
          }}
        >
          <Badge category={resource.category} />

          <div
            title="Total times opened & researched"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              color: 'var(--text-subtle)',
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)',
              fontWeight: 600,
            }}
          >
            <Eye size={13} color="#64748b" />
            <span>{resource.visitCount} visits</span>
          </div>
        </div>

        {/* Title and Favicon */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Favicon url={resource.url} title={resource.title} size={22} style={{ marginTop: '2px' }} />
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              lineHeight: 1.35,
              color: 'var(--text-main)',
              wordBreak: 'break-word',
              flex: 1,
            }}
          >
            {resource.title}
          </h3>
        </div>

        {/* URL Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-mono)',
            marginBottom: '0.75rem',
          }}
        >
          <Link2 size={13} style={{ flexShrink: 0 }} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={resource.url}
          >
            {getDomain(resource.url)}
          </span>
        </div>

        {/* Notes preview */}
        {resource.notes ? (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              backgroundColor: '#fafbfc',
              padding: '0.5rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
            }}
          >
            {resource.notes}
          </p>
        ) : (
          <p
            style={{
              fontSize: '0.775rem',
              color: 'var(--text-disabled)',
              fontStyle: 'italic',
              marginBottom: '1rem',
            }}
          >
            No personal notes recorded yet.
          </p>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.35rem',
              marginBottom: '1rem',
            }}
          >
            {resource.tags.map((tag) => (
              <Badge
                key={tag}
                tag={tag}
                onClick={onTagClick ? () => onTagClick(tag) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer: Date and Action Buttons */}
      <div
        style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '0.85rem',
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '0.725rem',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
      </div>

      <style>{`
        .resource-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md) !important;
          border-color: #cbd5e1 !important;
        }
      `}</style>
    </div>
  );
};
