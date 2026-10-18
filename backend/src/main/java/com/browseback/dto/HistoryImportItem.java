package com.browseback.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Data transfer object representing a single browsing history entry
 * imported from Google Chrome or an external browser extension.
 */
public class HistoryImportItem {

    private String url;

    private String title;
    private String category;
    private String timestamp;
    private Integer visitCount;
    private Integer durationSeconds;
    private String source;

    public HistoryImportItem() {}

    public HistoryImportItem(String url, String title, String category, String timestamp,
                             Integer visitCount, Integer durationSeconds, String source) {
        this.url = url;
        this.title = title;
        this.category = category;
        this.timestamp = timestamp;
        this.visitCount = visitCount;
        this.durationSeconds = durationSeconds;
        this.source = source != null ? source : "chrome";
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getVisitCount() {
        return visitCount;
    }

    public void setVisitCount(Integer visitCount) {
        this.visitCount = visitCount;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public String getSource() {
        return source != null ? source : "chrome";
    }

    public void setSource(String source) {
        this.source = source;
    }
}
