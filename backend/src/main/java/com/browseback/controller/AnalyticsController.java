package com.browseback.controller;

import com.browseback.dto.AnalyticsSummaryResponse;
import com.browseback.dto.PerformanceComparisonResponse;
import com.browseback.model.ResourceStats;
import com.browseback.service.BrowseBackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

/**
 * REST API for Algorithmic Analytics:
 * - Unit III: MergeSort ranking of most-visited resources
 * - Empirical comparison of Sequential Search O(N) vs Hash Lookup O(1)
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final BrowseBackService service;

    public AnalyticsController(BrowseBackService service) {
        this.service = service;
    }

    /**
     * GET /api/analytics/summary — Resource totals, history totals, and visit statistics
     */
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary() {
        return ResponseEntity.ok(service.getAnalyticsSummary());
    }

    /**
     * GET /api/analytics/popular — Most-visited resources sorted using custom MergeSort (Unit III)
     */
    @GetMapping("/popular")
    public ResponseEntity<List<ResourceStats>> getPopularResources() {
        ResourceStats[] sorted = service.getMostVisitedResources();
        return ResponseEntity.ok(Arrays.asList(sorted));
    }

    /**
     * GET /api/analytics/performance — Empirical comparison of sequential search vs hash table lookup
     */
    @GetMapping("/performance")
    public ResponseEntity<PerformanceComparisonResponse> comparePerformance(
            @RequestParam(name = "url", required = false) String targetUrl) {
        PerformanceComparisonResponse comparison = service.comparePerformance(targetUrl);
        return ResponseEntity.ok(comparison);
    }
}
