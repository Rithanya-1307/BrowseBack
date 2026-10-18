package com.browseback.dto;

import jakarta.validation.constraints.NotBlank;

public class VisitRequest {

    @NotBlank(message = "URL is required")
    private String url;

    private String title;
    private String category;
    private String resourceId;
    private String source;

    public VisitRequest() {}

    public VisitRequest(String url, String title, String category, String resourceId, String source) {
        this.url = url;
        this.title = title;
        this.category = category;
        this.resourceId = resourceId;
        this.source = source;
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

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
