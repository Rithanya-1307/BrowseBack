package com.browseback.dto;

/**
 * Summary DTO reporting statistics specifically for imported Chrome history vs direct application visits.
 */
public class ChromeSyncSummaryResponse {

    private long totalHistoryRecords;
    private long chromeHistoryRecords;
    private long browseBackRecords;
    private String lastImportedTimestamp;
    private boolean extensionReady;

    public ChromeSyncSummaryResponse() {}

    public ChromeSyncSummaryResponse(long totalHistoryRecords, long chromeHistoryRecords,
                                     long browseBackRecords, String lastImportedTimestamp,
                                     boolean extensionReady) {
        this.totalHistoryRecords = totalHistoryRecords;
        this.chromeHistoryRecords = chromeHistoryRecords;
        this.browseBackRecords = browseBackRecords;
        this.lastImportedTimestamp = lastImportedTimestamp;
        this.extensionReady = extensionReady;
    }

    public long getTotalHistoryRecords() {
        return totalHistoryRecords;
    }

    public void setTotalHistoryRecords(long totalHistoryRecords) {
        this.totalHistoryRecords = totalHistoryRecords;
    }

    public long getChromeHistoryRecords() {
        return chromeHistoryRecords;
    }

    public void setChromeHistoryRecords(long chromeHistoryRecords) {
        this.chromeHistoryRecords = chromeHistoryRecords;
    }

    public long getBrowseBackRecords() {
        return browseBackRecords;
    }

    public void setBrowseBackRecords(long browseBackRecords) {
        this.browseBackRecords = browseBackRecords;
    }

    public String getLastImportedTimestamp() {
        return lastImportedTimestamp;
    }

    public void setLastImportedTimestamp(String lastImportedTimestamp) {
        this.lastImportedTimestamp = lastImportedTimestamp;
    }

    public boolean isExtensionReady() {
        return extensionReady;
    }

    public void setExtensionReady(boolean extensionReady) {
        this.extensionReady = extensionReady;
    }
}
