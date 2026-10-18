package com.browseback.controller;

import com.browseback.model.HistoryRecord;
import com.browseback.service.BrowseBackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for Browsing History (Unit II DoublyLinkedList).
 */
@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final BrowseBackService service;

    public HistoryController(BrowseBackService service) {
        this.service = service;
    }

    /**
     * GET /api/history?sort=newest|oldest — Retrieve browsing history sorted using custom Merge Sort
     */
    @GetMapping
    public ResponseEntity<List<HistoryRecord>> getHistory(
            @RequestParam(value = "sort", required = false, defaultValue = "newest") String sortOrder) {
        return ResponseEntity.ok(service.getSortedHistory(sortOrder));
    }

    /**
     * GET /api/history/node?id={id} — Inspect previous and next nodes in DoublyLinkedList
     */
    @GetMapping("/node")
    public ResponseEntity<com.browseback.dto.HistoryNodeNavigationResponse> getNodeNavigation(
            @RequestParam(value = "id", required = false) String id) {
        return ResponseEntity.ok(service.getNodeNavigation(id));
    }

    /**
     * DELETE /api/history/{id} — Delete one history record and synchronize the hash table
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistoryItem(@PathVariable("id") String id) {
        boolean deleted = service.deleteHistoryRecord(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/history/import — Batch import Google Chrome browsing history
     */
    @PostMapping("/import")
    public ResponseEntity<com.browseback.dto.HistoryBatchImportResponse> importHistoryBatch(
            @RequestBody com.browseback.dto.HistoryBatchImportRequest request) {
        com.browseback.dto.HistoryBatchImportResponse response = service.importHistoryBatch(request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/history/sync-summary — Retrieve Chrome sync statistics vs direct visits
     */
    @GetMapping("/sync-summary")
    public ResponseEntity<com.browseback.dto.ChromeSyncSummaryResponse> getSyncSummary() {
        return ResponseEntity.ok(service.getChromeSyncSummary());
    }

    /**
     * DELETE /api/history — Clear all browsing history
     */
    @DeleteMapping
    public ResponseEntity<Void> clearHistory() {
        service.clearHistory();
        return ResponseEntity.noContent().build();
    }
}

