package com.browseback.dto;

import java.util.Map;

public class AnalyticsSummaryResponse {
    private int totalResources;
    private int totalHistoryRecords;
    private int totalUniqueUrls;
    private int totalVisits;
    private int backStackSize;
    private int forwardStackSize;
    private Map<String, Integer> categoryDistribution;

    public AnalyticsSummaryResponse() {}

    public AnalyticsSummaryResponse(int totalResources, int totalHistoryRecords, int totalUniqueUrls,
                                    int totalVisits, int backStackSize, int forwardStackSize,
                                    Map<String, Integer> categoryDistribution) {
        this.totalResources = totalResources;
        this.totalHistoryRecords = totalHistoryRecords;
        this.totalUniqueUrls = totalUniqueUrls;
        this.totalVisits = totalVisits;
        this.backStackSize = backStackSize;
        this.forwardStackSize = forwardStackSize;
        this.categoryDistribution = categoryDistribution;
    }

    public int getTotalResources() {
        return totalResources;
    }

    public void setTotalResources(int totalResources) {
        this.totalResources = totalResources;
    }

    public int getTotalHistoryRecords() {
        return totalHistoryRecords;
    }

    public void setTotalHistoryRecords(int totalHistoryRecords) {
        this.totalHistoryRecords = totalHistoryRecords;
    }

    public int getTotalUniqueUrls() {
        return totalUniqueUrls;
    }

    public void setTotalUniqueUrls(int totalUniqueUrls) {
        this.totalUniqueUrls = totalUniqueUrls;
    }

    public int getTotalVisits() {
        return totalVisits;
    }

    public void setTotalVisits(int totalVisits) {
        this.totalVisits = totalVisits;
    }

    public int getBackStackSize() {
        return backStackSize;
    }

    public void setBackStackSize(int backStackSize) {
        this.backStackSize = backStackSize;
    }

    public int getForwardStackSize() {
        return forwardStackSize;
    }

    public void setForwardStackSize(int forwardStackSize) {
        this.forwardStackSize = forwardStackSize;
    }

    public Map<String, Integer> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(Map<String, Integer> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }
}
