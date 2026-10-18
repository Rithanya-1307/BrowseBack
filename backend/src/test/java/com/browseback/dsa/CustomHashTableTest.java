package com.browseback.dsa;

import com.browseback.model.HashEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit III: CustomHashTable Tests")
public class CustomHashTableTest {

    private CustomHashTable table;

    @BeforeEach
    void setUp() {
        table = new CustomHashTable(7); // small initial capacity to test collision chaining & rehashing
    }

    @Test
    @DisplayName("Initial hash table is empty")
    void testInitialState() {
        assertEquals(0, table.getUniqueCount());
        assertNull(table.search("https://example.com"));
        assertFalse(table.contains("https://example.com"));
        assertEquals(0, table.getVisitCount("https://example.com"));
    }

    @Test
    @DisplayName("Record visit for new URL inserts entry with visit count 1")
    void testInsertNew() {
        HashEntry entry = table.recordVisit("https://mit.edu", "2025-01-10T10:00:00Z");
        assertNotNull(entry);
        assertEquals("https://mit.edu", entry.getUrl());
        assertEquals(1, entry.getVisitCount());
        assertEquals("2025-01-10T10:00:00Z", entry.getFirstVisitedAt());
        assertEquals("2025-01-10T10:00:00Z", entry.getLastVisitedAt());
        assertEquals(1, table.getUniqueCount());
        assertTrue(table.contains("https://mit.edu"));
    }

    @Test
    @DisplayName("Duplicate visits increment count and update last-visited timestamp")
    void testDuplicateVisitsIncrement() {
        table.recordVisit("https://visualgo.net", "2025-01-10T10:00:00Z");
        table.recordVisit("https://visualgo.net", "2025-01-11T12:00:00Z");
        table.recordVisit("https://visualgo.net", "2025-01-12T15:00:00Z");

        assertEquals(1, table.getUniqueCount(), "Should still be 1 unique URL");
        assertEquals(3, table.getVisitCount("https://visualgo.net"));

        HashEntry entry = table.search("https://visualgo.net");
        assertNotNull(entry);
        assertEquals("2025-01-10T10:00:00Z", entry.getFirstVisitedAt());
        assertEquals("2025-01-12T15:00:00Z", entry.getLastVisitedAt());
    }

    @Test
    @DisplayName("Handles hash collisions correctly via separate chaining")
    void testHashCollisions() {
        // Insert multiple distinct URLs into table with capacity 7
        // Pigeonhole principle guarantees several will collide into the same bucket
        String[] urls = {
                "https://site1.org",
                "https://site2.org",
                "https://site3.org",
                "https://site4.org",
                "https://site5.org",
                "https://site6.org",
                "https://site7.org",
                "https://site8.org"
        };

        for (int i = 0; i < urls.length; i++) {
            table.recordVisit(urls[i], "2025-01-01T" + i + ":00:00Z");
        }

        // Verify each individual collided URL can be retrieved accurately
        for (String url : urls) {
            assertTrue(table.contains(url), "Must contain: " + url);
            assertNotNull(table.search(url), "Search must find: " + url);
            assertEquals(1, table.getVisitCount(url));
        }

        assertEquals(8, table.getUniqueCount());
    }

    @Test
    @DisplayName("Remove URL deletes entry and decrements unique count")
    void testRemove() {
        table.recordVisit("https://a.com", "t1");
        table.recordVisit("https://b.com", "t2");
        assertEquals(2, table.getUniqueCount());

        assertTrue(table.remove("https://a.com"));
        assertEquals(1, table.getUniqueCount());
        assertFalse(table.contains("https://a.com"));
        assertNull(table.search("https://a.com"));

        assertFalse(table.remove("https://nonexistent.com"));
        assertEquals(1, table.getUniqueCount());
    }

    @Test
    @DisplayName("Decrement visit count decrements and removes when count reaches 0")
    void testDecrementVisit() {
        table.recordVisit("https://test.com", "t1");
        table.recordVisit("https://test.com", "t2");
        assertEquals(2, table.getVisitCount("https://test.com"));

        int afterFirst = table.decrementVisit("https://test.com");
        assertEquals(1, afterFirst);
        assertEquals(1, table.getVisitCount("https://test.com"));
        assertTrue(table.contains("https://test.com"));

        int afterSecond = table.decrementVisit("https://test.com");
        assertEquals(0, afterSecond);
        assertFalse(table.contains("https://test.com"));
        assertEquals(0, table.getUniqueCount());
    }

    @Test
    @DisplayName("GetAllEntries returns array of all unique entries")
    void testGetAllEntries() {
        table.recordVisit("https://a.com", "t1");
        table.recordVisit("https://b.com", "t2");
        table.recordVisit("https://c.com", "t3");

        HashEntry[] entries = table.getAllEntries();
        assertEquals(3, entries.length);
    }

    @Test
    @DisplayName("Clear removes all entries")
    void testClear() {
        table.recordVisit("https://a.com", "t1");
        table.recordVisit("https://b.com", "t2");
        table.clear();

        assertEquals(0, table.getUniqueCount());
        assertFalse(table.contains("https://a.com"));
    }
}
