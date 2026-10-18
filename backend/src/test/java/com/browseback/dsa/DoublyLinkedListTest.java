package com.browseback.dsa;

import com.browseback.model.HistoryRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit II: DoublyLinkedList Tests")
public class DoublyLinkedListTest {

    private DoublyLinkedList list;

    @BeforeEach
    void setUp() {
        list = new DoublyLinkedList();
    }

    @Test
    @DisplayName("Initial list is empty with null head and tail")
    void testInitialState() {
        assertTrue(list.isEmpty());
        assertEquals(0, list.size());
        assertNull(list.getHead());
        assertNull(list.getTail());
        assertEquals(0, list.traverseForward().length);
    }

    @Test
    @DisplayName("Add elements at end and verify head, tail, and forward traversal")
    void testAddLastAndForwardTraversal() {
        HistoryRecord r1 = new HistoryRecord("1", "https://mit.edu", "MIT", "Edu", "10:00");
        HistoryRecord r2 = new HistoryRecord("2", "https://stanford.edu", "Stanford", "Edu", "10:05");
        HistoryRecord r3 = new HistoryRecord("3", "https://harvard.edu", "Harvard", "Edu", "10:10");

        list.addLast(r1);
        assertEquals(1, list.size());
        assertEquals(r1, list.getHead().getRecord());
        assertEquals(r1, list.getTail().getRecord());

        list.addLast(r2);
        list.addLast(r3);
        assertEquals(3, list.size());
        assertEquals(r1, list.getHead().getRecord());
        assertEquals(r3, list.getTail().getRecord());

        HistoryRecord[] records = list.traverseForward();
        assertEquals(3, records.length);
        assertEquals("1", records[0].getId());
        assertEquals("2", records[1].getId());
        assertEquals("3", records[2].getId());
    }

    @Test
    @DisplayName("Backward traversal returns elements from newest to oldest")
    void testBackwardTraversal() {
        list.addLast(new HistoryRecord("1", "https://site1.com", "S1", "Cat", "10:00"));
        list.addLast(new HistoryRecord("2", "https://site2.com", "S2", "Cat", "10:05"));
        list.addLast(new HistoryRecord("3", "https://site3.com", "S3", "Cat", "10:10"));

        HistoryRecord[] records = list.traverseBackward();
        assertEquals(3, records.length);
        assertEquals("3", records[0].getId());
        assertEquals("2", records[1].getId());
        assertEquals("1", records[2].getId());
    }

    @Test
    @DisplayName("Supports duplicate URLs across multiple visits")
    void testDuplicateUrls() {
        String sharedUrl = "https://visualgo.net";
        list.addLast(new HistoryRecord("1", sharedUrl, "Visualgo Morning", "DSA", "09:00"));
        list.addLast(new HistoryRecord("2", "https://other.com", "Other", "Misc", "10:00"));
        list.addLast(new HistoryRecord("3", sharedUrl, "Visualgo Afternoon", "DSA", "14:00"));

        assertEquals(3, list.size());
        HistoryRecord[] records = list.traverseForward();
        assertEquals(sharedUrl, records[0].getUrl());
        assertEquals(sharedUrl, records[2].getUrl());
    }

    @Test
    @DisplayName("Delete head record correctly updates head pointer")
    void testDeleteHead() {
        list.addLast(new HistoryRecord("1", "https://a.com", "A", "C", "10:00"));
        list.addLast(new HistoryRecord("2", "https://b.com", "B", "C", "10:01"));
        list.addLast(new HistoryRecord("3", "https://c.com", "C", "C", "10:02"));

        HistoryRecord deleted = list.deleteById("1");
        assertNotNull(deleted);
        assertEquals("1", deleted.getId());
        assertEquals(2, list.size());

        assertEquals("2", list.getHead().getRecord().getId());
        assertNull(list.getHead().getPrev());
    }

    @Test
    @DisplayName("Delete tail record correctly updates tail pointer")
    void testDeleteTail() {
        list.addLast(new HistoryRecord("1", "https://a.com", "A", "C", "10:00"));
        list.addLast(new HistoryRecord("2", "https://b.com", "B", "C", "10:01"));
        list.addLast(new HistoryRecord("3", "https://c.com", "C", "C", "10:02"));

        HistoryRecord deleted = list.deleteById("3");
        assertNotNull(deleted);
        assertEquals("3", deleted.getId());
        assertEquals(2, list.size());

        assertEquals("2", list.getTail().getRecord().getId());
        assertNull(list.getTail().getNext());
    }

    @Test
    @DisplayName("Delete middle record unlinks and updates neighbors")
    void testDeleteMiddle() {
        list.addLast(new HistoryRecord("1", "https://a.com", "A", "C", "10:00"));
        list.addLast(new HistoryRecord("2", "https://b.com", "B", "C", "10:01"));
        list.addLast(new HistoryRecord("3", "https://c.com", "C", "C", "10:02"));

        HistoryRecord deleted = list.deleteById("2");
        assertNotNull(deleted);
        assertEquals("2", deleted.getId());
        assertEquals(2, list.size());

        assertEquals("3", list.getHead().getNext().getRecord().getId());
        assertEquals("1", list.getTail().getPrev().getRecord().getId());
    }

    @Test
    @DisplayName("Delete single element leaves list empty")
    void testDeleteSingleElement() {
        list.addLast(new HistoryRecord("1", "https://a.com", "A", "C", "10:00"));
        HistoryRecord deleted = list.deleteById("1");
        assertNotNull(deleted);
        assertTrue(list.isEmpty());
        assertEquals(0, list.size());
        assertNull(list.getHead());
        assertNull(list.getTail());
    }

    @Test
    @DisplayName("Delete with non-existent ID returns null")
    void testDeleteNonExistentId() {
        list.addLast(new HistoryRecord("1", "https://a.com", "A", "C", "10:00"));
        assertNull(list.deleteById("999"));
        assertEquals(1, list.size());
    }

    @Test
    @DisplayName("Adding null record throws IllegalArgumentException")
    void testAddNullThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> list.addLast(null));
    }

    @Test
    @DisplayName("Clear resets head, tail, and size to 0")
    void testClear() {
        list.addLast(new HistoryRecord("1", "https://a.com", "A", "C", "10:00"));
        list.addLast(new HistoryRecord("2", "https://b.com", "B", "C", "10:01"));
        list.clear();

        assertTrue(list.isEmpty());
        assertEquals(0, list.size());
        assertNull(list.getHead());
        assertNull(list.getTail());
    }

    @Test
    @DisplayName("Previous and next node navigation correctly navigates doubly linked list")
    void testPreviousAndNextRecordNavigation() {
        HistoryRecord r1 = new HistoryRecord("1", "https://a.com", "A", "C", "10:00");
        HistoryRecord r2 = new HistoryRecord("2", "https://b.com", "B", "C", "10:01");
        HistoryRecord r3 = new HistoryRecord("3", "https://c.com", "C", "C", "10:02");

        list.addLast(r1);
        list.addLast(r2);
        list.addLast(r3);

        // At beginning (r1): previous should be null, next should be r2
        assertNull(list.getPreviousRecord("1"));
        assertEquals("2", list.getNextRecord("1").getId());

        // At middle (r2): previous should be r1, next should be r3
        assertEquals("1", list.getPreviousRecord("2").getId());
        assertEquals("3", list.getNextRecord("2").getId());

        // At end (r3): previous should be r2, next should be null
        assertEquals("2", list.getPreviousRecord("3").getId());
        assertNull(list.getNextRecord("3"));

        // Non-existent ID
        assertNull(list.getPreviousRecord("non-existent"));
        assertNull(list.getNextRecord("non-existent"));
    }
}
