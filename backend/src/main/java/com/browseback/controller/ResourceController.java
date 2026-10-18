package com.browseback.controller;

import com.browseback.dto.CreateResourceRequest;
import com.browseback.dto.UpdateResourceRequest;
import com.browseback.model.Resource;
import com.browseback.service.BrowseBackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for Curated Research Resources (Bookmarks Library).
 */
@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final BrowseBackService service;

    public ResourceController(BrowseBackService service) {
        this.service = service;
    }

    /**
     * GET /api/resources — Retrieve all saved resources
     */
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(service.getAllResources());
    }

    /**
     * POST /api/resources — Add a new curated resource
     */
    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody CreateResourceRequest request) {
        Resource created = service.addResource(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/resources/{id} — Retrieve one resource by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable("id") String id) {
        Resource resource = service.getResourceById(id);
        if (resource == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(resource);
    }

    /**
     * PUT /api/resources/{id} — Update an existing resource
     */
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable("id") String id,
                                                   @RequestBody UpdateResourceRequest request) {
        Resource updated = service.updateResource(id, request);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/resources/{id} — Delete a saved resource
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable("id") String id) {
        boolean deleted = service.deleteResource(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/resources/reset — Reset database and DSA structures to default sample set
     */
    @PostMapping("/reset")
    public ResponseEntity<Void> resetToSampleData() {
        service.resetDatabaseToSampleData();
        return ResponseEntity.ok().build();
    }
}

