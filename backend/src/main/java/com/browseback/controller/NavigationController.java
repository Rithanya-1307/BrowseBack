package com.browseback.controller;

import com.browseback.dto.NavigationStateResponse;
import com.browseback.dto.VisitRequest;
import com.browseback.model.HistoryRecord;
import com.browseback.service.BrowseBackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST API for Browser Navigation (Unit I CustomStack Back/Forward).
 */
@RestController
@RequestMapping("/api/navigation")
public class NavigationController {

    private final BrowseBackService service;

    public NavigationController(BrowseBackService service) {
        this.service = service;
    }

    /**
     * POST /api/navigation/visit — Open or record a resource visit
     */
    @PostMapping("/visit")
    public ResponseEntity<HistoryRecord> recordVisit(@Valid @RequestBody VisitRequest request) {
        HistoryRecord record = service.recordVisit(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(record);
    }

    /**
     * POST /api/navigation/back — Navigate backward in history using CustomStack (LIFO)
     * Does NOT increment visit counts.
     */
    @PostMapping("/back")
    public ResponseEntity<HistoryRecord> navigateBack() {
        if (!service.canGoBack()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        HistoryRecord prev = service.goBack();
        return ResponseEntity.ok(prev);
    }

    /**
     * POST /api/navigation/forward — Navigate forward in history using CustomStack (LIFO)
     * Does NOT increment visit counts.
     */
    @PostMapping("/forward")
    public ResponseEntity<HistoryRecord> navigateForward() {
        if (!service.canGoForward()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        HistoryRecord next = service.goForward();
        return ResponseEntity.ok(next);
    }

    /**
     * GET /api/navigation/current — Retrieve current resource and navigation stack metrics
     */
    @GetMapping("/current")
    public ResponseEntity<NavigationStateResponse> getCurrentNavigationState() {
        return ResponseEntity.ok(service.getNavigationState());
    }
}
