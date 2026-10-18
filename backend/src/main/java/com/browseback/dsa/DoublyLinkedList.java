package com.browseback.dsa;

import com.browseback.model.HistoryNode;
import com.browseback.model.HistoryRecord;

/**
 * Unit II: Custom Doubly Linked List for Web Browsing History.
 * 
 * Each node points to both the previous and next nodes, allowing bidirectional
 * traversal (forward and backward through time).
 * 
 * Maintained with both head and tail references:
 * - head points to the oldest history record.
 * - tail points to the most recent history record.
 * 
 * Supports duplicate URLs since users naturally visit pages repeatedly.
 * Does NOT use Java's built-in LinkedList or any Collections framework class.
 */
public class DoublyLinkedList {

    private HistoryNode head;
    private HistoryNode tail;
    private int size;

    /**
     * Constructs an empty DoublyLinkedList.
     */
    public DoublyLinkedList() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    /**
     * Appends a new browsing history record to the end (tail) of the list.
     * Time Complexity: O(1) because we maintain a direct tail reference.
     *
     * @param record the browsing history record to add
     * @throws IllegalArgumentException if record is null
     */
    public void addLast(HistoryRecord record) {
        if (record == null) {
            throw new IllegalArgumentException("History record cannot be null.");
        }

        HistoryNode newNode = new HistoryNode(record);

        if (isEmpty()) {
            head = newNode;
            tail = newNode;
        } else {
            tail.setNext(newNode);
            newNode.setPrev(tail);
            tail = newNode;
        }
        size++;
    }

    /**
     * Convenience alias for adding a record at the end of history.
     *
     * @param record the browsing record to add
     */
    public void addRecord(HistoryRecord record) {
        addLast(record);
    }

    /**
     * Deletes a record by its unique ID.
     * Time Complexity: O(N) where N is the number of records.
     *
     * @param id the unique record ID to delete
     * @return the removed HistoryRecord, or null if no record matched the ID
     */
    public HistoryRecord deleteById(String id) {
        if (id == null || isEmpty()) {
            return null;
        }

        HistoryNode current = head;
        while (current != null) {
            if (id.equals(current.getRecord().getId())) {
                HistoryRecord deletedRecord = current.getRecord();
                removeNode(current);
                return deletedRecord;
            }
            current = current.getNext();
        }
        return null;
    }

    /**
     * Internal helper to unlink a node from the doubly linked list.
     * Time Complexity: O(1) once the node is identified.
     *
     * @param node the node to unlink
     */
    private void removeNode(HistoryNode node) {
        if (node == null) {
            return;
        }

        HistoryNode prevNode = node.getPrev();
        HistoryNode nextNode = node.getNext();

        // If removing the head node
        if (prevNode == null) {
            head = nextNode;
        } else {
            prevNode.setNext(nextNode);
        }

        // If removing the tail node
        if (nextNode == null) {
            tail = prevNode;
        } else {
            nextNode.setPrev(prevNode);
        }

        // Detach unlinked node to avoid memory leaks
        node.setPrev(null);
        node.setNext(null);
        size--;
    }

    /**
     * Finds a single history record matching the specified record ID.
     * Time Complexity: O(N)
     *
     * @param id the record ID
     * @return matching HistoryRecord, or null if not found
     */
    public HistoryRecord findById(String id) {
        HistoryNode node = findNodeById(id);
        return node != null ? node.getRecord() : null;
    }

    /**
     * Finds a node by record ID in the DoublyLinkedList.
     * Time Complexity: O(N)
     *
     * @param id the record ID
     * @return matching HistoryNode or null
     */
    public HistoryNode findNodeById(String id) {
        if (id == null || isEmpty()) {
            return null;
        }

        HistoryNode current = head;
        while (current != null) {
            if (id.equals(current.getRecord().getId())) {
                return current;
            }
            current = current.getNext();
        }
        return null;
    }

    /**
     * Retrieves the record immediately preceding the node with the given ID (towards head / older).
     * Time Complexity: O(N) to locate node, O(1) to traverse link.
     *
     * @param id current record ID
     * @return previous HistoryRecord, or null if at beginning or not found
     */
    public HistoryRecord getPreviousRecord(String id) {
        HistoryNode node = findNodeById(id);
        if (node != null && node.getPrev() != null) {
            return node.getPrev().getRecord();
        }
        return null;
    }

    /**
     * Retrieves the record immediately succeeding the node with the given ID (towards tail / newer).
     * Time Complexity: O(N) to locate node, O(1) to traverse link.
     *
     * @param id current record ID
     * @return next HistoryRecord, or null if at end or not found
     */
    public HistoryRecord getNextRecord(String id) {
        HistoryNode node = findNodeById(id);
        if (node != null && node.getNext() != null) {
            return node.getNext().getRecord();
        }
        return null;
    }

    /**
     * Traverses forward from head (oldest) to tail (most recent).
     * Time Complexity: O(N)
     *
     * @return array of records in chronological order
     */
    public HistoryRecord[] traverseForward() {
        HistoryRecord[] result = new HistoryRecord[size];
        HistoryNode current = head;
        int index = 0;
        while (current != null) {
            result[index++] = current.getRecord();
            current = current.getNext();
        }
        return result;
    }

    /**
     * Traverses backward from tail (most recent) to head (oldest).
     * Time Complexity: O(N)
     *
     * @return array of records in reverse chronological order
     */
    public HistoryRecord[] traverseBackward() {
        HistoryRecord[] result = new HistoryRecord[size];
        HistoryNode current = tail;
        int index = 0;
        while (current != null) {
            result[index++] = current.getRecord();
            current = current.getPrev();
        }
        return result;
    }

    /**
     * Returns all records as an array from oldest to newest.
     *
     * @return array of all history records
     */
    public HistoryRecord[] getAllRecords() {
        return traverseForward();
    }

    /**
     * Displays all browsing history records to the console.
     */
    public void displayAll() {
        if (isEmpty()) {
            System.out.println("History is empty.");
            return;
        }
        HistoryNode current = head;
        int count = 1;
        while (current != null) {
            System.out.printf("%d. %s%n", count++, current.getRecord());
            current = current.getNext();
        }
    }

    /**
     * Checks whether the list contains zero records.
     * Time Complexity: O(1)
     *
     * @return true if empty, false otherwise
     */
    public boolean isEmpty() {
        return head == null || size == 0;
    }

    /**
     * Returns the number of history records currently stored.
     * Time Complexity: O(1)
     *
     * @return record count
     */
    public int size() {
        return size;
    }

    /**
     * Clears all history records and resets head, tail, and size.
     * Time Complexity: O(N) to dereference nodes.
     */
    public void clear() {
        HistoryNode current = head;
        while (current != null) {
            HistoryNode next = current.getNext();
            current.setPrev(null);
            current.setNext(null);
            current = next;
        }
        head = null;
        tail = null;
        size = 0;
    }

    public HistoryNode getHead() {
        return head;
    }

    public HistoryNode getTail() {
        return tail;
    }
}
