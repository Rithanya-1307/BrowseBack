package com.browseback.dto;

import com.browseback.model.Resource;

public class ExactLookupResponse {
    private String url;
    private boolean found;
    private int visitCount;
    private String firstVisitedAt;
    private String lastVisitedAt;
    private int comparisons;
    private long durationNano;
    private String timeComplexity;
    private Resource linkedResource;

    public ExactLookupResponse() {}

    public ExactLookupResponse(String url, boolean found, int visitCount, String firstVisitedAt,
                               String lastVisitedAt, int comparisons, long durationNano,
                               String timeComplexity, Resource linkedResource) {
        this.url = url;
        this.found = found;
        this.visitCount = visitCount;
        this.firstVisitedAt = firstVisitedAt;
        this.lastVisitedAt = lastVisitedAt;
        this.comparisons = comparisons;
        this.durationNano = durationNano;
        this.timeComplexity = timeComplexity;
        this.linkedResource = linkedResource;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public boolean isFound() {
        return found;
    }

    public void setFound(boolean found) {
        this.found = found;
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

    public void setFirstVisitedAt(String firstVisitedAt) {
        this.firstVisitedAt = firstVisitedAt;
    }

    public String getLastVisitedAt() {
        return lastVisitedAt;
    }

    public void setLastVisitedAt(String lastVisitedAt) {
        this.lastVisitedAt = lastVisitedAt;
    }

    public int getComparisons() {
        return comparisons;
    }

    public void setComparisons(int comparisons) {
        this.comparisons = comparisons;
    }

    public long getDurationNano() {
        return durationNano;
    }

    public void setDurationNano(long durationNano) {
        this.durationNano = durationNano;
    }

    public String getTimeComplexity() {
        return timeComplexity;
    }

    public void setTimeComplexity(String timeComplexity) {
        this.timeComplexity = timeComplexity;
    }

    public Resource getLinkedResource() {
        return linkedResource;
    }

    public void setLinkedResource(Resource linkedResource) {
        this.linkedResource = linkedResource;
    }
}
