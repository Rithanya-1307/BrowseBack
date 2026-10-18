import { useState, useMemo } from 'react';
import {
  LayoutGrid,
  List,
  Search,
  Plus,
  ArrowUpDown,
  X,
  Inbox
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { ResourceCard } from '../components/library/ResourceCard';
import { ResourceListItem } from '../components/library/ResourceListItem';
import { ResourceModal } from '../components/library/ResourceModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CATEGORIES_LIST } from '../data/initialData';
import type { Resource, ViewMode, ResourceCategory } from '../types';

export const LibraryPage = () => {
  const { resources, addResource, updateResource, deleteResource, openResource } = useResearch();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'most-visited' | 'newest' | 'title-asc' | 'recently-visited'>('most-visited');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filtered and sorted resources
  const filteredResources = useMemo(() => {
    return resources
      .filter((res: Resource) => {
        // Search query filter (title, url, notes, or tags)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = res.title.toLowerCase().includes(q);
          const matchesUrl = res.url.toLowerCase().includes(q);
          const matchesNotes = res.notes.toLowerCase().includes(q);
          const matchesTags = res.tags.some((t: string) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesUrl && !matchesNotes && !matchesTags) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && res.category !== selectedCategory) {
          return false;
        }

        // Tag filter
        if (selectedTag && !res.tags.includes(selectedTag)) {
          return false;
        }

        return true;
      })
      .sort((a: Resource, b: Resource) => {
        if (sortBy === 'most-visited') {
          return (b.visitCount || 0) - (a.visitCount || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'recently-visited') {
          const timeA = a.lastVisitedAt ? new Date(a.lastVisitedAt).getTime() : 0;
          const timeB = b.lastVisitedAt ? new Date(b.lastVisitedAt).getTime() : 0;
          return timeB - timeA;
        }
        if (sortBy === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [resources, searchQuery, selectedCategory, selectedTag, sortBy]);

  const handleOpenAdd = () => {
    setResourceToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setResourceToEdit(res);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (data: {
    title: string;
    url: string;
    category: ResourceCategory;
    tags: string[];
    notes: string;
  }) => {
    if (resourceToEdit) {
      updateResource(resourceToEdit.id, data);
    } else {
      addResource(data);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteResource(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Control bar: Search, Categories, Sort, Views, Add Button */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Top row: Search input, Sort By, View Toggle, Add Resource button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Search box inside Library */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '450px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-disabled)',
              }}
            />
            <input
              type="text"
              placeholder="Filter by title, URL keywords, notes, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.4rem', height: '40px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-disabled)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Right Action Controls: Sort, View Toggle, Add Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowUpDown size={15} color="#64748b" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="form-select"
                style={{
                  width: 'auto',
                  height: '40px',
                  paddingRight: '2rem',
                  fontSize: '0.8125rem',
                }}
              >
                <option value="most-visited">Most Visited</option>
                <option value="recently-visited">Recently Accessed</option>
                <option value="newest">Recently Added</option>
                <option value="title-asc">Title (A-Z)</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--bg-surface-subtle)',
                padding: '3px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-secondary' : 'btn-ghost'}`}
                style={{
                  padding: '0.35rem 0.65rem',
                  backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none',
                  color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--text-subtle)',
                }}
                title="Grid View"
                aria-label="Switch to grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-secondary' : 'btn-ghost'}`}
                style={{
                  padding: '0.35rem 0.65rem',
                  backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                  boxShadow: viewMode === 'list' ? 'var(--shadow-xs)' : 'none',
                  color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--text-subtle)',
                }}
                title="List View"
                aria-label="Switch to list view"
              >
                <List size={16} />
              </button>
            </div>

            {/* Add Resource Button */}
            <button onClick={handleOpenAdd} className="btn btn-primary" style={{ height: '40px' }}>
              <Plus size={16} />
              <span>Add Resource</span>
            </button>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginRight: '0.25rem',
              flexShrink: 0,
            }}
          >
            Category:
          </span>

          {CATEGORIES_LIST.map((cat: string) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                type="button"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 600 : 500,
                  borderRadius: 'var(--radius-full)',
                  border: isSelected
                    ? '1px solid var(--color-primary)'
                    : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--color-primary-light)' : '#ffffff',
                  color: isSelected ? 'var(--color-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Active Tag Filter Indicator (if clicked on a tag) */}
        {selectedTag && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.75rem',
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-primary-subtle)',
              width: 'fit-content',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              Filtering by tag: #{selectedTag}
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Clear tag filter"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Results Count & Summary Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 0.5rem',
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
          Showing <strong>{filteredResources.length}</strong> of{' '}
          <strong>{resources.length}</strong> resources
          {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
          {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
        </div>

        {(searchQuery || selectedCategory !== 'All' || selectedTag) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedTag(null);
            }}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.775rem', color: 'var(--color-primary)' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Resources Render Section */}
      {filteredResources.length === 0 ? (
        /* Friendly Empty State */
        <div
          className="card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderStyle: 'dashed',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              marginBottom: '1.25rem',
            }}
          >
            <Inbox size={32} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {resources.length === 0 ? 'Your Research Library is Empty' : 'No Matching Resources Found'}
          </h3>

          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              maxWidth: '440px',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}
          >
            {resources.length === 0
              ? 'Start building your personalized collection of research papers, DSA notes, visualization tools, and technical documentation.'
              : 'Try relaxing your search terms or clearing the selected category filters to view more resources.'}
          </p>

          {resources.length === 0 ? (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} />
              <span>Add Your First Resource</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedTag(null);
              }}
              className="btn btn-secondary"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredResources.map((resource: Resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onOpen={openResource}
              onEdit={handleOpenEdit}
              onDelete={(id: string) => setDeleteId(id)}
              onTagClick={(tag: string) => setSelectedTag(tag)}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredResources.map((resource: Resource) => (
            <ResourceListItem
              key={resource.id}
              resource={resource}
              onOpen={openResource}
              onEdit={handleOpenEdit}
              onDelete={(id: string) => setDeleteId(id)}
              onTagClick={(tag: string) => setSelectedTag(tag)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={resourceToEdit}
        existingUrls={resources.map((r) => r.url)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Resource?"
        message="Are you sure you want to delete this resource from your research library? Saved visit counts will also be removed."
        confirmLabel="Delete Resource"
        confirmVariant="danger"
      />
    </div>
  );
};
