import type { ResourceCategory } from '../../types';

interface BadgeProps {
  category?: ResourceCategory | string;
  tag?: string;
  count?: number;
  className?: string;
  onClick?: () => void;
}

export const Badge = ({
  category,
  tag,
  count,
  className = '',
  onClick
}: BadgeProps) => {
  if (tag) {
    return (
      <span
        onClick={onClick}
        className={`badge badge-tag ${onClick ? 'cursor-pointer' : ''} ${className}`}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        #{tag}
      </span>
    );
  }

  const getCategoryClass = (cat?: string) => {
    if (!cat) return 'badge-general';
    const normalized = cat.toLowerCase().replace(/[^a-z0-9]/g, '');
    switch (normalized) {
      case 'algorithms':
        return 'badge-algorithms';
      case 'datastructures':
        return 'badge-datastructures';
      case 'webdevelopment':
        return 'badge-webdevelopment';
      case 'systemdesign':
        return 'badge-systemdesign';
      case 'aimachinelearning':
        return 'badge-aimachinelearning';
      case 'academicpapers':
        return 'badge-academicpapers';
      case 'competitiveprogramming':
        return 'badge-competitiveprogramming';
      case 'toolsframeworks':
        return 'badge-toolsframeworks';
      case 'programming':
        return 'badge-programming';
      case 'researchpapers':
        return 'badge-researchpapers';
      case 'documentation':
        return 'badge-documentation';
      case 'tutorials':
        return 'badge-tutorials';
      case 'other':
        return 'badge-other';
      default:
        return 'badge-general';
    }
  };

  return (
    <span
      onClick={onClick}
      className={`badge ${getCategoryClass(category)} ${className}`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {category || 'General'}
      {typeof count === 'number' && (
        <span style={{ opacity: 0.8, fontSize: '0.9em', marginLeft: '2px' }}>
          ({count})
        </span>
      )}
    </span>
  );
};
