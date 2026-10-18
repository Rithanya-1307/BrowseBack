package com.browseback.model;

/**
 * Represents a single visit entry in the web browsing history.
 * Contains URL, page title, category, visit timestamp, and unique record ID,
 * along with optional duration and source metadata matching the frontend model.
 */
public class HistoryRecord {
    private final String id;
    private final String resourceId;
    private final String url;
    private final String title;
    private final String category;
    private final String timestamp;
    private final Integer durationSeconds;
    private final String source;

    public HistoryRecord(String id, String url, String title, String category, String timestamp) {
        this(id, null, url, title, category, timestamp, null, "direct");
    }

    public HistoryRecord(String id, String resourceId, String url, String title, String category,
                         String timestamp, Integer durationSeconds, String source) {
        this.id = id;
        this.resourceId = resourceId;
        this.url = url;
        this.title = title;
        this.category = category;
        this.timestamp = timestamp;
        this.durationSeconds = durationSeconds;
        this.source = source != null ? source : "direct";
    }

    public String getId() {
        return id;
    }

    public String getResourceId() {
        return resourceId;
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

    public String getTimestamp() {
        return timestamp;
    }

    /**
     * Alias for timestamp to match React frontend's visitedAt field in JSON serialization.
     */
    public String getVisitedAt() {
        return timestamp;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public String getSource() {
        return source;
    }

    @Override
    public String toString() {
        return String.format("[%s] %s | %s (%s) @ %s", id, title, url, category, timestamp);
    }
}
