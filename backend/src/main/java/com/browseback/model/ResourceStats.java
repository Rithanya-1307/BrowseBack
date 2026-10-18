package com.browseback.model;

/**
 * Encapsulates resource metadata and aggregate visit count.
 * Used by MergeSort (Unit III) to rank resources by frequency of access.
 */
public class ResourceStats {
    private final String url;
    private final String title;
    private final String category;
    private final int visitCount;
    private final String lastVisitedAt;

    public ResourceStats(String url, String title, String category, int visitCount, String lastVisitedAt) {
        this.url = url;
        this.title = title;
        this.category = category;
        this.visitCount = visitCount;
        this.lastVisitedAt = lastVisitedAt;
    }

    public String getUrl() {
        return url;
    }

    public String getTitle() {
        return title;
    }

    public String getCategory() {
        return category;
    }

    public int getVisitCount() {
        return visitCount;
    }

    public String getLastVisitedAt() {
        return lastVisitedAt;
    }

    @Override
    public String toString() {
        return String.format("%s (%s) — %d visits [Last: %s]", title, url, visitCount, lastVisitedAt);
    }
}
