package com.browseback.dsa;

import com.browseback.model.HistoryRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit II: SequentialSearch Tests")
public class SequentialSearchTest {

    private HistoryRecord[] records;

    @BeforeEach
    void setUp() {
        records = new HistoryRecord[] {
                new HistoryRecord("h1", "https://ocw.mit.edu/courses/6-006/", "MIT 6.006 Algorithms", "Algorithms", "2025-01-10"),
                new HistoryRecord("h2", "https://visualgo.net/en", "Visualgo Data Structures", "Data Structures", "2025-01-12"),
                new HistoryRecord("h3", "https://cp-algorithms.com/", "CP-Algorithms Competitive", "Algorithms", "2025-01-15"),
                new HistoryRecord("h4", "https://stanford.edu/class/cs166/", "Stanford CS166 Advanced Structures", "Data Structures", "2025-01-18"),
                new HistoryRecord("h5", "https://visualgo.net/sorting", "Visualgo Sorting Module", "Data Structures", "2025-01-20")
        };
    }

    @Test
    @DisplayName("Search by title returns all matching records case-insensitively")
    void testSearchByTitleCaseInsensitive() {
        var result = SequentialSearch.searchByTitle(records, "aLgOrIthMs");
        assertEquals(2, result.getMatchCount());
        assertEquals(5, result.getComparisonCount());
        assertEquals("h1", result.getMatches()[0].getId());
        assertEquals("h3", result.getMatches()[1].getId());
    }

    @Test
    @DisplayName("Search by URL returns all matching records")
    void testSearchByUrl() {
        var result = SequentialSearch.searchByUrl(records, "VISUALGO.NET");
        assertEquals(2, result.getMatchCount());
        assertEquals("h2", result.getMatches()[0].getId());
        assertEquals("h5", result.getMatches()[1].getId());
    }

    @Test
    @DisplayName("Search by keyword matches title, URL, or category")
    void testSearchByKeywordAcrossFields() {
        // "data structures" appears in categories of h2, h4, h5 and in title of h2
        var result = SequentialSearch.searchByKeyword(records, "Data Structures");
        assertEquals(3, result.getMatchCount());

        // "stanford" appears in URL and title of h4
        var resultStanford = SequentialSearch.searchByKeyword(records, "stanford");
        assertEquals(1, resultStanford.getMatchCount());
        assertEquals("h4", resultStanford.getMatches()[0].getId());
    }

    @Test
    @DisplayName("Keyword search directly on DoublyLinkedList")
    void testSearchOnDoublyLinkedList() {
        DoublyLinkedList list = new DoublyLinkedList();
        for (HistoryRecord r : records) {
            list.addLast(r);
        }

        var result = SequentialSearch.searchByKeyword(list, "Algorithms");
        assertEquals(2, result.getMatchCount());
        assertEquals(5, result.getComparisonCount());
    }

    @Test
    @DisplayName("Search with no matching terms returns empty array with all comparisons made")
    void testNoMatch() {
        var result = SequentialSearch.searchByKeyword(records, "nonexistent-query");
        assertEquals(0, result.getMatchCount());
        assertEquals(5, result.getComparisonCount());
    }

    @Test
    @DisplayName("Search with empty or null inputs returns safely")
    void testEmptyAndNullInputs() {
        var r1 = SequentialSearch.searchByTitle(null, "test");
        assertEquals(0, r1.getMatchCount());

        var r2 = SequentialSearch.searchByTitle(records, null);
        assertEquals(0, r2.getMatchCount());

        var r3 = SequentialSearch.searchByKeyword(records, "   ");
        assertEquals(0, r3.getMatchCount());
    }
}
