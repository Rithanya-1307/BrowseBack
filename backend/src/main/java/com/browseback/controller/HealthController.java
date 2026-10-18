package com.browseback.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health check endpoint for frontend connection verification.
 */
@RestController
public class HealthController {

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "app", "BrowseBack — Smart Web Research Manager",
                "version", "1.0.0",
                "dsaEngine", "Active (Units I, II, III)"
        ));
    }
}
