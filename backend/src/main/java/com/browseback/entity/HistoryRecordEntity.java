package com.browseback.entity;

import com.browseback.model.HistoryRecord;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * JPA Entity for persistent storage of browsing history records.
 * Stored in file-based H2 database to survive application restarts.
 */
@Entity
@Table(name = "history_records")
public class HistoryRecordEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(length = 64)
    private String resourceId;

    @Column(nullable = false, length = 1024)
    private String url;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 100)
    private String category;

    @Column(nullable = false, length = 64)
    private String timestamp;

    private Integer durationSeconds;

    @Column(length = 64)
    private String source;

    public HistoryRecordEntity() {}

    public HistoryRecordEntity(String id, String resourceId, String url, String title,
                               String category, String timestamp, Integer durationSeconds, String source) {
        this.id = truncate(id, 64);
        this.resourceId = truncate(resourceId, 64);
        this.url = truncate(url != null ? url : "about:blank", 1024);
        this.title = truncate(title != null && !title.trim().isEmpty() ? title.trim() : (url != null ? url : "Untitled"), 255);
        this.category = truncate(category, 100);
        this.timestamp = truncate(timestamp != null ? timestamp : java.time.Instant.now().toString(), 64);
        this.durationSeconds = durationSeconds;
        this.source = truncate(source != null ? source : "direct", 64);
    }

    public static HistoryRecordEntity fromDomain(HistoryRecord domain) {
        if (domain == null) return null;
        return new HistoryRecordEntity(
                domain.getId(),
                domain.getResourceId(),
                domain.getUrl(),
                domain.getTitle(),
                domain.getCategory(),
                domain.getTimestamp(),
                domain.getDurationSeconds(),
                domain.getSource()
        );
    }

    private static String truncate(String val, int maxLen) {
        if (val == null) return null;
        return val.length() > maxLen ? val.substring(0, maxLen) : val;
    }

    public HistoryRecord toDomain() {
        return new HistoryRecord(
                this.id,
                this.resourceId,
                this.url,
                this.title,
                this.category,
                this.timestamp,
                this.durationSeconds,
                this.source
        );
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = truncate(resourceId, 64);
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = truncate(url != null ? url : "about:blank", 1024);
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = truncate(title != null && !title.trim().isEmpty() ? title.trim() : "Untitled", 255);
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = truncate(category, 100);
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = truncate(timestamp, 64);
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = truncate(source != null ? source : "direct", 64);
    }
}
