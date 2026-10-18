package com.browseback.dto;

import com.browseback.model.HistoryRecord;

/**
 * DTO for Doubly Linked List node-level stepping navigation.
 * Explains how each node in the custom DoublyLinkedList connects to its predecessor and successor.
 */
public class HistoryNodeNavigationResponse {
    private final HistoryRecord currentRecord;
    private final HistoryRecord previousRecord;
    private final HistoryRecord nextRecord;
    private final boolean hasPrevious;
    private final boolean hasNext;
    private final int totalRecords;
    private final String explanation;

    public HistoryNodeNavigationResponse(
            HistoryRecord currentRecord,
            HistoryRecord previousRecord,
            HistoryRecord nextRecord,
            boolean hasPrevious,
            boolean hasNext,
            int totalRecords) {
        this.currentRecord = currentRecord;
        this.previousRecord = previousRecord;
        this.nextRecord = nextRecord;
        this.hasPrevious = hasPrevious;
        this.hasNext = hasNext;
        this.totalRecords = totalRecords;
        this.explanation = "Each node links to the previous and next record.";
    }

    public HistoryRecord getCurrentRecord() {
        return currentRecord;
    }

    public HistoryRecord getPreviousRecord() {
        return previousRecord;
    }

    public HistoryRecord getNextRecord() {
        return nextRecord;
    }

    public boolean isHasPrevious() {
        return hasPrevious;
    }

    public boolean isHasNext() {
        return hasNext;
    }

    public int getTotalRecords() {
        return totalRecords;
    }

    public String getExplanation() {
        return explanation;
    }
}
