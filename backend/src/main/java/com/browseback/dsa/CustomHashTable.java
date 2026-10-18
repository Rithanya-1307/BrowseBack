package com.browseback.dsa;

import com.browseback.model.HashEntry;

/**
 * Unit III: Custom Hash Table with Separate Chaining for URL visit frequency & metadata.
 *
 * Algorithm Concept:
 * Uses an array of buckets, where each bucket is the head of a singly linked list
 * of HashEntry objects (separate chaining). When two different URLs hash to the same
 * bucket index (a collision), they are chained together in that bucket's linked list.
 *
 * Hash Function:
 * Polynomial rolling hash using prime multiplier 31:
 *   hash = sum(char[i] * 31^(n-1-i))
 * Mapped to index via: (hash & 0x7fffffff) % capacity
 *
 * Features:
 * - Dynamic rehashing when load factor exceeds 0.75
 * - O(1) average-case insertion, lookup, and deletion
 * - URL normalization (trimming) for consistent comparisons
 * - Metrics tracking (bucket chain comparisons) for algorithmic benchmarking
 *
 * Does NOT use Java's HashMap, Hashtable, or any built-in map structures.
 */
public class CustomHashTable {

    private static final int DEFAULT_INITIAL_CAPACITY = 17; // Initial prime capacity
    private static final double LOAD_FACTOR_THRESHOLD = 0.75;

    private HashEntry[] buckets;
    private int capacity;
    private int uniqueCount;

    /**
     * Metric result returned during benchmark lookups.
     */
    public static class LookupResult {
        private final HashEntry entry;
        private final int comparisons;
        private final long durationNano;

        public LookupResult(HashEntry entry, int comparisons, long durationNano) {
            this.entry = entry;
            this.comparisons = comparisons;
            this.durationNano = durationNano;
        }

        public HashEntry getEntry() {
            return entry;
        }

        public boolean isFound() {
            return entry != null;
        }

        public int getComparisons() {
            return comparisons;
        }

        public long getDurationNano() {
            return durationNano;
        }

        @Override
        public String toString() {
            return String.format("Found: %b in %d bucket comparisons (%d ns)",
                    isFound(), comparisons, durationNano);
        }
    }

    /**
     * Constructs a CustomHashTable with default initial prime capacity (17).
     */
    public CustomHashTable() {
        this(DEFAULT_INITIAL_CAPACITY);
    }

    /**
     * Constructs a CustomHashTable with custom capacity.
     *
     * @param initialCapacity initial bucket array size
     */
    public CustomHashTable(int initialCapacity) {
        this.capacity = Math.max(initialCapacity, 7);
        this.buckets = new HashEntry[this.capacity];
        this.uniqueCount = 0;
    }

    /**
     * Custom polynomial rolling hash function.
     * Maps a URL string to an integer bucket index in the range [0, capacity - 1].
     *
     * Time Complexity: O(L) where L is the length of the URL string.
     *
     * @param key URL string
     * @return bucket index
     */
    private int computeHash(String key) {
        if (key == null) {
            return 0;
        }
        int hash = 0;
        for (int i = 0; i < key.length(); i++) {
            hash = 31 * hash + key.charAt(i);
        }
        // Bitwise AND with 0x7fffffff guarantees a non-negative integer (handles integer overflow)
        return (hash & 0x7fffffff) % capacity;
    }

    /**
     * Normalizes URLs by trimming leading/trailing whitespace.
     */
    private String normalizeKey(String url) {
        return (url == null) ? "" : url.trim();
    }

    /**
     * Records a URL visit:
     * - If the URL already exists in the table, increments its visit count and updates lastVisitedAt.
     * - If the URL is new, creates a new HashEntry and inserts it into the collision chain.
     *
     * Time Complexity:
     * - Average Case: O(1)
     * - Worst Case: O(N) if all keys hash to the same bucket (unlikely with prime table & rolling hash)
     *
     * @param url the visited URL
     * @param timestamp timestamp string of the visit
     * @return the updated or newly created HashEntry
     */
    public HashEntry recordVisit(String url, String timestamp) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }

        String normalizedUrl = normalizeKey(url);
        int index = computeHash(normalizedUrl);

        HashEntry current = buckets[index];
        while (current != null) {
            if (current.getUrl().equals(normalizedUrl)) {
                // Existing URL — increment visit count and update lastVisited timestamp
                current.incrementVisitCount(timestamp);
                return current;
            }
            current = current.getNext();
        }

        // New URL — insert at head of bucket chain
        HashEntry newEntry = new HashEntry(normalizedUrl, timestamp);
        newEntry.setNext(buckets[index]);
        buckets[index] = newEntry;
        uniqueCount++;

        // Check if load factor exceeds threshold, trigger dynamic resizing
        if ((double) uniqueCount / capacity >= LOAD_FACTOR_THRESHOLD) {
            rehash();
        }

        return newEntry;
    }

    /**
     * Searches for an exact URL in the hash table.
     * Time Complexity: Average O(1), Worst O(N)
     *
     * @param url URL to search
     * @return HashEntry if found, or null if not found
     */
    public HashEntry search(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }
        String normalizedUrl = normalizeKey(url);
        int index = computeHash(normalizedUrl);

        HashEntry current = buckets[index];
        while (current != null) {
            if (current.getUrl().equals(normalizedUrl)) {
                return current;
            }
            current = current.getNext();
        }
        return null;
    }

    /**
     * Searches with detailed comparison tracking for empirical DSA comparison.
     *
     * @param url URL to look up
     * @return LookupResult containing entry, comparisons count, and execution time
     */
    public LookupResult searchWithMetrics(String url) {
        if (url == null || url.trim().isEmpty()) {
            return new LookupResult(null, 0, 0);
        }

        long startTime = System.nanoTime();
        String normalizedUrl = normalizeKey(url);
        int index = computeHash(normalizedUrl);
        int comparisons = 0;

        HashEntry current = buckets[index];
        while (current != null) {
            comparisons++;
            if (current.getUrl().equals(normalizedUrl)) {
                long duration = System.nanoTime() - startTime;
                return new LookupResult(current, comparisons, duration);
            }
            current = current.getNext();
        }

        long duration = System.nanoTime() - startTime;
        return new LookupResult(null, comparisons, duration);
    }

    /**
     * Checks whether a URL exists in the hash table.
     * Time Complexity: Average O(1)
     *
     * @param url URL to check
     * @return true if exists, false otherwise
     */
    public boolean contains(String url) {
        return search(url) != null;
    }

    /**
     * Retrieves the visit count for a specific URL.
     * Returns 0 if URL does not exist.
     * Time Complexity: Average O(1)
     *
     * @param url URL to query
     * @return number of visits
     */
    public int getVisitCount(String url) {
        HashEntry entry = search(url);
        return (entry != null) ? entry.getVisitCount() : 0;
    }

    /**
     * Decrements the visit count for a URL.
     * If the count reaches 0 or below, removes the entry completely.
     *
     * @param url URL whose count to decrement
     * @return updated visit count (0 if removed or not found)
     */
    public int decrementVisit(String url) {
        if (url == null || url.trim().isEmpty()) {
            return 0;
        }

        String normalizedUrl = normalizeKey(url);
        int index = computeHash(normalizedUrl);

        HashEntry current = buckets[index];
        HashEntry prev = null;

        while (current != null) {
            if (current.getUrl().equals(normalizedUrl)) {
                int newCount = current.getVisitCount() - 1;
                if (newCount <= 0) {
                    // Remove from chain
                    if (prev == null) {
                        buckets[index] = current.getNext();
                    } else {
                        prev.setNext(current.getNext());
                    }
                    uniqueCount--;
                    return 0;
                } else {
                    current.setVisitCount(newCount);
                    return newCount;
                }
            }
            prev = current;
            current = current.getNext();
        }
        return 0;
    }

    /**
     * Removes a URL entry completely from the hash table.
     * Time Complexity: Average O(1), Worst O(N)
     *
     * @param url URL to remove
     * @return true if removed, false if not found
     */
    public boolean remove(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }

        String normalizedUrl = normalizeKey(url);
        int index = computeHash(normalizedUrl);

        HashEntry current = buckets[index];
        HashEntry prev = null;

        while (current != null) {
            if (current.getUrl().equals(normalizedUrl)) {
                if (prev == null) {
                    buckets[index] = current.getNext();
                } else {
                    prev.setNext(current.getNext());
                }
                uniqueCount--;
                return true;
            }
            prev = current;
            current = current.getNext();
        }
        return false;
    }

    /**
     * Returns the total number of unique URLs indexed in the hash table.
     * Time Complexity: O(1)
     *
     * @return unique URL count
     */
    public int getUniqueCount() {
        return uniqueCount;
    }

    /**
     * Returns all unique entries as an array.
     * Time Complexity: O(capacity + uniqueCount)
     *
     * @return array of HashEntry objects
     */
    public HashEntry[] getAllEntries() {
        HashEntry[] entries = new HashEntry[uniqueCount];
        int index = 0;
        for (int i = 0; i < capacity; i++) {
            HashEntry current = buckets[i];
            while (current != null) {
                entries[index++] = current;
                current = current.getNext();
            }
        }
        return entries;
    }

    /**
     * Clears all entries from the hash table and resets bucket array.
     */
    public void clear() {
        this.buckets = new HashEntry[DEFAULT_INITIAL_CAPACITY];
        this.capacity = DEFAULT_INITIAL_CAPACITY;
        this.uniqueCount = 0;
    }

    /**
     * Dynamically rehashes the table when load factor exceeds threshold.
     * Doubles the capacity to the next prime number and redistributes all existing entries.
     */
    private void rehash() {
        int newCapacity = getNextPrime(capacity * 2);
        HashEntry[] oldBuckets = buckets;

        this.buckets = new HashEntry[newCapacity];
        this.capacity = newCapacity;
        this.uniqueCount = 0;

        for (HashEntry head : oldBuckets) {
            HashEntry current = head;
            while (current != null) {
                // Re-insert into new bucket array
                int newIndex = computeHash(current.getUrl());
                HashEntry next = current.getNext();

                current.setNext(buckets[newIndex]);
                buckets[newIndex] = current;
                uniqueCount++;

                current = next;
            }
        }
    }

    /**
     * Finds the next prime number greater than or equal to n.
     */
    private int getNextPrime(int n) {
        while (!isPrime(n)) {
            n++;
        }
        return n;
    }

    /**
     * Primality check helper.
     */
    private boolean isPrime(int n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 == 0 || n % 3 == 0) return false;
        for (int i = 5; i * i <= n; i += 6) {
            if (n % i == 0 || n % (i + 2) == 0) return false;
        }
        return true;
    }

    public int getCapacity() {
        return capacity;
    }
}
