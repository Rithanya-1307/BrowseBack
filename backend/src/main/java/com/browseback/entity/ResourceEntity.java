package com.browseback.entity;

import com.browseback.model.Resource;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JPA Entity for persistent storage of curated research bookmarks.
 * Stored in file-based H2 database to survive application restarts.
 */
@Entity
@Table(name = "resources")
public class ResourceEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 1024)
    private String url;

    @Column(length = 100)
    private String category;

    @Column(length = 1000)
    private String tags;

    @Column(length = 2500)
    private String notes;

    private int visitCount;

    @Column(length = 64)
    private String createdAt;

    @Column(length = 64)
    private String lastVisitedAt;

    private boolean isPinned;

    public ResourceEntity() {}

    public ResourceEntity(String id, String title, String url, String category, String tags,
                          String notes, int visitCount, String createdAt, String lastVisitedAt, boolean isPinned) {
        this.id = id;
        this.title = title;
        this.url = url;
        this.category = category;
        this.tags = tags;
        this.notes = notes;
        this.visitCount = visitCount;
        this.createdAt = createdAt;
        this.lastVisitedAt = lastVisitedAt;
        this.isPinned = isPinned;
    }

    public static ResourceEntity fromDomain(Resource domain) {
        if (domain == null) return null;
        String tagsJoined = (domain.getTags() != null)
                ? String.join(",", domain.getTags())
                : "";

        return new ResourceEntity(
                domain.getId(),
                domain.getTitle(),
                domain.getUrl(),
                domain.getCategory(),
                tagsJoined,
                domain.getNotes(),
                domain.getVisitCount(),
                domain.getCreatedAt(),
                domain.getLastVisitedAt(),
                domain.isPinned()
        );
    }

    public Resource toDomain() {
        List<String> tagList = new ArrayList<>();
        if (this.tags != null && !this.tags.trim().isEmpty()) {
            tagList = Arrays.stream(this.tags.split(","))
                    .map(String::trim)
                    .filter(t -> !t.isEmpty())
                    .collect(Collectors.toList());
        }

        return new Resource(
                this.id,
                this.title,
                this.url,
                this.category,
                tagList,
                this.notes,
                this.visitCount,
                this.createdAt,
                this.lastVisitedAt,
                this.isPinned
        );
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public int getVisitCount() {
        return visitCount;
    }

    public void setVisitCount(int visitCount) {
        this.visitCount = visitCount;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getLastVisitedAt() {
        return lastVisitedAt;
    }

    public void setLastVisitedAt(String lastVisitedAt) {
        this.lastVisitedAt = lastVisitedAt;
    }

    public boolean isPinned() {
        return isPinned;
    }

    public void setPinned(boolean pinned) {
        isPinned = pinned;
    }
}
