package com.browseback.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CreateResourceRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "URL is required")
    private String url;

    private String category;
    private List<String> tags;
    private String notes;
    private Boolean isPinned;

    public CreateResourceRequest() {}

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
        this.tags = tags;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getIsPinned() {
        return isPinned;
    }

    public void setIsPinned(Boolean isPinned) {
        this.isPinned = isPinned;
    }
}
