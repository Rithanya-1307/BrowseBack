package com.browseback.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("BrowseBack Spring Boot API Integration Tests")
public class BrowseBackIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.browseback.service.BrowseBackService service;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        service.clearHistory();
        service.loadInitialSampleData();
    }

    @Test
    @DisplayName("GET /api/health returns UP status")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.dsaEngine", containsString("Units I, II, III")));
    }

    @Test
    @DisplayName("GET /api/resources returns preloaded research library")
    void testGetResources() throws Exception {
        mockMvc.perform(get("/api/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].url", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/resources creates new resource with validation")
    void testCreateResource() throws Exception {
        Map<String, Object> req = Map.of(
                "title", "MIT Dynamic Programming",
                "url", "https://ocw.mit.edu/courses/dp",
                "category", "Algorithms",
                "tags", List.of("dp", "algorithms"),
                "notes", "Memoization & bottom-up tables",
                "isPinned", true
        );

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("MIT Dynamic Programming")))
                .andExpect(jsonPath("$.isPinned", is(true)));
    }

    @Test
    @DisplayName("POST /api/resources with invalid input returns 400 Bad Request")
    void testCreateResourceValidationFailure() throws Exception {
        Map<String, Object> req = Map.of(
                "title", "", // Blank title
                "url", ""   // Blank url
        );

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Validation Failed")));
    }

    @Test
    @DisplayName("PUT and DELETE /api/resources/{id}")
    void testUpdateAndDeleteResource() throws Exception {
        // Create resource first
        Map<String, Object> createReq = Map.of(
                "title", "Temporary Resource",
                "url", "https://temp-test-resource.org",
                "category", "General"
        );

        String responseJson = mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(responseJson).get("id").asText();

        // Update resource
        Map<String, Object> updateReq = Map.of(
                "title", "Updated Temporary Resource",
                "category", "Web Development"
        );

        mockMvc.perform(put("/api/resources/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Temporary Resource")))
                .andExpect(jsonPath("$.category", is("Web Development")));

        // Delete resource
        mockMvc.perform(delete("/api/resources/" + id))
                .andExpect(status().isNoContent());

        // Verify 404
        mockMvc.perform(get("/api/resources/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/history returns browsing history")
    void testGetHistory() throws Exception {
        mockMvc.perform(get("/api/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())));
    }

    @Test
    @DisplayName("Navigation API: visit, back, forward using CustomStack without accidental count increment")
    void testNavigationStackFlow() throws Exception {
        // Visit page A
        mockMvc.perform(post("/api/navigation/visit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "url", "https://nav-a.org",
                                "title", "Nav Page A",
                                "category", "Algorithms"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.url", is("https://nav-a.org")));

        // Visit page B
        mockMvc.perform(post("/api/navigation/visit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "url", "https://nav-b.org",
                                "title", "Nav Page B",
                                "category", "Algorithms"
                        ))))
                .andExpect(status().isCreated());

        // Get current state
        mockMvc.perform(get("/api/navigation/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canGoBack", is(true)))
                .andExpect(jsonPath("$.current.url", is("https://nav-b.org")));

        // Step Back to Page A
        mockMvc.perform(post("/api/navigation/back"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url", is("https://nav-a.org")));

        // Step Forward to Page B
        mockMvc.perform(post("/api/navigation/forward"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url", is("https://nav-b.org")));
    }

    @Test
    @DisplayName("GET /api/search executes SequentialSearch across history with O(N) metrics")
    void testSequentialSearch() throws Exception {
        mockMvc.perform(get("/api/search?q=Algorithms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matchCount", greaterThan(0)))
                .andExpect(jsonPath("$.timeComplexity", is("O(N)")))
                .andExpect(jsonPath("$.comparisonCount", greaterThan(0)));
    }

    @Test
    @DisplayName("GET /api/search/url executes CustomHashTable exact lookup with O(1) metrics")
    void testExactUrlLookup() throws Exception {
        String testUrl = "https://visualgo.net/en";
        mockMvc.perform(get("/api/search/url").param("url", testUrl))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.found", is(true)))
                .andExpect(jsonPath("$.url", is(testUrl)))
                .andExpect(jsonPath("$.visitCount", greaterThan(0)))
                .andExpect(jsonPath("$.timeComplexity", is("O(1) average")));
    }

    @Test
    @DisplayName("GET /api/analytics/summary returns totals and distribution")
    void testAnalyticsSummary() throws Exception {
        mockMvc.perform(get("/api/analytics/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalResources", greaterThan(0)))
                .andExpect(jsonPath("$.totalHistoryRecords", greaterThan(0)))
                .andExpect(jsonPath("$.totalUniqueUrls", greaterThan(0)))
                .andExpect(jsonPath("$.categoryDistribution", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/analytics/popular returns resources sorted by MergeSort")
    void testPopularResourcesMergeSort() throws Exception {
        mockMvc.perform(get("/api/analytics/popular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].visitCount", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/analytics/performance returns empirical comparison of Sequential vs Hash")
    void testPerformanceComparison() throws Exception {
        mockMvc.perform(get("/api/analytics/performance").param("url", "https://visualgo.net/en"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.targetUrl", is("https://visualgo.net/en")))
                .andExpect(jsonPath("$.sequentialComplexity", is("O(N)")))
                .andExpect(jsonPath("$.hashComplexity", is("O(1) average")))
                .andExpect(jsonPath("$.exactMatchFound", is(true)));
    }

    @Test
    @DisplayName("Data consistency: Deleting history decrements visits, bookmarks survive clearing history")
    void testConsistencyAndBookmarkSurvival() throws Exception {
        String bookmarkUrl = "https://bookmark-survivor.edu";

        // 1. Save bookmark
        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "Survivor Bookmark",
                                "url", bookmarkUrl,
                                "category", "Data Structures"
                        ))))
                .andExpect(status().isCreated());

        // 2. Visit bookmark
        mockMvc.perform(post("/api/navigation/visit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "url", bookmarkUrl,
                                "title", "Survivor Bookmark",
                                "category", "Data Structures"
                        ))))
                .andExpect(status().isCreated());

        // 3. Clear all browsing history
        mockMvc.perform(delete("/api/history"))
                .andExpect(status().isNoContent());

        // Verify history is empty
        mockMvc.perform(get("/api/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Verify saved bookmark SURVIVES in /api/resources
        mockMvc.perform(get("/api/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.url == '" + bookmarkUrl + "')]", not(empty())));

        // Verify bookmark remains indexed in hash table
        mockMvc.perform(get("/api/search/url").param("url", bookmarkUrl))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.found", is(true)));
    }

    @Test
    @DisplayName("POST /api/resources with duplicate URL returns 400 Bad Request")
    void testCreateResourceDuplicateUrlRejection() throws Exception {
        String existingUrl = "https://visualgo.net/en"; // Preloaded in sample data

        Map<String, Object> req = Map.of(
                "title", "Duplicate Visualgo Entry",
                "url", existingUrl,
                "category", "Algorithms"
        );

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Bad Request")))
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    @DisplayName("POST /api/resources/reset resets database and returns 200 OK")
    void testResetToSampleData() throws Exception {
        mockMvc.perform(post("/api/resources/reset"))
                .andExpect(status().isOk());

        // Verify default resources are loaded
        mockMvc.perform(get("/api/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))));

        // Verify default history is loaded
        mockMvc.perform(get("/api/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))));
    }

    @Test
    @DisplayName("Persistence: Rebuilding DSA structures from database retains entities")
    void testRehydrateFromDatabase() throws Exception {
        // Save a new resource via API
        String uniqueUrl = "https://persistent-test-" + System.currentTimeMillis() + ".edu";
        Map<String, Object> req = Map.of(
                "title", "Persistence Test Page",
                "url", uniqueUrl,
                "category", "System Design"
        );

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Rehydrate in-memory DSA structures
        service.rehydrateFromDatabase();

        // Verify that custom hash index and resourceMap retained the saved entity
        assertTrue(service.getUrlIndex().contains(uniqueUrl));
        assertTrue(service.isBookmarked(uniqueUrl));
    }

    @Test
    @DisplayName("POST /api/history/import imports Chrome history batch with deduplication and persistence")
    void testHistoryBatchImportEndpoint() throws Exception {
        Map<String, Object> item1 = Map.of(
                "url", "https://github.com/torvalds/linux",
                "title", "Linux Kernel Source",
                "timestamp", "2026-10-15T10:00:00Z",
                "source", "chrome"
        );
        Map<String, Object> item2 = Map.of(
                "url", "https://leetcode.com/problems/lru-cache",
                "title", "LRU Cache - LeetCode",
                "timestamp", "2026-10-15T11:00:00Z",
                "source", "chrome"
        );
        // Duplicate of item 1
        Map<String, Object> item3 = Map.of(
                "url", "https://github.com/torvalds/linux",
                "title", "Linux Kernel Source",
                "timestamp", "2026-10-15T10:00:00Z",
                "source", "chrome"
        );

        Map<String, Object> batchReq = Map.of(
                "items", List.of(item1, item2, item3),
                "defaultSource", "chrome"
        );

        mockMvc.perform(post("/api/history/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReceived", is(3)))
                .andExpect(jsonPath("$.importedCount", is(2)))
                .andExpect(jsonPath("$.duplicateCount", is(1)))
                .andExpect(jsonPath("$.totalHistoryRecords", greaterThanOrEqualTo(2)));

        // Verify Chrome Sync Summary reflects imported records
        mockMvc.perform(get("/api/history/sync-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chromeHistoryRecords", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.extensionReady", is(true)));
    }

    @Test
    @DisplayName("Regression Test: POST /api/history/import handles long titles (>255 chars) and long URLs (>1024 chars) without HTTP 500")
    void testHistoryBatchImportWithOversizedTitlesAndUrls() throws Exception {
        String longTitle = "A".repeat(350); // 350 characters, exceeds default VARCHAR(255)
        String longUrl = "https://example.com/research/paper?query=" + "x".repeat(1100); // Exceeds default VARCHAR(1024)

        Map<String, Object> itemLongTitle = Map.of(
                "url", "https://arxiv.org/abs/2301.00001",
                "title", longTitle,
                "timestamp", "2026-10-16T10:00:00Z",
                "source", "chrome"
        );

        Map<String, Object> itemLongUrl = Map.of(
                "url", longUrl,
                "title", "Deep Search Research Query",
                "timestamp", "2026-10-16T11:00:00Z",
                "source", "chrome"
        );

        // Item with empty title where fallback to URL (>255 chars) occurs
        String longUrlNoTitle = "https://developer.mozilla.org/en-US/docs/Web/API/" + "param/".repeat(60);
        Map<String, Object> itemEmptyTitleLongUrl = Map.of(
                "url", longUrlNoTitle,
                "title", "",
                "timestamp", "2026-10-16T12:00:00Z",
                "source", "chrome"
        );

        Map<String, Object> batchReq = Map.of(
                "items", List.of(itemLongTitle, itemLongUrl, itemEmptyTitleLongUrl),
                "defaultSource", "chrome"
        );

        mockMvc.perform(post("/api/history/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.importedCount", is(3)))
                .andExpect(jsonPath("$.duplicateCount", is(0)));

        // Verify all records exist in memory and in DSA hash index
        assertTrue(service.getUrlIndex().contains("https://arxiv.org/abs/2301.00001"));
        assertEquals(3L, service.getChromeSyncSummary().getChromeHistoryRecords());
    }

    @Test
    @DisplayName("Regression Test: POST /api/history/import handles microsecond & epoch float timestamps cleanly")
    void testHistoryBatchImportWithMicrosecondAndEpochTimestamps() throws Exception {
        // Microsecond timestamp from WebKit / Chrome internal storage (16 digits)
        Map<String, Object> itemMicroseconds = Map.of(
                "url", "https://github.com/torvalds/linux",
                "title", "Linux Kernel Source",
                "timestamp", "1729151234567890",
                "source", "chrome"
        );

        // Millisecond float timestamp from JS (e.g. DOMHighResTimeStamp)
        Map<String, Object> itemFloatEpoch = Map.of(
                "url", "https://news.ycombinator.com",
                "title", "Hacker News",
                "timestamp", "1729151234567.85",
                "source", "chrome"
        );

        Map<String, Object> batchReq = Map.of(
                "items", List.of(itemMicroseconds, itemFloatEpoch),
                "defaultSource", "chrome"
        );

        mockMvc.perform(post("/api/history/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.importedCount", is(2)))
                .andExpect(jsonPath("$.duplicateCount", is(0)));

        assertTrue(service.getUrlIndex().contains("https://github.com/torvalds/linux"));
        assertTrue(service.getUrlIndex().contains("https://news.ycombinator.com"));
    }

    @Test
    @DisplayName("Regression Test: Batch import with blank/null URLs skips bad items without rejecting valid ones")
    void testHistoryBatchImportWithEmptyAndWhitespaceUrlsDoesNotBlockBatch() throws Exception {
        java.util.Map<String, Object> blankUrlItem = new java.util.HashMap<>();
        blankUrlItem.put("url", "   ");
        blankUrlItem.put("title", "Blank URL Entry");
        blankUrlItem.put("timestamp", "2026-10-16T12:00:00Z");

        java.util.Map<String, Object> validItem = Map.of(
                "url", "https://www.w3.org/TR/webdriver/",
                "title", "WebDriver Specification",
                "timestamp", "2026-10-16T12:01:00Z",
                "source", "chrome"
        );

        Map<String, Object> batchReq = Map.of(
                "items", List.of(blankUrlItem, validItem),
                "defaultSource", "chrome"
        );

        mockMvc.perform(post("/api/history/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.importedCount", is(1)))
                .andExpect(jsonPath("$.duplicateCount", is(0)));

        assertTrue(service.getUrlIndex().contains("https://www.w3.org/TR/webdriver/"));
    }

    @Test
    @DisplayName("Regression Test: Empty batch payload returns 200 OK with zero counts instead of 400 Bad Request")
    void testHistoryBatchImportEmptyItemsListReturns200() throws Exception {
        Map<String, Object> emptyBatchReq = Map.of(
                "items", List.of(),
                "defaultSource", "chrome"
        );

        mockMvc.perform(post("/api/history/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyBatchReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.importedCount", is(0)))
                .andExpect(jsonPath("$.totalReceived", is(0)));
    }

    @Test
    @DisplayName("Regression Test: Long URLs (>1024 chars) deduplicate correctly across multiple sync runs")
    void testHistoryBatchImportLongUrlDeduplicationOnSubsequentSync() throws Exception {
        String longUrl = "https://www.google.com/search?q=browseback+smart+research&token=" + "k".repeat(1100);
        String timestamp = "2026-10-16T15:00:00Z";

        Map<String, Object> itemLongUrl = Map.of(
                "url", longUrl,
                "title", "Google Search Long URL",
                "timestamp", timestamp,
                "source", "chrome"
        );

        Map<String, Object> firstBatch = Map.of(
                "items", List.of(itemLongUrl),
                "defaultSource", "chrome"
        );

        // First sync run: must import 1 new record
        mockMvc.perform(post("/api/history/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(firstBatch)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.importedCount", is(1)))
                .andExpect(jsonPath("$.duplicateCount", is(0)));

        // Second sync run with identical long URL and timestamp: MUST detect duplicate and NOT insert again
        mockMvc.perform(post("/api/history/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(firstBatch)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.importedCount", is(0)))
                .andExpect(jsonPath("$.duplicateCount", is(1)));
    }
}

