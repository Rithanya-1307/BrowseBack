package com.browseback.service;

import com.browseback.dsa.CustomHashTable;
import com.browseback.dsa.CustomStack;
import com.browseback.dsa.DoublyLinkedList;
import com.browseback.dsa.MergeSort;
import com.browseback.dsa.SequentialSearch;
import com.browseback.dto.*;
import com.browseback.entity.HistoryRecordEntity;
import com.browseback.entity.ResourceEntity;
import com.browseback.model.HashEntry;
import com.browseback.model.HistoryRecord;
import com.browseback.model.Resource;
import com.browseback.model.ResourceStats;
import com.browseback.repository.HistoryRecordRepository;
import com.browseback.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Core Service Layer coordinating all DSA structures for BrowseBack:
 *
 * 1. Unit I: CustomStack
 *    - backStack: stores previous page states (LIFO)
 *    - forwardStack: stores forward page states (LIFO)
 * 2. Unit II: DoublyLinkedList & SequentialSearch
 *    - historyList: chronological web history maintaining head and tail
 *    - SequentialSearch: case-insensitive linear search across history
 * 3. Unit III: CustomHashTable & MergeSort
 *    - urlIndex: O(1) visit frequency tracking with separate chaining
 *    - MergeSort: stable O(N log N) frequency ranking
 *
 * Persistence Layer:
 * - Spring Data JPA with file-based H2 database preserves bookmarks and history across restarts.
 * - On startup, persistent records are rehydrated into the custom DSA structures.
 * - DSA algorithms operate strictly on custom structures, not SQL queries or standard collections.
 */
@Service
public class BrowseBackService {

    private final CustomStack<HistoryRecord> backStack;
    private final CustomStack<HistoryRecord> forwardStack;
    private final DoublyLinkedList historyList;
    private final CustomHashTable urlIndex;
    private final CustomHashTable bookmarkIndex;

    private final Map<String, Resource> resourceMap;
    private HistoryRecord currentPage;
    private final AtomicLong idSequence;
    private final AtomicLong resourceIdSequence;

    private final ResourceRepository resourceRepository;
    private final HistoryRecordRepository historyRecordRepository;

    /**
     * DTO containing comparative metrics between Sequential Search and Hash Lookup.
     */
    public static class SearchComparison {
        private final String targetUrl;
        private final int sequentialComparisons;
        private final long sequentialDurationNano;
        private final int sequentialMatchCount;
        private final int hashComparisons;
        private final long hashDurationNano;
        private final boolean hashFound;

        public SearchComparison(String targetUrl,
                                int sequentialComparisons,
                                long sequentialDurationNano,
                                int sequentialMatchCount,
                                int hashComparisons,
                                long hashDurationNano,
                                boolean hashFound) {
            this.targetUrl = targetUrl;
            this.sequentialComparisons = sequentialComparisons;
            this.sequentialDurationNano = sequentialDurationNano;
            this.sequentialMatchCount = sequentialMatchCount;
            this.hashComparisons = hashComparisons;
            this.hashDurationNano = hashDurationNano;
            this.hashFound = hashFound;
        }

        public String getTargetUrl() {
            return targetUrl;
        }

        public int getSequentialComparisons() {
            return sequentialComparisons;
        }

        public long getSequentialDurationNano() {
            return sequentialDurationNano;
        }

        public int getSequentialMatchCount() {
            return sequentialMatchCount;
        }

        public int getHashComparisons() {
            return hashComparisons;
        }

        public long getHashDurationNano() {
            return hashDurationNano;
        }

        public boolean isHashFound() {
            return hashFound;
        }

        @Override
        public String toString() {
            return String.format("DSA Search Comparison for '%s':%n" +
                            "  [Unit II] Sequential Search (O(N)): %d comparisons, %d ns, matches=%d%n" +
                            "  [Unit III] Hash Lookup (O(1) avg): %d comparisons, %d ns, found=%b",
                    targetUrl, sequentialComparisons, sequentialDurationNano, sequentialMatchCount,
                    hashComparisons, hashDurationNano, hashFound);
        }
    }

    /**
     * Default constructor for standalone non-Spring tests.
     */
    public BrowseBackService() {
        this(null, null);
    }

    /**
     * Constructor injection for Spring Boot with JPA repositories.
     */
    @Autowired
    public BrowseBackService(
            @Autowired(required = false) ResourceRepository resourceRepository,
            @Autowired(required = false) HistoryRecordRepository historyRecordRepository) {
        this.resourceRepository = resourceRepository;
        this.historyRecordRepository = historyRecordRepository;
        this.backStack = new CustomStack<>();
        this.forwardStack = new CustomStack<>();
        this.historyList = new DoublyLinkedList();
        this.urlIndex = new CustomHashTable();
        this.bookmarkIndex = new CustomHashTable();
        this.resourceMap = new ConcurrentHashMap<>();
        this.currentPage = null;
        this.idSequence = new AtomicLong(1);
        this.resourceIdSequence = new AtomicLong(1);
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        if (resourceRepository != null && historyRecordRepository != null) {
            long resCount = resourceRepository.count();
            long histCount = historyRecordRepository.count();

            if (resCount == 0 && histCount == 0) {
                // Initialize default sample dataset and persist to local database
                loadInitialSampleData();
                for (Resource r : resourceMap.values()) {
                    resourceRepository.save(ResourceEntity.fromDomain(r));
                }
                for (HistoryRecord h : historyList.traverseForward()) {
                    historyRecordRepository.save(HistoryRecordEntity.fromDomain(h));
                }
            } else {
                // Rebuild custom DSA indices from persistent records
                rehydrateFromDatabase();
            }
        } else {
            // Standalone mode without database (e.g., pure unit tests)
            if (resourceMap.isEmpty()) {
                loadInitialSampleData();
            }
        }
    }

    /**
     * Rebuilds the custom hash index and doubly linked list from persisted JPA entities.
     */
    public void rehydrateFromDatabase() {
        resourceMap.clear();
        bookmarkIndex.clear();
        urlIndex.clear();
        historyList.clear();
        backStack.clear();
        forwardStack.clear();
        currentPage = null;

        if (resourceRepository != null) {
            List<ResourceEntity> savedEntities = resourceRepository.findAll();
            for (ResourceEntity entity : savedEntities) {
                Resource domain = entity.toDomain();
                resourceMap.put(domain.getId(), domain);
                bookmarkIndex.recordVisit(domain.getUrl(), domain.getCreatedAt());

                if (!urlIndex.contains(domain.getUrl())) {
                    HashEntry entry = urlIndex.recordVisit(domain.getUrl(), domain.getCreatedAt());
                    if (entry != null) {
                        entry.setVisitCount(domain.getVisitCount());
                    }
                }
            }
        }

        if (historyRecordRepository != null) {
            List<HistoryRecordEntity> historyEntities = historyRecordRepository.findAllByOrderByTimestampAsc();
            for (HistoryRecordEntity entity : historyEntities) {
                HistoryRecord domain = entity.toDomain();
                historyList.addLast(domain);
                urlIndex.recordVisit(domain.getUrl(), domain.getTimestamp());
                currentPage = domain;
            }
        }

        // Synchronize visit counts for saved resources from the hash table
        for (Resource res : resourceMap.values()) {
            int actualVisits = urlIndex.getVisitCount(res.getUrl());
            if (actualVisits > res.getVisitCount()) {
                res.setVisitCount(actualVisits);
            }
        }
    }

    /**
     * Resets local development data to the default sample dataset.
     */
    public void resetDatabaseToSampleData() {
        if (historyRecordRepository != null) {
            historyRecordRepository.deleteAll();
        }
        if (resourceRepository != null) {
            resourceRepository.deleteAll();
        }

        resourceMap.clear();
        historyList.clear();
        backStack.clear();
        forwardStack.clear();
        urlIndex.clear();
        bookmarkIndex.clear();
        currentPage = null;
        idSequence.set(1);
        resourceIdSequence.set(1);

        loadInitialSampleData();

        if (resourceRepository != null) {
            for (Resource r : resourceMap.values()) {
                resourceRepository.save(ResourceEntity.fromDomain(r));
            }
        }
        if (historyRecordRepository != null) {
            for (HistoryRecord h : historyList.traverseForward()) {
                historyRecordRepository.save(HistoryRecordEntity.fromDomain(h));
            }
        }
    }

    /**
     * Preloads standard initial research resources and browsing history.
     */
    public void loadInitialSampleData() {
        createResourceWithDetails("res-1", "MIT 6.006: Introduction to Algorithms Lecture Notes",
                "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", "Algorithms",
                List.of("algorithms", "mit", "graphs", "dynamic-programming"),
                "Covers fundamental algorithms, asymptotic notation, shortest paths, and dynamic programming.",
                38, "2025-01-10T09:00:00Z", "2025-02-14T11:20:00Z", true);

        createResourceWithDetails("res-2", "Visualgo: Visualising Data Structures and Algorithms",
                "https://visualgo.net/en", "Data Structures",
                List.of("visualization", "trees", "heaps", "sorting", "bst", "avl"),
                "Interactive step-by-step animations for BST, AVL trees, Hash Tables with chaining, and Dijkstra.",
                45, "2025-01-12T14:30:00Z", "2025-02-14T10:05:00Z", true);

        createResourceWithDetails("res-3", "Stanford CS166: Advanced Data Structures Lecture Archive",
                "https://web.stanford.edu/class/cs166/", "Data Structures",
                List.of("advanced-dsa", "trie", "suffix-trees", "fibonacci-heaps", "rmq"),
                "In-depth coverage of Range Minimum Queries, Suffix Trees, and Trie optimizations.",
                22, "2025-01-15T11:00:00Z", "2025-02-13T16:45:00Z", false);

        createResourceWithDetails("res-4", "Designing Data-Intensive Applications — Chapter Summaries",
                "https://dataintensive.net/resources", "System Design",
                List.of("system-design", "lsm-trees", "b-trees", "replication"),
                "Crucial contrast between B-Trees and LSM-Trees for storage engines like RocksDB.",
                29, "2025-01-18T08:15:00Z", "2025-02-12T18:10:00Z", true);

        createResourceWithDetails("res-5", "CP-Algorithms: Algorithms for Competitive Programming",
                "https://cp-algorithms.com/", "Competitive Programming",
                List.of("segment-trees", "string-hashing", "kmp", "number-theory"),
                "Complete reference for polynomial rolling hash, KMP string matching, and segment trees.",
                34, "2025-01-20T19:00:00Z", "2025-02-14T08:50:00Z", false);

        recordVisit("hist-1", "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
                "MIT 6.006: Introduction to Algorithms Lecture Notes", "Algorithms", "2025-02-14T11:20:00Z",
                "res-1", 1420, "library");

        recordVisit("hist-2", "https://visualgo.net/en",
                "Visualgo: Visualising Data Structures and Algorithms", "Data Structures", "2025-02-14T10:05:00Z",
                "res-2", 980, "library");

        recordVisit("hist-3", "https://cp-algorithms.com/",
                "CP-Algorithms: Algorithms for Competitive Programming", "Competitive Programming", "2025-02-14T08:50:00Z",
                "res-5", 1650, "search");

        recordVisit("hist-4", "https://web.stanford.edu/class/cs166/",
                "Stanford CS166: Advanced Data Structures Lecture Archive", "Data Structures", "2025-02-13T16:45:00Z",
                "res-3", 840, "library");

        recordVisit("hist-5", "https://dataintensive.net/resources",
                "Designing Data-Intensive Applications — Chapter Summaries", "System Design", "2025-02-12T18:10:00Z",
                "res-4", 2100, "direct");
    }

    private void createResourceWithDetails(String id, String title, String url, String category,
                                          List<String> tags, String notes, int visitCount,
                                          String createdAt, String lastVisitedAt, boolean isPinned) {
        Resource resource = new Resource(id, title, url.trim(), category, tags, notes, visitCount,
                createdAt, lastVisitedAt, isPinned);
        resourceMap.put(id, resource);
        bookmarkIndex.recordVisit(resource.getUrl(), createdAt);

        HashEntry entry = urlIndex.search(resource.getUrl());
        if (entry == null) {
            entry = urlIndex.recordVisit(resource.getUrl(), createdAt);
            if (entry != null) {
                entry.setVisitCount(visitCount);
            }
        }
    }

    // =========================================================================
    // Resources CRUD Endpoints (Research Library)
    // =========================================================================

    public List<Resource> getAllResources() {
        List<Resource> list = new ArrayList<>(resourceMap.values());
        list.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return list;
    }

    public Resource getResourceById(String id) {
        if (id == null) return null;
        return resourceMap.get(id);
    }

    public Resource addResource(CreateResourceRequest req) {
        if (req == null || req.getUrl() == null || req.getUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("Resource URL cannot be empty.");
        }
        String normalizedUrl = req.getUrl().trim();

        // Prevent duplicate URLs across saved resources
        boolean isDuplicate = resourceMap.values().stream()
                .anyMatch(r -> r.getUrl().equalsIgnoreCase(normalizedUrl));
        if (!isDuplicate && resourceRepository != null) {
            isDuplicate = resourceRepository.existsByUrlIgnoreCase(normalizedUrl);
        }
        if (isDuplicate) {
            throw new IllegalArgumentException("A saved resource with this URL already exists: " + normalizedUrl);
        }

        String id = "res-" + System.currentTimeMillis() + "-" + resourceIdSequence.getAndIncrement();
        String now = Instant.now().toString();

        Resource resource = new Resource(
                id,
                req.getTitle() != null && !req.getTitle().trim().isEmpty() ? req.getTitle().trim() : "Untitled Resource",
                normalizedUrl,
                req.getCategory() != null && !req.getCategory().trim().isEmpty() ? req.getCategory().trim() : "General",
                req.getTags() != null ? req.getTags() : new ArrayList<>(),
                req.getNotes() != null ? req.getNotes() : "",
                0,
                now,
                null,
                Boolean.TRUE.equals(req.getIsPinned())
        );

        resourceMap.put(id, resource);
        bookmarkIndex.recordVisit(resource.getUrl(), now);

        if (!urlIndex.contains(resource.getUrl())) {
            HashEntry entry = urlIndex.recordVisit(resource.getUrl(), now);
            if (entry != null) {
                entry.setVisitCount(0);
            }
        }

        // Persist to database
        if (resourceRepository != null) {
            resourceRepository.save(ResourceEntity.fromDomain(resource));
        }

        return resource;
    }

    public Resource updateResource(String id, UpdateResourceRequest req) {
        Resource existing = resourceMap.get(id);
        if (existing == null) {
            return null;
        }

        String oldUrl = existing.getUrl();
        if (req.getTitle() != null) existing.setTitle(req.getTitle().trim());
        if (req.getCategory() != null) existing.setCategory(req.getCategory().trim());
        if (req.getTags() != null) existing.setTags(req.getTags());
        if (req.getNotes() != null) existing.setNotes(req.getNotes());
        if (req.getIsPinned() != null) existing.setPinned(req.getIsPinned());
        if (req.getVisitCount() != null) existing.setVisitCount(req.getVisitCount());

        if (req.getUrl() != null && !req.getUrl().trim().isEmpty() && !req.getUrl().trim().equalsIgnoreCase(oldUrl)) {
            String newUrl = req.getUrl().trim();

            // Duplicate URL check on update
            boolean isDuplicate = resourceMap.values().stream()
                    .anyMatch(r -> !r.getId().equals(id) && r.getUrl().equalsIgnoreCase(newUrl));
            if (!isDuplicate && resourceRepository != null) {
                isDuplicate = resourceRepository.existsByUrlIgnoreCaseAndIdNot(newUrl, id);
            }
            if (isDuplicate) {
                throw new IllegalArgumentException("A saved resource with this URL already exists: " + newUrl);
            }

            existing.setUrl(newUrl);

            // Update bookmarks index
            bookmarkIndex.remove(oldUrl);
            bookmarkIndex.recordVisit(newUrl, Instant.now().toString());

            // If oldUrl has no history visits, clean from urlIndex
            HashEntry oldEntry = urlIndex.search(oldUrl);
            if (oldEntry != null && oldEntry.getVisitCount() <= 0) {
                urlIndex.remove(oldUrl);
            }
            if (!urlIndex.contains(newUrl)) {
                urlIndex.recordVisit(newUrl, Instant.now().toString());
            }
        }

        // Persist update
        if (resourceRepository != null) {
            resourceRepository.save(ResourceEntity.fromDomain(existing));
        }

        return existing;
    }

    public boolean deleteResource(String id) {
        Resource removed = resourceMap.remove(id);
        if (removed == null) {
            return false;
        }

        // Remove from database repository
        if (resourceRepository != null) {
            resourceRepository.deleteById(id);
        }

        String url = removed.getUrl();
        bookmarkIndex.remove(url);

        // Check if any other resource still uses this URL
        boolean isStillBookmarked = resourceMap.values().stream()
                .anyMatch(r -> r.getUrl().equalsIgnoreCase(url));

        if (!isStillBookmarked) {
            HashEntry entry = urlIndex.search(url);
            if (entry != null && entry.getVisitCount() <= 0) {
                urlIndex.remove(url);
            }
        }

        // Note: Browsing history records remain completely untouched!
        return true;
    }

    // =========================================================================
    // Browsing History & Visits (Units I, II, III)
    // =========================================================================

    public List<HistoryRecord> getHistory() {
        return getSortedHistory("newest");
    }

    /**
     * Retrieves browsing history ordered using custom recursive Merge Sort.
     * Supports "newest" (descending timestamp) and "oldest" (ascending timestamp).
     *
     * @param sortOrder "newest" or "oldest"
     * @return sorted list of history records
     */
    public List<HistoryRecord> getSortedHistory(String sortOrder) {
        boolean newestFirst = !"oldest".equalsIgnoreCase(sortOrder);
        HistoryRecord[] all = historyList.traverseForward();
        HistoryRecord[] sorted = MergeSort.sortHistoryByTimestamp(all, newestFirst);
        return Arrays.asList(sorted);
    }

    /**
     * Inspects previous and next nodes in the custom DoublyLinkedList relative to the specified record.
     *
     * @param currentId current history record ID
     * @return node navigation state with predecessor and successor records
     */
    public HistoryNodeNavigationResponse getNodeNavigation(String currentId) {
        int total = historyList.size();
        if (total == 0) {
            return new HistoryNodeNavigationResponse(null, null, null, false, false, 0);
        }

        HistoryRecord current = null;
        if (currentId != null && !currentId.trim().isEmpty()) {
            current = historyList.findById(currentId.trim());
        }
        if (current == null) {
            // Default to newest record (tail of chronological list)
            current = historyList.getTail() != null ? historyList.getTail().getRecord() : null;
        }

        if (current == null) {
            return new HistoryNodeNavigationResponse(null, null, null, false, false, total);
        }

        HistoryRecord prev = historyList.getPreviousRecord(current.getId());
        HistoryRecord next = historyList.getNextRecord(current.getId());

        return new HistoryNodeNavigationResponse(
                current,
                prev,
                next,
                prev != null,
                next != null,
                total
        );
    }

    public HistoryRecord recordVisit(VisitRequest req) {
        if (req == null || req.getUrl() == null || req.getUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("URL cannot be null or empty.");
        }
        String id = "hist-" + System.currentTimeMillis() + "-" + idSequence.getAndIncrement();
        String now = Instant.now().toString();

        return recordVisit(id, req.getUrl().trim(),
                req.getTitle() != null && !req.getTitle().trim().isEmpty() ? req.getTitle().trim() : req.getUrl().trim(),
                req.getCategory() != null && !req.getCategory().trim().isEmpty() ? req.getCategory().trim() : "General",
                now,
                req.getResourceId(),
                null,
                req.getSource() != null ? req.getSource() : "direct");
    }

    public HistoryRecord recordVisit(String url, String title, String category, String timestamp) {
        String recordId = "hist-" + idSequence.getAndIncrement();
        return recordVisit(recordId, url, title, category, timestamp);
    }

    public HistoryRecord recordVisit(String id, String url, String title, String category, String timestamp) {
        return recordVisit(id, url, title, category, timestamp, null, null, "direct");
    }

    public HistoryRecord recordVisit(String id, String url, String title, String category,
                                     String timestamp, String resourceId, Integer durationSeconds, String source) {
        if (url == null || url.trim().isEmpty()) {
            throw new IllegalArgumentException("URL cannot be null or empty.");
        }

        String safeUrl = url.trim();
        if (safeUrl.length() > 1024) {
            safeUrl = safeUrl.substring(0, 1024);
        }
        String safeTitle = title != null && !title.trim().isEmpty() ? title.trim() : "Untitled";
        if (safeTitle.length() > 255) {
            safeTitle = safeTitle.substring(0, 255);
        }

        HistoryRecord record = new HistoryRecord(
                id,
                resourceId,
                safeUrl,
                safeTitle,
                category != null ? category.trim() : "General",
                timestamp != null ? timestamp : Instant.now().toString(),
                durationSeconds,
                source != null ? source : "direct"
        );

        // 1. Add to history DoublyLinkedList (Unit II)
        historyList.addLast(record);

        // 2. Update frequency in CustomHashTable (Unit III)
        urlIndex.recordVisit(record.getUrl(), record.getTimestamp());

        // 3. Persist history record to database
        if (historyRecordRepository != null) {
            historyRecordRepository.save(HistoryRecordEntity.fromDomain(record));
        }

        // Also update matching saved resource visit count if exists
        for (Resource res : resourceMap.values()) {
            if (res.getUrl().equalsIgnoreCase(record.getUrl()) ||
                    (resourceId != null && res.getId().equals(resourceId))) {
                res.setVisitCount(res.getVisitCount() + 1);
                res.setLastVisitedAt(record.getTimestamp());
                if (resourceRepository != null) {
                    resourceRepository.save(ResourceEntity.fromDomain(res));
                }
                break;
            }
        }

        // 4. Update runtime navigation state with CustomStack (Unit I)
        if (currentPage != null) {
            backStack.push(currentPage);
        }
        currentPage = record;
        forwardStack.clear(); // A new visit after navigating backward MUST clear forward stack

        return record;
    }

    public HistoryRecord goBack() {
        if (backStack.isEmpty()) {
            return null;
        }
        if (currentPage != null) {
            forwardStack.push(currentPage);
        }
        currentPage = backStack.pop();
        return currentPage;
    }

    public HistoryRecord goForward() {
        if (forwardStack.isEmpty()) {
            return null;
        }
        if (currentPage != null) {
            backStack.push(currentPage);
        }
        currentPage = forwardStack.pop();
        return currentPage;
    }

    public boolean canGoBack() {
        return !backStack.isEmpty();
    }

    public boolean canGoForward() {
        return !forwardStack.isEmpty();
    }

    public HistoryRecord getCurrentPage() {
        return currentPage;
    }

    public NavigationStateResponse getNavigationState() {
        return new NavigationStateResponse(
                currentPage,
                canGoBack(),
                canGoForward(),
                backStack.size(),
                forwardStack.size()
        );
    }

    public boolean deleteHistoryRecord(String id) {
        HistoryRecord deleted = historyList.deleteById(id);
        if (deleted == null) {
            return false;
        }

        // Remove from database repository
        if (historyRecordRepository != null) {
            historyRecordRepository.deleteById(id);
        }

        String url = deleted.getUrl();
        HashEntry entry = urlIndex.search(url);

        if (entry != null) {
            int newCount = entry.getVisitCount() - 1;
            if (newCount <= 0) {
                if (isBookmarked(url)) {
                    entry.setVisitCount(0);
                } else {
                    urlIndex.remove(url);
                }
            } else {
                entry.setVisitCount(newCount);
            }
        }

        return true;
    }

    public void clearHistory() {
        historyList.clear();
        backStack.clear();
        forwardStack.clear();
        currentPage = null;

        if (historyRecordRepository != null) {
            historyRecordRepository.deleteAll();
        }

        // Clean up hash index while respecting bookmarks
        HashEntry[] entries = urlIndex.getAllEntries();
        for (HashEntry entry : entries) {
            if (!isBookmarked(entry.getUrl())) {
                urlIndex.remove(entry.getUrl());
            } else {
                entry.setVisitCount(0);
            }
        }
    }

    // =========================================================================
    // Bookmarks Management
    // =========================================================================

    public void addBookmark(String url, String timestamp) {
        if (url == null || url.trim().isEmpty()) {
            return;
        }
        bookmarkIndex.recordVisit(url.trim(), timestamp != null ? timestamp : "Bookmarked");
        if (!urlIndex.contains(url.trim())) {
            HashEntry entry = urlIndex.recordVisit(url.trim(), timestamp);
            if (entry != null) {
                entry.setVisitCount(0);
            }
        }
    }

    public void removeBookmark(String url) {
        if (url == null) return;
        bookmarkIndex.remove(url.trim());
        HashEntry entry = urlIndex.search(url.trim());
        if (entry != null && entry.getVisitCount() <= 0) {
            urlIndex.remove(url.trim());
        }
    }

    public boolean isBookmarked(String url) {
        if (url == null) return false;
        String normalized = url.trim().toLowerCase();
        if (bookmarkIndex.contains(url.trim())) return true;
        return resourceMap.values().stream()
                .anyMatch(r -> r.getUrl().trim().equalsIgnoreCase(normalized));
    }

    // =========================================================================
    // Search (Sequential Search & Hash Table Exact Lookup)
    // =========================================================================

    public SearchResponse searchHistoryByKeyword(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new SearchResponse("", 0, 0, 0, "O(N)", Collections.emptyList());
        }

        SequentialSearch.SearchResult result = SequentialSearch.searchByKeyword(historyList, query);
        return new SearchResponse(
                query,
                result.getMatchCount(),
                result.getComparisonCount(),
                result.getDurationNano(),
                "O(N)",
                Arrays.asList(result.getMatches())
        );
    }

    public SequentialSearch.SearchResult searchByKeyword(String query) {
        return SequentialSearch.searchByKeyword(historyList, query);
    }

    public ExactLookupResponse exactUrlLookup(String targetUrl) {
        if (targetUrl == null || targetUrl.trim().isEmpty()) {
            return new ExactLookupResponse("", false, 0, null, null, 0, 0, "O(1) average", null);
        }

        String normalized = targetUrl.trim();
        CustomHashTable.LookupResult result = urlIndex.searchWithMetrics(normalized);

        Resource linked = resourceMap.values().stream()
                .filter(r -> r.getUrl().equalsIgnoreCase(normalized))
                .findFirst()
                .orElse(null);

        if (result.isFound()) {
            HashEntry e = result.getEntry();
            return new ExactLookupResponse(
                    normalized,
                    true,
                    e.getVisitCount(),
                    e.getFirstVisitedAt(),
                    e.getLastVisitedAt(),
                    result.getComparisons(),
                    result.getDurationNano(),
                    "O(1) average",
                    linked
            );
        } else {
            return new ExactLookupResponse(
                    normalized,
                    false,
                    0,
                    null,
                    null,
                    result.getComparisons(),
                    result.getDurationNano(),
                    "O(1) average",
                    linked
            );
        }
    }

    public HashEntry findExactUrl(String url) {
        return urlIndex.search(url);
    }

    public int getVisitCount(String url) {
        return urlIndex.getVisitCount(url);
    }

    public int getUniqueUrlCount() {
        return urlIndex.getUniqueCount();
    }

    // =========================================================================
    // Analytics (MergeSort & Empirical Algorithmic Performance Comparison)
    // =========================================================================

    public ResourceStats[] getMostVisitedResources() {
        HashEntry[] entries = urlIndex.getAllEntries();
        ResourceStats[] statsArray = new ResourceStats[entries.length];

        for (int i = 0; i < entries.length; i++) {
            HashEntry entry = entries[i];
            String resolvedTitle = entry.getUrl();
            String resolvedCategory = "General";

            // Check bookmarks first
            for (Resource res : resourceMap.values()) {
                if (res.getUrl().equalsIgnoreCase(entry.getUrl())) {
                    resolvedTitle = res.getTitle();
                    resolvedCategory = res.getCategory();
                    break;
                }
            }

            // Or history
            if (resolvedTitle.equals(entry.getUrl())) {
                HistoryRecord[] allVisits = historyList.traverseBackward();
                for (HistoryRecord visit : allVisits) {
                    if (visit.getUrl().equalsIgnoreCase(entry.getUrl())) {
                        resolvedTitle = visit.getTitle();
                        resolvedCategory = visit.getCategory();
                        break;
                    }
                }
            }

            statsArray[i] = new ResourceStats(
                    entry.getUrl(),
                    resolvedTitle,
                    resolvedCategory,
                    entry.getVisitCount(),
                    entry.getLastVisitedAt()
            );
        }

        return MergeSort.sortByVisitCount(statsArray);
    }

    public AnalyticsSummaryResponse getAnalyticsSummary() {
        int totalResources = resourceMap.size();
        int totalHistoryRecords = historyList.size();
        int totalUniqueUrls = urlIndex.getUniqueCount();

        int totalVisits = 0;
        for (HashEntry entry : urlIndex.getAllEntries()) {
            totalVisits += entry.getVisitCount();
        }

        Map<String, Integer> categoryDistribution = new HashMap<>();
        for (Resource res : resourceMap.values()) {
            String cat = res.getCategory() != null ? res.getCategory() : "General";
            categoryDistribution.put(cat, categoryDistribution.getOrDefault(cat, 0) + 1);
        }

        return new AnalyticsSummaryResponse(
                totalResources,
                totalHistoryRecords,
                totalUniqueUrls,
                totalVisits,
                backStack.size(),
                forwardStack.size(),
                categoryDistribution
        );
    }

    /**
     * Executes empirical performance comparison on the exact same browsing history dataset.
     * Evaluates both successful and unsuccessful lookups with repeated measurement iterations
     * and JIT warmup passes.
     */
    public PerformanceComparisonResponse comparePerformance(String targetUrl) {
        HistoryRecord[] records = historyList.traverseForward();
        int datasetSize = records.length;

        String testUrl = (targetUrl != null && !targetUrl.trim().isEmpty())
                ? targetUrl.trim()
                : (currentPage != null ? currentPage.getUrl() : (records.length > 0 ? records[0].getUrl() : "https://visualgo.net/en"));

        String nonExistentUrl = "https://unindexed-benchmark-lookup.org/notfound";

        int iterations = 5;

        // Warmup: 3 passes to mitigate initial JIT compilation variance
        for (int i = 0; i < 3; i++) {
            SequentialSearch.searchByUrl(records, testUrl);
            urlIndex.searchWithMetrics(testUrl);
            SequentialSearch.searchByUrl(records, nonExistentUrl);
            urlIndex.searchWithMetrics(nonExistentUrl);
        }

        // 1. Measured successful lookup
        long totalSeqDuration = 0;
        int seqComparisons = 0;
        long totalHashDuration = 0;
        int hashComparisons = 0;
        boolean exactMatchFound = false;

        for (int i = 0; i < iterations; i++) {
            SequentialSearch.SearchResult sRes = SequentialSearch.searchByUrl(records, testUrl);
            CustomHashTable.LookupResult hRes = urlIndex.searchWithMetrics(testUrl);
            totalSeqDuration += sRes.getDurationNano();
            seqComparisons = sRes.getComparisonCount();
            totalHashDuration += hRes.getDurationNano();
            hashComparisons = hRes.getComparisons();
            exactMatchFound = hRes.isFound();
        }
        long avgSeqDuration = totalSeqDuration / iterations;
        long avgHashDuration = totalHashDuration / iterations;

        // 2. Measured unsuccessful lookup
        long totalUnsuccessfulSeqDuration = 0;
        int unsuccessfulSeqComparisons = 0;
        long totalUnsuccessfulHashDuration = 0;
        int unsuccessfulHashComparisons = 0;

        for (int i = 0; i < iterations; i++) {
            SequentialSearch.SearchResult sRes = SequentialSearch.searchByUrl(records, nonExistentUrl);
            CustomHashTable.LookupResult hRes = urlIndex.searchWithMetrics(nonExistentUrl);
            totalUnsuccessfulSeqDuration += sRes.getDurationNano();
            unsuccessfulSeqComparisons = sRes.getComparisonCount();
            totalUnsuccessfulHashDuration += hRes.getDurationNano();
            unsuccessfulHashComparisons = hRes.getComparisons();
        }
        long avgUnsuccessfulSeqDuration = totalUnsuccessfulSeqDuration / iterations;
        long avgUnsuccessfulHashDuration = totalUnsuccessfulHashDuration / iterations;

        double speedup = (avgHashDuration > 0)
                ? (double) avgSeqDuration / (double) avgHashDuration
                : 1.0;

        return new PerformanceComparisonResponse(
                testUrl,
                datasetSize,
                seqComparisons,
                avgSeqDuration,
                "O(N)",
                hashComparisons,
                avgHashDuration,
                "O(1) average",
                Math.round(speedup * 100.0) / 100.0,
                exactMatchFound,
                nonExistentUrl,
                unsuccessfulSeqComparisons,
                avgUnsuccessfulSeqDuration,
                unsuccessfulHashComparisons,
                avgUnsuccessfulHashDuration,
                iterations,
                "Averaged across " + iterations + " iterations after 3 JIT warmup passes",
                "Machine-dependent nanoTime benchmark on local CPU architecture"
        );
    }

    public SearchComparison compareSearchPerformance(String targetUrl) {
        SequentialSearch.SearchResult seqResult = SequentialSearch.searchByUrl(
                historyList.traverseForward(), targetUrl);
        CustomHashTable.LookupResult hashResult = urlIndex.searchWithMetrics(targetUrl);

        return new SearchComparison(
                targetUrl,
                seqResult.getComparisonCount(),
                seqResult.getDurationNano(),
                seqResult.getMatchCount(),
                hashResult.getComparisons(),
                hashResult.getDurationNano(),
                hashResult.isFound()
        );
    }

    public HistoryRecord[] getHistoryChronological() {
        return historyList.traverseForward();
    }

    public HistoryRecord[] getHistoryReverse() {
        return historyList.traverseBackward();
    }

    public int getHistoryCount() {
        return historyList.size();
    }

    public CustomStack<HistoryRecord> getBackStack() {
        return backStack;
    }

    public CustomStack<HistoryRecord> getForwardStack() {
        return forwardStack;
    }

    public DoublyLinkedList getHistoryList() {
        return historyList;
    }

    public CustomHashTable getUrlIndex() {
        return urlIndex;
    }

    public Map<String, Resource> getResourceMap() {
        return resourceMap;
    }

    // =========================================================================
    // Google Chrome Extension History Integration (Units II & III)
    // =========================================================================

    /**
     * Imports a batch of Google Chrome browsing history records.
     * Integrates directly into Unit II (DoublyLinkedList) and Unit III (CustomHashTable),
     * avoiding duplicate events by (URL + Timestamp) deduplication and persisting to H2.
     */
    public HistoryBatchImportResponse importHistoryBatch(HistoryBatchImportRequest req) {
        if (req == null || req.getItems() == null || req.getItems().isEmpty()) {
            return new HistoryBatchImportResponse(0, 0, 0, historyList.size(), "No items provided in batch.", Collections.emptyList());
        }

        int totalReceived = req.getItems().size();
        int importedCount = 0;
        int duplicateCount = 0;
        List<HistoryRecord> sampleImported = new ArrayList<>();
        Set<String> batchDeduplicationSet = new HashSet<>();
        List<HistoryRecordEntity> toPersist = new ArrayList<>();

        String defaultSource = (req.getDefaultSource() != null && !req.getDefaultSource().trim().isEmpty())
                ? req.getDefaultSource().trim()
                : "chrome";

        for (HistoryImportItem item : req.getItems()) {
            if (item == null || item.getUrl() == null || item.getUrl().trim().isEmpty()) {
                continue;
            }

            String url = item.getUrl().trim();
            if (url.length() > 1024) {
                url = url.substring(0, 1024);
            }

            // Filter out browser internal and non-HTTP URLs
            String lowerUrl = url.toLowerCase();
            if (lowerUrl.startsWith("chrome://") ||
                lowerUrl.startsWith("chrome-extension://") ||
                lowerUrl.startsWith("edge://") ||
                lowerUrl.startsWith("devtools://") ||
                lowerUrl.startsWith("about:") ||
                lowerUrl.startsWith("file://")) {
                continue;
            }

            // Normalize timestamp
            String timestamp = normalizeTimestamp(item.getTimestamp());

            // Deduplication key within the incoming batch
            String dedupeKey = url + "::" + timestamp;
            if (batchDeduplicationSet.contains(dedupeKey)) {
                duplicateCount++;
                continue;
            }
            batchDeduplicationSet.add(dedupeKey);

            // Deduplication check across persistent repository or in-memory history list
            boolean alreadyExists = false;
            if (historyRecordRepository != null) {
                alreadyExists = historyRecordRepository.existsByUrlAndTimestamp(url, timestamp);
            } else {
                for (HistoryRecord r : historyList.traverseForward()) {
                    if (r.getUrl().equalsIgnoreCase(url) && r.getTimestamp().equals(timestamp)) {
                        alreadyExists = true;
                        break;
                    }
                }
            }
            if (alreadyExists) {
                duplicateCount++;
                continue;
            }

            String title = (item.getTitle() != null && !item.getTitle().trim().isEmpty())
                    ? item.getTitle().trim()
                    : url;
            if (title.length() > 255) {
                title = title.substring(0, 255);
            }

            String category = (item.getCategory() != null && !item.getCategory().trim().isEmpty() && !item.getCategory().equalsIgnoreCase("General"))
                    ? item.getCategory().trim()
                    : inferCategory(url, title);

            String source = (item.getSource() != null && !item.getSource().trim().isEmpty())
                    ? item.getSource().trim()
                    : defaultSource;

            String id = "hist-chrome-" + System.currentTimeMillis() + "-" + idSequence.getAndIncrement();

            HistoryRecord record = new HistoryRecord(
                    id,
                    null,
                    url,
                    title,
                    category,
                    timestamp,
                    item.getDurationSeconds(),
                    source
            );

            // 1. Insert into Unit II: DoublyLinkedList (Chronological history)
            historyList.addLast(record);

            // 2. Insert into Unit III: CustomHashTable (URL frequency indexing)
            urlIndex.recordVisit(record.getUrl(), record.getTimestamp());

            // 3. Queue for persistent file-based H2 database storage
            toPersist.add(HistoryRecordEntity.fromDomain(record));

            // Synchronize matching saved resource if present in the library
            for (Resource res : resourceMap.values()) {
                if (res.getUrl().equalsIgnoreCase(record.getUrl())) {
                    res.setVisitCount(res.getVisitCount() + 1);
                    res.setLastVisitedAt(record.getTimestamp());
                    if (resourceRepository != null) {
                        try {
                            resourceRepository.save(ResourceEntity.fromDomain(res));
                        } catch (Exception ex) {
                            System.err.println("[BrowseBack] Failed to update resource " + res.getUrl() + ": " + ex.getMessage());
                        }
                    }
                    break;
                }
            }

            importedCount++;
            if (sampleImported.size() < 5) {
                sampleImported.add(record);
            }
        }

        // Batch persist to H2 database for high performance and atomicity
        if (historyRecordRepository != null && !toPersist.isEmpty()) {
            try {
                historyRecordRepository.saveAll(toPersist);
            } catch (Exception ex) {
                System.err.println("[BrowseBack] Batch save failed, falling back to individual saves: " + ex.getMessage());
                for (HistoryRecordEntity entity : toPersist) {
                    try {
                        historyRecordRepository.save(entity);
                    } catch (Exception ignored) {}
                }
            }
        }

        String msg = String.format("Imported %d new Chrome history visits (%d duplicates skipped).",
                importedCount, duplicateCount);

        return new HistoryBatchImportResponse(
                totalReceived,
                importedCount,
                duplicateCount,
                historyList.size(),
                msg,
                sampleImported
        );
    }

    /**
     * Returns statistics summarizing Chrome history imports vs BrowseBack application visits.
     */
    public ChromeSyncSummaryResponse getChromeSyncSummary() {
        long totalCount = historyList.size();
        long chromeCount = 0;
        String latestChromeTimestamp = null;

        for (HistoryRecord record : historyList.traverseForward()) {
            if ("chrome".equalsIgnoreCase(record.getSource())) {
                chromeCount++;
                if (latestChromeTimestamp == null || record.getTimestamp().compareTo(latestChromeTimestamp) > 0) {
                    latestChromeTimestamp = record.getTimestamp();
                }
            }
        }

        long browseBackCount = totalCount - chromeCount;
        return new ChromeSyncSummaryResponse(totalCount, chromeCount, browseBackCount, latestChromeTimestamp, true);
    }

    private String normalizeTimestamp(String rawTimestamp) {
        if (rawTimestamp == null || rawTimestamp.trim().isEmpty()) {
            return Instant.now().toString();
        }
        String trimmed = rawTimestamp.trim();
        try {
            // Check if it's an epoch number (e.g. Chrome milliseconds timestamp, seconds, or microseconds, including floats)
            if (trimmed.matches("^\\d+(\\.\\d+)?$")) {
                double val = Double.parseDouble(trimmed);
                long millis = (long) val;
                if (millis > 1_000_000_000_000_000L) { // Microseconds (>1e15)
                    millis = millis / 1000L;
                } else if (millis < 100_000_000_000L) { // Seconds (<1e11)
                    millis = millis * 1000L;
                }
                return Instant.ofEpochMilli(millis).toString();
            }
            // Check if already valid ISO-8601
            return Instant.parse(trimmed).toString();
        } catch (Exception e) {
            try {
                return java.time.format.DateTimeFormatter.ISO_DATE_TIME.parse(trimmed, java.time.Instant::from).toString();
            } catch (Exception ignored) {
                return Instant.now().toString();
            }
        }
    }

    private String inferCategory(String url, String title) {
        String combined = (url + " " + title).toLowerCase();
        if (combined.contains("github.com") || combined.contains("gitlab.com") || combined.contains("bitbucket") ||
            combined.contains("stackoverflow.com") || combined.contains("stackexchange") || combined.contains("npmjs.com")) {
            return "Programming";
        }
        if (combined.contains("leetcode.com") || combined.contains("hackerrank") || combined.contains("codeforces") ||
            combined.contains("codechef") || combined.contains("geeksforgeeks")) {
            return "Competitive Programming";
        }
        if (combined.contains("arxiv.org") || combined.contains("doi.org") || combined.contains("nature.com") ||
            combined.contains("sciencedirect") || combined.contains("semanticscholar") || combined.contains("acm.org") ||
            combined.contains("ieee.org")) {
            return "Research Papers";
        }
        if (combined.contains("docs.") || combined.contains("developer.mozilla.org") || combined.contains("react.dev") ||
            combined.contains("spring.io") || combined.contains("python.org") || combined.contains("rust-lang.org")) {
            return "Documentation";
        }
        if (combined.contains("youtube.com") || combined.contains("coursera") || combined.contains("udemy") ||
            combined.contains("medium.com") || combined.contains("dev.to") || combined.contains("freecodecamp")) {
            return "Tutorials";
        }
        if (combined.contains("mit.edu") || combined.contains("stanford.edu") || combined.contains("harvard.edu") ||
            combined.contains("berkeley.edu")) {
            return "Academic Papers";
        }
        if (combined.contains("system") || combined.contains("architecture") || combined.contains("distributed") ||
            combined.contains("database") || combined.contains("microservice")) {
            return "System Design";
        }
        if (combined.contains("algorithm") || combined.contains("tree") || combined.contains("graph") || combined.contains("sorting")) {
            return "Algorithms";
        }
        return "Web Research";
    }
}

