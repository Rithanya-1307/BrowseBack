import { useState, type FormEvent } from 'react';
import type { Resource, ResourceCategory } from '../../types';
import { CATEGORIES_LIST } from '../../data/initialData';
import { Modal } from '../common/Modal';
import { Sparkles, Globe, Tag } from 'lucide-react';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resourceData: {
    title: string;
    url: string;
    category: ResourceCategory;
    tags: string[];
    notes: string;
  }) => void;
  initialData?: Resource | null;
  existingUrls?: string[];
}

export const ResourceModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  existingUrls = [],
}: ResourceModalProps) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Algorithms');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{
    title?: string;
    url?: string;
  }>({});

  const [prevTrigger, setPrevTrigger] = useState<{ isOpen: boolean; data?: Resource | null }>({
    isOpen,
    data: initialData,
  });

  if (prevTrigger.isOpen !== isOpen || prevTrigger.data !== initialData) {
    setPrevTrigger({ isOpen, data: initialData });
    if (initialData) {
      setTitle(initialData.title);
      setUrl(initialData.url);
      setCategory(initialData.category);
      setTagsInput(initialData.tags.join(', '));
      setNotes(initialData.notes);
    } else {
      setTitle('');
      setUrl('');
      setCategory('Algorithms');
      setTagsInput('');
      setNotes('');
    }
    setErrors({});
  }

  const validate = (): boolean => {
    const newErrors: { title?: string; url?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        const parsed = new URL(url.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          newErrors.url = 'URL must start with http:// or https://';
        } else {
          const normalized = url.trim().toLowerCase();
          const isDuplicate = existingUrls.some((u) => u.trim().toLowerCase() === normalized);
          if (isDuplicate) {
            if (!initialData || initialData.url.trim().toLowerCase() !== normalized) {
              newErrors.url = 'This URL is already saved in your Research Library (duplicate URL detected).';
            }
          }
        }
      } catch {
        newErrors.url = 'Please enter a valid URL (e.g. https://example.com)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    onSubmit({
      title: title.trim(),
      url: url.trim(),
      category,
      tags: parsedTags,
      notes: notes.trim(),
    });

    onClose();
  };

  // Quick helper to auto-fill CS topics for rapid evaluation
  const handleQuickFill = (preset: 'dsa' | 'paper' | 'system') => {
    if (preset === 'dsa') {
      setTitle('B-Trees and B+ Trees: Self-Balancing Disk Indices');
      setUrl('https://www.geeksforgeeks.org/introduction-of-b-tree-2/');
      setCategory('Data Structures');
      setTagsInput('btree, database-index, balanced-trees, external-storage');
      setNotes('Disk-optimized tree structure allowing logarithmic lookups with high branching factor.');
    } else if (preset === 'paper') {
      setTitle('The Google File System (GFS) Architectural Paper');
      setUrl('https://research.google/pubs/pub51/');
      setCategory('Academic Papers');
      setTagsInput('gfs, distributed-systems, master-chunkserver, replication');
      setNotes('Seminal work on large distributed storage and fault tolerance for big data.');
    } else {
      setTitle('Designing a Rate Limiter with Sliding Window & Token Bucket');
      setUrl('https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter');
      setCategory('System Design');
      setTagsInput('rate-limiting, token-bucket, redis, distributed-systems');
      setNotes('Algorithmic analysis of Leaky Bucket vs. Sliding Window Log vs. Sliding Window Counter.');
    }
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Resource' : 'Add New Research Resource'}
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Quick preset chips for rapid testing */}
          {!initialData && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-primary-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.775rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={14} />
                <span>Quick demo presets:</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => handleQuickFill('dsa')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
                >
                  + B-Tree
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('paper')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
                >
                  + GFS Paper
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('system')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
                >
                  + Rate Limiter
                </button>
              </div>
            </div>
          )}

          {/* Title Field */}
          <div className="input-group">
            <label className="input-label" htmlFor="res-title">
              <span>
                Resource Title <span className="input-required">*</span>
              </span>
            </label>
            <input
              id="res-title"
              type="text"
              placeholder="e.g., MIT 6.006 Lecture Notes or LeetCode Dynamic Programming"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className={`form-input ${errors.title ? 'error' : ''}`}
              autoFocus
            />
            {errors.title && <div className="input-error-msg">{errors.title}</div>}
          </div>

          {/* URL Field */}
          <div className="input-group">
            <label className="input-label" htmlFor="res-url">
              <span>
                Website URL <span className="input-required">*</span>
              </span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', fontWeight: 400 }}>
                Includes http:// or https://
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="res-url"
                type="text"
                placeholder="https://example.com/algorithms/notes"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }));
                }}
                className={`form-input ${errors.url ? 'error' : ''}`}
                style={{ paddingLeft: '2.2rem' }}
              />
              <Globe
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-disabled)',
                  pointerEvents: 'none',
                }}
              />
            </div>
            {errors.url && <div className="input-error-msg">{errors.url}</div>}
          </div>

          {/* Category & Tags Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            {/* Category */}
            <div className="input-group">
              <label className="input-label" htmlFor="res-category">
                <span>Category</span>
              </label>
              <select
                id="res-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="form-select"
              >
                {CATEGORIES_LIST.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="input-group">
              <label className="input-label" htmlFor="res-tags">
                <span>Tags</span>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', fontWeight: 400 }}>
                  Comma-separated
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="res-tags"
                  type="text"
                  placeholder="graphs, dp, mit"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.2rem' }}
                />
                <Tag
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-disabled)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Notes Field */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="res-notes">
              <span>Research Notes / Summary</span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', fontWeight: 400 }}>
                Optional
              </span>
            </label>
            <textarea
              id="res-notes"
              placeholder="Key concepts, algorithms used, exam notes, or reading summary..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea"
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            {initialData ? 'Update Resource' : 'Save to Library'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
