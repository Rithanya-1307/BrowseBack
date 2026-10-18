package com.browseback.controller;

import com.browseback.dto.ExactLookupResponse;
import com.browseback.dto.SearchResponse;
import com.browseback.service.BrowseBackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST API for Search operations:
 * - Unit II: SequentialSearch across browsing history records
 * - Unit III: CustomHashTable exact O(1) URL lookup
 */
@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final BrowseBackService service;

    public SearchController(BrowseBackService service) {
        this.service = service;
    }

    /**
     * GET /api/search?q={keyword} — Sequential search by title or URL keyword
     */
    @GetMapping
    public ResponseEntity<SearchResponse> search(@RequestParam(name = "q", defaultValue = "") String keyword) {
        SearchResponse response = service.searchHistoryByKeyword(keyword);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/search/url?url={encodedUrl} — Exact URL lookup using CustomHashTable
     */
    @GetMapping("/url")
    public ResponseEntity<ExactLookupResponse> exactUrlLookup(@RequestParam("url") String targetUrl) {
        ExactLookupResponse response = service.exactUrlLookup(targetUrl);
        return ResponseEntity.ok(response);
    }
}
