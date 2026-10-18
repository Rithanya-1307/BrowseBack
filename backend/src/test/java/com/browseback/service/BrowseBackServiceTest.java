package com.browseback.service;

import com.browseback.model.HistoryRecord;
import com.browseback.model.ResourceStats;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("BrowseBackService Coordination & Synchronization Tests")
public class BrowseBackServiceTest {

    private BrowseBackService service;

    @BeforeEach
    void setUp() {
        service = new BrowseBackService();
    }

    @Test
    @DisplayName("Record visits updates history list, hash index, and current page")
    void testRecordVisit() {
        HistoryRecord record = service.recordVisit("https://visualgo.net", "Visualgo", "DSA", "2025-01-10T10:00:00Z");

        assertNotNull(record);
        assertEquals(1, service.getHistoryCount());
        assertEquals("https://visualgo.net", service.getCurrentPage().getUrl());
        assertEquals(1, service.getVisitCount("https://visualgo.net"));
        assertEquals(1, service.getUniqueUrlCount());
    }

    @Test
    @DisplayName("Browser navigation uses CustomStack (LIFO) for back and forward")
    void testBrowserNavigation() {
        service.recordVisit("https://site1.com", "Site 1", "Cat", "10:00");
        service.recordVisit("https://site2.com", "Site 2", "Cat", "10:05");
        service.recordVisit("https://site3.com", "Site 3", "Cat", "10:10");

        assertEquals("https://site3.com", service.getCurrentPage().getUrl());
        assertTrue(service.canGoBack());
        assertFalse(service.canGoForward());

        // Go Back to Site 2
        HistoryRecord back1 = service.goBack();
        assertNotNull(back1);
        assertEquals("https://site2.com", back1.getUrl());
        assertTrue(service.canGoForward());

        // Go Back to Site 1
        HistoryRecord back2 = service.goBack();
        assertNotNull(back2);
        assertEquals("https://site1.com", back2.getUrl());
        assertFalse(service.canGoBack());

        // Go Forward to Site 2
        HistoryRecord fwd1 = service.goForward();
        assertNotNull(fwd1);
        assertEquals("https://site2.com", fwd1.getUrl());

        // Visiting a new site clears forward stack
        service.recordVisit("https://site4.com", "Site 4", "Cat", "10:15");
        assertFalse(service.canGoForward());
    }

    @Test
    @DisplayName("Synchronization: Deleting one history record decrements URL visit count")
    void testDeleteRecordDecrementsVisitCount() {
        String sharedUrl = "https://mit.edu/algorithms";
        HistoryRecord r1 = service.recordVisit("h1", sharedUrl, "MIT Visit 1", "Algorithms", "10:00");
        HistoryRecord r2 = service.recordVisit("h2", sharedUrl, "MIT Visit 2", "Algorithms", "11:00");

        assertEquals(2, service.getVisitCount(sharedUrl));
        assertEquals(1, service.getUniqueUrlCount());

        // Delete first visit
        boolean deleted1 = service.deleteHistoryRecord("h1");
        assertTrue(deleted1);
        assertEquals(1, service.getHistoryCount());
        // Visit count must be decremented to 1, and URL remains in hash table
        assertEquals(1, service.getVisitCount(sharedUrl));
        assertTrue(service.getUrlIndex().contains(sharedUrl));

        // Delete second visit -> visits reach 0, URL must be removed from hash table
        boolean deleted2 = service.deleteHistoryRecord("h2");
        assertTrue(deleted2);
        assertEquals(0, service.getHistoryCount());
        assertEquals(0, service.getVisitCount(sharedUrl));
        assertFalse(service.getUrlIndex().contains(sharedUrl));
        assertEquals(0, service.getUniqueUrlCount());
    }

    @Test
    @DisplayName("Synchronization: Bookmark keeps URL in hash table even if all history visits are deleted")
    void testBookmarkProtectsUrlInHashTable() {
        String url = "https://important-bookmarked-paper.org";
        service.addBookmark(url, "2025-01-01");
        service.recordVisit("h1", url, "Paper Title", "Research", "10:00");

        assertEquals(1, service.getVisitCount(url));

        // Delete the history record
        service.deleteHistoryRecord("h1");
        assertEquals(0, service.getHistoryCount());

        // Because it is bookmarked, the URL should NOT be removed from hash table!
        assertTrue(service.isBookmarked(url));
        assertTrue(service.getUrlIndex().contains(url));
        assertEquals(0, service.getVisitCount(url));
    }

    @Test
    @DisplayName("Clearing history resets history, stacks, and non-bookmarked URLs")
    void testClearHistory() {
        service.recordVisit("https://temp1.com", "T1", "Cat", "10:00");
        service.recordVisit("https://temp2.com", "T2", "Cat", "10:01");
        service.addBookmark("https://bookmarked.com", "10:02");
        service.recordVisit("https://bookmarked.com", "BM", "Cat", "10:03");

        service.clearHistory();

        assertEquals(0, service.getHistoryCount());
        assertFalse(service.canGoBack());
        assertFalse(service.canGoForward());
        assertNull(service.getCurrentPage());

        assertFalse(service.getUrlIndex().contains("https://temp1.com"));
        assertFalse(service.getUrlIndex().contains("https://temp2.com"));
        assertTrue(service.getUrlIndex().contains("https://bookmarked.com"));
    }

    @Test
    @DisplayName("Empty inputs and invalid record IDs are handled safely")
    void testInvalidInputs() {
        assertThrows(IllegalArgumentException.class, () -> service.recordVisit(null, "T", "C", "time"));
        assertThrows(IllegalArgumentException.class, () -> service.recordVisit("   ", "T", "C", "time"));

        assertFalse(service.deleteHistoryRecord(null));
        assertFalse(service.deleteHistoryRecord("non-existent-id"));

        assertNull(service.goBack());
        assertNull(service.goForward());
    }

    @Test
    @DisplayName("Most-visited ranking produces resources ordered by frequency via MergeSort")
    void testMostVisitedRanking() {
        service.recordVisit("https://a.com", "A", "Cat", "10:00");
        service.recordVisit("https://b.com", "B", "Cat", "10:01");
        service.recordVisit("https://b.com", "B", "Cat", "10:02");
        service.recordVisit("https://b.com", "B", "Cat", "10:03");
        service.recordVisit("https://c.com", "C", "Cat", "10:04");
        service.recordVisit("https://c.com", "C", "Cat", "10:05");

        ResourceStats[] mostVisited = service.getMostVisitedResources();
        assertEquals(3, mostVisited.length);

        assertEquals("https://b.com", mostVisited[0].getUrl());
        assertEquals(3, mostVisited[0].getVisitCount());

        assertEquals("https://c.com", mostVisited[1].getUrl());
        assertEquals(2, mostVisited[1].getVisitCount());

        assertEquals("https://a.com", mostVisited[2].getUrl());
        assertEquals(1, mostVisited[2].getVisitCount());
    }

    @Test
    @DisplayName("Search comparison returns valid metrics for both Sequential Search and Hash Lookup")
    void testCompareSearchPerformance() {
        service.recordVisit("https://a.com", "Alpha", "Cat", "10:00");
        service.recordVisit("https://b.com", "Beta", "Cat", "10:05");

        var comp = service.compareSearchPerformance("https://b.com");
        assertNotNull(comp);
        assertEquals("https://b.com", comp.getTargetUrl());
        assertEquals(2, comp.getSequentialComparisons());
        assertEquals(1, comp.getSequentialMatchCount());
        assertTrue(comp.isHashFound());
        assertTrue(comp.getHashComparisons() >= 1);
    }

    @Test
    @DisplayName("Duplicate URL prevention: Adding resource with existing URL throws IllegalArgumentException")
    void testDuplicateUrlPrevention() {
        var req1 = new com.browseback.dto.CreateResourceRequest();
        req1.setTitle("Resource 1");
        req1.setUrl("https://duplicate-check.com");
        req1.setCategory("Algorithms");
        service.addResource(req1);

        var req2 = new com.browseback.dto.CreateResourceRequest();
        req2.setTitle("Resource 2");
        req2.setUrl("https://duplicate-check.com");
        req2.setCategory("Data Structures");

        assertThrows(IllegalArgumentException.class, () -> service.addResource(req2));
    }

    @Test
    @DisplayName("Deleting a saved bookmark does not delete history records")
    void testBookmarkDeletionDoesNotDeleteHistory() {
        var req = new com.browseback.dto.CreateResourceRequest();
        req.setTitle("Research Article");
        req.setUrl("https://persisted-article.org");
        req.setCategory("Research");
        var saved = service.addResource(req);

        // Record visit for this resource
        service.recordVisit("h-100", saved.getUrl(), saved.getTitle(), saved.getCategory(), "12:00");
        assertEquals(1, service.getHistoryCount());

        // Delete bookmark
        boolean deleted = service.deleteResource(saved.getId());
        assertTrue(deleted);

        // Verify history record is still present!
        assertEquals(1, service.getHistoryCount());
        assertEquals("https://persisted-article.org", service.getHistoryChronological()[0].getUrl());
    }

    @Test
    @DisplayName("comparePerformance evaluates both successful and unsuccessful lookups with repeated iterations")
    void testComparePerformanceEmpirical() {
        service.recordVisit("https://site-a.com", "Site A", "Cat", "10:00");
        service.recordVisit("https://site-b.com", "Site B", "Cat", "10:05");

        var result = service.comparePerformance("https://site-b.com");
        assertNotNull(result);
        assertEquals("https://site-b.com", result.getTargetUrl());
        assertTrue(result.isExactMatchFound());
        assertEquals(2, result.getDatasetSize());
        assertEquals(2, result.getSequentialComparisons());
        assertTrue(result.getHashComparisons() >= 1);
        assertEquals(5, result.getRepeatedIterations());
        assertNotNull(result.getUnsuccessfulTargetUrl());
        assertEquals(2, result.getUnsuccessfulSequentialComparisons());
        assertNotNull(result.getMeasurementMethod());
        assertNotNull(result.getNotes());
    }

    @Test
    @DisplayName("Chrome batch import integrates into Unit II and Unit III with deduplication")
    void testChromeBatchImportAndDeduplication() {
        var items = new java.util.ArrayList<com.browseback.dto.HistoryImportItem>();
        items.add(new com.browseback.dto.HistoryImportItem(
                "https://github.com/torvalds/linux", "Linux Kernel Source", null, "2026-10-15T10:00:00Z", 5, 300, "chrome"));
        items.add(new com.browseback.dto.HistoryImportItem(
                "https://leetcode.com/problems/two-sum", "Two Sum - LeetCode", null, "2026-10-15T11:00:00Z", 2, 600, "chrome"));
        // Duplicate item with identical URL and timestamp in same batch
        items.add(new com.browseback.dto.HistoryImportItem(
                "https://github.com/torvalds/linux", "Linux Kernel Source", null, "2026-10-15T10:00:00Z", 5, 300, "chrome"));
        // Internal browser URL to be filtered out
        items.add(new com.browseback.dto.HistoryImportItem(
                "chrome://settings", "Settings", null, "2026-10-15T12:00:00Z", 1, 10, "chrome"));

        var req = new com.browseback.dto.HistoryBatchImportRequest(items, "chrome");
        var res = service.importHistoryBatch(req);

        assertNotNull(res);
        assertEquals(4, res.getTotalReceived());
        assertEquals(2, res.getImportedCount());
        assertEquals(1, res.getDuplicateCount());
        assertEquals(2, service.getHistoryCount());

        // Verify Unit II DoublyLinkedList traversal
        var records = service.getHistoryChronological();
        assertEquals(2, records.length);
        assertEquals("chrome", records[0].getSource());
        assertEquals("Programming", records[0].getCategory()); // Auto-inferred from GitHub
        assertEquals("Competitive Programming", records[1].getCategory()); // Auto-inferred from LeetCode

        // Verify Unit III CustomHashTable frequency tracking
        assertTrue(service.getUrlIndex().contains("https://github.com/torvalds/linux"));
        assertEquals(1, service.getUrlIndex().getVisitCount("https://github.com/torvalds/linux"));

        // Second batch import with same records must detect all 3 non-internal items as duplicates
        var secondRes = service.importHistoryBatch(req);
        assertEquals(0, secondRes.getImportedCount());
        assertEquals(3, secondRes.getDuplicateCount());

        // Verify Chrome sync summary
        var summary = service.getChromeSyncSummary();
        assertNotNull(summary);
        assertEquals(2, summary.getTotalHistoryRecords());
        assertEquals(2, summary.getChromeHistoryRecords());
        assertEquals(0, summary.getBrowseBackRecords());
        assertTrue(summary.isExtensionReady());
    }
}

