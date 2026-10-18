package com.browseback.model;

/**
 * Entry structure for CustomHashTable (Unit III) with separate chaining.
 * Contains URL key, visit count, first-visited and last-visited timestamps,
 * and a reference to the next entry in the bucket collision chain.
 */
public class HashEntry {
    private final String url;
    private int visitCount;
    private final String firstVisitedAt;
    private String lastVisitedAt;
    private HashEntry next;

    public HashEntry(String url, String firstVisitedAt) {
        this.url = url;
        this.visitCount = 1;
        this.firstVisitedAt = firstVisitedAt;
        this.lastVisitedAt = firstVisitedAt;
        this.next = null;
    }

    public void incrementVisitCount(String timestamp) {
        this.visitCount++;
        this.lastVisitedAt = timestamp;
    }

    public String getUrl() {
        return url;
    }

    public int getVisitCount() {
        return visitCount;
    }

    public void setVisitCount(int visitCount) {
        this.visitCount = visitCount;
    }

    public String getFirstVisitedAt() {
        return firstVisitedAt;
    }

    public String getLastVisitedAt() {
        return lastVisitedAt;
    }

    public void setLastVisitedAt(String lastVisitedAt) {
        this.lastVisitedAt = lastVisitedAt;
    }

    public HashEntry getNext() {
        return next;
    }

    public void setNext(HashEntry next) {
        this.next = next;
    }

    @Override
    public String toString() {
        return String.format("%s [Visits: %d, First: %s, Last: %s]", url, visitCount, firstVisitedAt, lastVisitedAt);
    }
}
