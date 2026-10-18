package com.browseback.model;

/**
 * Node structure for the DoublyLinkedList (Unit II).
 * Holds the HistoryRecord payload along with previous and next pointers.
 */
public class HistoryNode {
    private HistoryRecord record;
    private HistoryNode prev;
    private HistoryNode next;

    public HistoryNode(HistoryRecord record) {
        this.record = record;
        this.prev = null;
        this.next = null;
    }

    public HistoryRecord getRecord() {
        return record;
    }

    public void setRecord(HistoryRecord record) {
        this.record = record;
    }

    public HistoryNode getPrev() {
        return prev;
    }

    public void setPrev(HistoryNode prev) {
        this.prev = prev;
    }

    public HistoryNode getNext() {
        return next;
    }

    public void setNext(HistoryNode next) {
        this.next = next;
    }
}
