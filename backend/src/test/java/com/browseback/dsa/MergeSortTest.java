package com.browseback.dsa;

import com.browseback.model.ResourceStats;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit III: MergeSort Tests")
public class MergeSortTest {

    @Test
    @DisplayName("Sorting null or empty array returns safely without errors")
    void testEmptyAndNullArray() {
        ResourceStats[] nullResult = MergeSort.sortByVisitCount(null);
        assertNotNull(nullResult);
        assertEquals(0, nullResult.length);

        ResourceStats[] emptyResult = MergeSort.sortByVisitCount(new ResourceStats[0]);
        assertNotNull(emptyResult);
        assertEquals(0, emptyResult.length);
    }

    @Test
    @DisplayName("Single-element array returns array of length 1")
    void testSingleElement() {
        ResourceStats[] single = new ResourceStats[] {
                new ResourceStats("https://a.com", "A", "Cat", 10, "t1")
        };
        ResourceStats[] sorted = MergeSort.sortByVisitCount(single);
        assertEquals(1, sorted.length);
        assertEquals(10, sorted[0].getVisitCount());
    }

    @Test
    @DisplayName("Sorts resources in strictly descending order of visit count")
    void testDescendingSort() {
        ResourceStats[] input = new ResourceStats[] {
                new ResourceStats("https://a.com", "A", "Cat", 5, "t1"),
                new ResourceStats("https://b.com", "B", "Cat", 42, "t2"),
                new ResourceStats("https://c.com", "C", "Cat", 18, "t3"),
                new ResourceStats("https://d.com", "D", "Cat", 1, "t4"),
                new ResourceStats("https://e.com", "E", "Cat", 30, "t5")
        };

        ResourceStats[] sorted = MergeSort.sortByVisitCount(input);

        assertEquals(5, sorted.length);
        assertEquals(42, sorted[0].getVisitCount());
        assertEquals("B", sorted[0].getTitle());

        assertEquals(30, sorted[1].getVisitCount());
        assertEquals("E", sorted[1].getTitle());

        assertEquals(18, sorted[2].getVisitCount());
        assertEquals("C", sorted[2].getTitle());

        assertEquals(5, sorted[3].getVisitCount());
        assertEquals("A", sorted[3].getTitle());

        assertEquals(1, sorted[4].getVisitCount());
        assertEquals("D", sorted[4].getTitle());
    }

    @Test
    @DisplayName("Preserves original relative order when visit counts are identical (Stability)")
    void testStabilityWithRepeatedCounts() {
        ResourceStats r1 = new ResourceStats("https://1.com", "First Item (count=10)", "Cat", 10, "t1");
        ResourceStats r2 = new ResourceStats("https://2.com", "High Item (count=25)", "Cat", 25, "t2");
        ResourceStats r3 = new ResourceStats("https://3.com", "Second Item (count=10)", "Cat", 10, "t3");
        ResourceStats r4 = new ResourceStats("https://4.com", "Third Item (count=10)", "Cat", 10, "t4");

        ResourceStats[] input = new ResourceStats[] { r1, r2, r3, r4 };
        ResourceStats[] sorted = MergeSort.sortByVisitCount(input);

        assertEquals(4, sorted.length);
        assertEquals("High Item (count=25)", sorted[0].getTitle());

        // For the 3 items with equal visitCount=10, stability requires preserving order r1 -> r3 -> r4
        assertEquals("First Item (count=10)", sorted[1].getTitle());
        assertEquals("Second Item (count=10)", sorted[2].getTitle());
        assertEquals("Third Item (count=10)", sorted[3].getTitle());
    }

    @Test
    @DisplayName("Original array data is preserved and not mutated")
    void testOriginalArrayPreserved() {
        ResourceStats[] input = new ResourceStats[] {
                new ResourceStats("https://low.com", "Low", "Cat", 2, "t1"),
                new ResourceStats("https://high.com", "High", "Cat", 50, "t2")
        };

        ResourceStats[] sorted = MergeSort.sortByVisitCount(input);

        // Input should maintain its original first element
        assertEquals(2, input[0].getVisitCount());
        assertEquals(50, sorted[0].getVisitCount());
    }

    @Test
    @DisplayName("sortHistoryByTimestamp correctly sorts history records newest first and oldest first")
    void testSortHistoryByTimestamp() {
        com.browseback.model.HistoryRecord h1 = new com.browseback.model.HistoryRecord("1", "https://a.com", "Page A", "General", "2025-01-01T10:00:00Z");
        com.browseback.model.HistoryRecord h2 = new com.browseback.model.HistoryRecord("2", "https://b.com", "Page B", "General", "2025-02-15T10:00:00Z");
        com.browseback.model.HistoryRecord h3 = new com.browseback.model.HistoryRecord("3", "https://c.com", "Page C", "General", "2025-01-20T10:00:00Z");

        com.browseback.model.HistoryRecord[] input = new com.browseback.model.HistoryRecord[] { h1, h2, h3 };

        // Newest First (descending)
        com.browseback.model.HistoryRecord[] newest = MergeSort.sortHistoryByTimestamp(input, true);
        assertEquals(3, newest.length);
        assertEquals("Page B", newest[0].getTitle());
        assertEquals("Page C", newest[1].getTitle());
        assertEquals("Page A", newest[2].getTitle());

        // Oldest First (ascending)
        com.browseback.model.HistoryRecord[] oldest = MergeSort.sortHistoryByTimestamp(input, false);
        assertEquals(3, oldest.length);
        assertEquals("Page A", oldest[0].getTitle());
        assertEquals("Page C", oldest[1].getTitle());
        assertEquals("Page B", oldest[2].getTitle());

        // Null and empty safety
        assertEquals(0, MergeSort.sortHistoryByTimestamp(null, true).length);
        assertEquals(0, MergeSort.sortHistoryByTimestamp(new com.browseback.model.HistoryRecord[0], false).length);
    }

    @Test
    @DisplayName("sortHistoryByTimestamp preserves order of records with identical timestamps (Stability)")
    void testSortHistoryStability() {
        com.browseback.model.HistoryRecord h1 = new com.browseback.model.HistoryRecord("1", "https://a.com", "Page 1", "General", "2025-01-01T12:00:00Z");
        com.browseback.model.HistoryRecord h2 = new com.browseback.model.HistoryRecord("2", "https://b.com", "Page 2", "General", "2025-01-01T12:00:00Z");
        com.browseback.model.HistoryRecord h3 = new com.browseback.model.HistoryRecord("3", "https://c.com", "Page 3", "General", "2025-01-01T12:00:00Z");

        com.browseback.model.HistoryRecord[] input = new com.browseback.model.HistoryRecord[] { h1, h2, h3 };
        com.browseback.model.HistoryRecord[] sorted = MergeSort.sortHistoryByTimestamp(input, true);

        assertEquals(3, sorted.length);
        assertEquals("Page 1", sorted[0].getTitle());
        assertEquals("Page 2", sorted[1].getTitle());
        assertEquals("Page 3", sorted[2].getTitle());
    }
}
