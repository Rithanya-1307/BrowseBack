package com.browseback.dsa;

import com.browseback.model.HistoryNode;
import com.browseback.model.HistoryRecord;

/**
 * Unit II: Sequential (Linear) Search Algorithm for Browsing History.
 *
 * Algorithm Concept:
 * Sequential search iterates through elements one by one from beginning to end,
 * comparing each candidate record against the search criteria.
 *
 * Time Complexity:
 * - Best Case: O(1) if target is the very first element (for single-item search)
 * - Average Case: O(N) where N is the total number of history records
 * - Worst Case: O(N) when scanning all records to return ALL matches
 * Space Complexity: O(M) where M is the count of matching records returned.
 *
 * Features:
 * - Case-insensitive matching
 * - Supports searching by Page Title, URL, or General Keyword (Title OR URL OR Category)
 * - Returns all matching records (not just the first one)
 * - Tracks comparison count for empirical algorithmic benchmarking against CustomHashTable
 */
public class SequentialSearch {

    /**
     * Holds search results along with metrics for algorithmic analysis.
     */
    public static class SearchResult {
        private final HistoryRecord[] matches;
        private final int comparisonCount;
        private final long durationNano;

        public SearchResult(HistoryRecord[] matches, int comparisonCount, long durationNano) {
            this.matches = matches;
            this.comparisonCount = comparisonCount;
            this.durationNano = durationNano;
        }

        public HistoryRecord[] getMatches() {
            return matches;
        }

        public int getMatchCount() {
            return matches.length;
        }

        public int getComparisonCount() {
            return comparisonCount;
        }

        public long getDurationNano() {
            return durationNano;
        }

        @Override
        public String toString() {
            return String.format("Found %d matches in %d comparisons (%d ns)",
                    matches.length, comparisonCount, durationNano);
        }
    }

    /**
     * Searches history records by page title (case-insensitive substring match).
     *
     * @param records array of history records
     * @param query title substring to search for
     * @return SearchResult with matching records and comparison count
     */
    public static SearchResult searchByTitle(HistoryRecord[] records, String query) {
        if (records == null || records.length == 0 || query == null || query.trim().isEmpty()) {
            return new SearchResult(new HistoryRecord[0], 0, 0);
        }

        long startTime = System.nanoTime();
        String normalizedQuery = query.trim().toLowerCase();
        int comparisonCount = 0;

        // Pass 1: Count matches to size the destination array without using ArrayList
        int matchCount = 0;
        for (HistoryRecord record : records) {
            comparisonCount++;
            if (record != null && record.getTitle() != null &&
                    record.getTitle().toLowerCase().contains(normalizedQuery)) {
                matchCount++;
            }
        }

        // Pass 2: Populate results
        HistoryRecord[] matches = new HistoryRecord[matchCount];
        int index = 0;
        for (HistoryRecord record : records) {
            if (record != null && record.getTitle() != null &&
                    record.getTitle().toLowerCase().contains(normalizedQuery)) {
                matches[index++] = record;
            }
        }

        long duration = System.nanoTime() - startTime;
        return new SearchResult(matches, comparisonCount, duration);
    }

    /**
     * Searches history records by exact or partial URL (case-insensitive).
     *
     * @param records array of history records
     * @param query URL substring to search for
     * @return SearchResult with matching records and comparison count
     */
    public static SearchResult searchByUrl(HistoryRecord[] records, String query) {
        if (records == null || records.length == 0 || query == null || query.trim().isEmpty()) {
            return new SearchResult(new HistoryRecord[0], 0, 0);
        }

        long startTime = System.nanoTime();
        String normalizedQuery = query.trim().toLowerCase();
        int comparisonCount = 0;

        int matchCount = 0;
        for (HistoryRecord record : records) {
            comparisonCount++;
            if (record != null && record.getUrl() != null &&
                    record.getUrl().toLowerCase().contains(normalizedQuery)) {
                matchCount++;
            }
        }

        HistoryRecord[] matches = new HistoryRecord[matchCount];
        int index = 0;
        for (HistoryRecord record : records) {
            if (record != null && record.getUrl() != null &&
                    record.getUrl().toLowerCase().contains(normalizedQuery)) {
                matches[index++] = record;
            }
        }

        long duration = System.nanoTime() - startTime;
        return new SearchResult(matches, comparisonCount, duration);
    }

    /**
     * Searches history records by keyword matching title, URL, or category.
     *
     * @param records array of history records
     * @param keyword search keyword
     * @return SearchResult with matching records and comparison count
     */
    public static SearchResult searchByKeyword(HistoryRecord[] records, String keyword) {
        if (records == null || records.length == 0 || keyword == null || keyword.trim().isEmpty()) {
            return new SearchResult(new HistoryRecord[0], 0, 0);
        }

        long startTime = System.nanoTime();
        String normalizedKeyword = keyword.trim().toLowerCase();
        int comparisonCount = 0;

        int matchCount = 0;
        for (HistoryRecord record : records) {
            comparisonCount++;
            if (matchesKeyword(record, normalizedKeyword)) {
                matchCount++;
            }
        }

        HistoryRecord[] matches = new HistoryRecord[matchCount];
        int index = 0;
        for (HistoryRecord record : records) {
            if (matchesKeyword(record, normalizedKeyword)) {
                matches[index++] = record;
            }
        }

        long duration = System.nanoTime() - startTime;
        return new SearchResult(matches, comparisonCount, duration);
    }

    /**
     * Overload: Performs keyword search directly on a DoublyLinkedList of history records.
     *
     * @param list doubly linked list of browsing history
     * @param keyword search keyword
     * @return SearchResult with matches and metrics
     */
    public static SearchResult searchByKeyword(DoublyLinkedList list, String keyword) {
        if (list == null || list.isEmpty() || keyword == null || keyword.trim().isEmpty()) {
            return new SearchResult(new HistoryRecord[0], 0, 0);
        }

        long startTime = System.nanoTime();
        String normalizedKeyword = keyword.trim().toLowerCase();
        int comparisonCount = 0;
        int matchCount = 0;

        // Pass 1: count matches
        HistoryNode current = list.getHead();
        while (current != null) {
            comparisonCount++;
            if (matchesKeyword(current.getRecord(), normalizedKeyword)) {
                matchCount++;
            }
            current = current.getNext();
        }

        // Pass 2: populate matches
        HistoryRecord[] matches = new HistoryRecord[matchCount];
        int index = 0;
        current = list.getHead();
        while (current != null) {
            if (matchesKeyword(current.getRecord(), normalizedKeyword)) {
                matches[index++] = current.getRecord();
            }
            current = current.getNext();
        }

        long duration = System.nanoTime() - startTime;
        return new SearchResult(matches, comparisonCount, duration);
    }

    /**
     * Checks if a history record contains the normalized keyword in title, URL, or category.
     */
    private static boolean matchesKeyword(HistoryRecord record, String normalizedKeyword) {
        if (record == null) {
            return false;
        }
        boolean titleMatch = record.getTitle() != null && record.getTitle().toLowerCase().contains(normalizedKeyword);
        boolean urlMatch = record.getUrl() != null && record.getUrl().toLowerCase().contains(normalizedKeyword);
        boolean categoryMatch = record.getCategory() != null && record.getCategory().toLowerCase().contains(normalizedKeyword);

        return titleMatch || urlMatch || categoryMatch;
    }
}
