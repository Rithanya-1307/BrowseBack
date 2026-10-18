package com.browseback.dto;

import com.browseback.model.HistoryRecord;
import java.util.List;

public class SearchResponse {
    private String query;
    private int matchCount;
    private int comparisonCount;
    private long durationNano;
    private String timeComplexity;
    private List<HistoryRecord> matches;

    public SearchResponse() {}

    public SearchResponse(String query, int matchCount, int comparisonCount, long durationNano,
                          String timeComplexity, List<HistoryRecord> matches) {
        this.query = query;
        this.matchCount = matchCount;
        this.comparisonCount = comparisonCount;
        this.durationNano = durationNano;
        this.timeComplexity = timeComplexity;
        this.matches = matches;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public int getMatchCount() {
        return matchCount;
    }

    public void setMatchCount(int matchCount) {
        this.matchCount = matchCount;
    }

    public int getComparisonCount() {
        return comparisonCount;
    }

    public void setComparisonCount(int comparisonCount) {
        this.comparisonCount = comparisonCount;
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

    public List<HistoryRecord> getMatches() {
        return matches;
    }

    public void setMatches(List<HistoryRecord> matches) {
        this.matches = matches;
    }
}
