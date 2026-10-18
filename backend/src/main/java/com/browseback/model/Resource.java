package com.browseback.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a curated research resource / bookmark in the library.
 * Kept conceptually separate from raw browsing history visits.
 */
public class Resource {
    private String id;
    private String title;
    private String url;
    private String category;
    private List<String> tags;
    private String notes;
    private int visitCount;
    private String createdAt;
    private String lastVisitedAt;
    private boolean isPinned;

    public Resource() {
        this.tags = new ArrayList<>();
    }

    public Resource(String id, String title, String url, String category, List<String> tags,
                    String notes, int visitCount, String createdAt, String lastVisitedAt, boolean isPinned) {
        this.id = id;
        this.title = title;
        this.url = url;
        this.category = category != null ? category : "General";
        this.tags = tags != null ? new ArrayList<>(tags) : new ArrayList<>();
        this.notes = notes != null ? notes : "";
        this.visitCount = visitCount;
        this.createdAt = createdAt;
        this.lastVisitedAt = lastVisitedAt;
        this.isPinned = isPinned;
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

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags != null ? new ArrayList<>(tags) : new ArrayList<>();
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

    @com.fasterxml.jackson.annotation.JsonProperty("isPinned")
    public boolean isPinned() {
        return isPinned;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("isPinned")
    public boolean getIsPinned() {
        return isPinned;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("isPinned")
    public void setPinned(boolean pinned) {
        isPinned = pinned;
    }

    @Override
    public String toString() {
        return String.format("[%s] %s (%s) — %d visits", id, title, url, visitCount);
    }
}
