export type ResourceCategory = 
  | 'AI & Machine Learning'
  | 'Data Structures'
  | 'Programming'
  | 'Research Papers'
  | 'Documentation'
  | 'Tutorials'
  | 'Algorithms'
  | 'System Design'
  | 'Web Development'
  | 'Academic Papers'
  | 'Competitive Programming'
  | 'Tools & Frameworks'
  | 'Other'
  | 'General';

export interface Resource {
  id: string;
  title: string;
  url: string;
  category: ResourceCategory;
  tags: string[];
  notes: string;
  visitCount: number;
  createdAt: string;
  lastVisitedAt?: string;
  isPinned?: boolean;

  
}

export interface HistoryRecord {
  id: string;
  resourceId?: string;
  title: string;
  url: string;
  category: ResourceCategory;
  visitedAt: string;
  durationSeconds?: number;
  source: 'direct' | 'library' | 'search' | 'external' | 'chrome' | string;
}

export interface ChromeSyncSummary {
  totalHistoryRecords: number;
  chromeHistoryRecords: number;
  browseBackRecords: number;
  lastImportedTimestamp: string | null;
  extensionReady: boolean;
}

export interface HistoryBatchImportItem {
  url: string;
  title?: string;
  category?: string;
  timestamp?: string;
  visitCount?: number;
  durationSeconds?: number;
  source?: string;
}

export interface HistoryBatchImportResponse {
  totalReceived: number;
  importedCount: number;
  duplicateCount: number;
  totalHistoryRecords: number;
  message: string;
  sampleImported?: HistoryRecord[];
}


export interface DSABenchmarkMetric {
  datasetSize: number;
  operation: 'Exact URL Lookup' | 'Prefix Keyword Match' | 'Tag Query';
  targetKey: string;
  // Sequential search stats
  sequentialTimeMs: number;
  sequentialComparisons: number;
  sequentialComplexity: string;
  // Hash table stats
  hashLookupTimeMs: number;
  hashCollisions: number;
  hashComparisons: number;
  hashComplexity: string;
  speedupFactor: number;
  isDemoSample: true;
}

export type ViewMode = 'grid' | 'list';

export interface ResourceFilter {
  searchQuery: string;
  category: string;
  tag: string;
  sortBy: 'most-visited' | 'recently-visited' | 'title-asc' | 'newest';
}
