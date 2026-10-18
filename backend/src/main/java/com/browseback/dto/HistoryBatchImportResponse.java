package com.browseback.dto;

import com.browseback.model.HistoryRecord;
import java.util.List;

/**
 * Response payload returning the summary results of a batch history import operation.
 */
public class HistoryBatchImportResponse {

    private int totalReceived;
    private int importedCount;
    private int duplicateCount;
    private int totalHistoryRecords;
    private String message;
    private List<HistoryRecord> sampleImported;

    public HistoryBatchImportResponse() {}

    public HistoryBatchImportResponse(int totalReceived, int importedCount, int duplicateCount,
                                      int totalHistoryRecords, String message, List<HistoryRecord> sampleImported) {
        this.totalReceived = totalReceived;
        this.importedCount = importedCount;
        this.duplicateCount = duplicateCount;
        this.totalHistoryRecords = totalHistoryRecords;
        this.message = message;
        this.sampleImported = sampleImported;
    }

    public int getTotalReceived() {
        return totalReceived;
    }

    public void setTotalReceived(int totalReceived) {
        this.totalReceived = totalReceived;
    }

    public int getImportedCount() {
        return importedCount;
    }

    public void setImportedCount(int importedCount) {
        this.importedCount = importedCount;
    }

    public int getDuplicateCount() {
        return duplicateCount;
    }

    public void setDuplicateCount(int duplicateCount) {
        this.duplicateCount = duplicateCount;
    }

    public int getTotalHistoryRecords() {
        return totalHistoryRecords;
    }

    public void setTotalHistoryRecords(int totalHistoryRecords) {
        this.totalHistoryRecords = totalHistoryRecords;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<HistoryRecord> getSampleImported() {
        return sampleImported;
    }

    public void setSampleImported(List<HistoryRecord> sampleImported) {
        this.sampleImported = sampleImported;
    }
}
