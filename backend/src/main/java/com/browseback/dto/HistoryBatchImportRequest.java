package com.browseback.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * Request payload for importing a batch of browsing history records
 * from Google Chrome.
 */
public class HistoryBatchImportRequest {

    private List<HistoryImportItem> items;

    private String defaultSource = "chrome";

    public HistoryBatchImportRequest() {}

    public HistoryBatchImportRequest(List<HistoryImportItem> items, String defaultSource) {
        this.items = items;
        this.defaultSource = defaultSource != null ? defaultSource : "chrome";
    }

    public List<HistoryImportItem> getItems() {
        return items;
    }

    public void setItems(List<HistoryImportItem> items) {
        this.items = items;
    }

    public String getDefaultSource() {
        return defaultSource;
    }

    public void setDefaultSource(String defaultSource) {
        this.defaultSource = defaultSource;
    }
}
