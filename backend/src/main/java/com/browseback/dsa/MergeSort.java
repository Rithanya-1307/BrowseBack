package com.browseback.dsa;

import com.browseback.model.HashEntry;
import com.browseback.model.ResourceStats;

/**
 * Unit III: Merge Sort Algorithm from scratch for Ranking Resources by Visit Count.
 *
 * Algorithm Concept:
 * Merge Sort is a divide-and-conquer comparison-based sorting algorithm:
 * 1. Divide: Split the unsorted array recursively into two roughly equal halves
 *    until each subarray has 0 or 1 element.
 * 2. Conquer: Base case reached when size <= 1 (already trivially sorted).
 * 3. Combine (Merge): Merges two sorted subarrays into a single sorted array
 *    in DESCENDING order of visit count.
 *
 * Stability:
 * When two items have equal visit counts, the element from the left subarray is
 * picked first (using >= comparison). This preserves the original relative order,
 * ensuring the sort is STABLE.
 *
 * Time Complexity:
 * - Best Case: O(N log N)
 * - Average Case: O(N log N)
 * - Worst Case: O(N log N)
 * Space Complexity: O(N) auxiliary buffer for merging.
 *
 * Does NOT use Java's Arrays.sort, Collections.sort, or any built-in sorting method.
 */
public class MergeSort {

    /**
     * Sorts an array of ResourceStats in descending order of visit count.
     * Does not mutate the original array; returns a new sorted array.
     *
     * @param original the input array of ResourceStats
     * @return a new array sorted in descending order of visit count
     */
    public static ResourceStats[] sortByVisitCount(ResourceStats[] original) {
        if (original == null) {
            return new ResourceStats[0];
        }
        if (original.length <= 1) {
            ResourceStats[] copy = new ResourceStats[original.length];
            System.arraycopy(original, 0, copy, 0, original.length);
            return copy;
        }

        // Clone array to preserve original input
        ResourceStats[] arr = new ResourceStats[original.length];
        System.arraycopy(original, 0, arr, 0, original.length);

        ResourceStats[] temp = new ResourceStats[arr.length];
        mergeSortRecursive(arr, temp, 0, arr.length - 1);
        return arr;
    }

    /**
     * Recursive divide-and-conquer helper for ResourceStats.
     *
     * @param arr target array being sorted
     * @param temp auxiliary merge buffer
     * @param left left boundary index (inclusive)
     * @param right right boundary index (inclusive)
     */
    private static void mergeSortRecursive(ResourceStats[] arr, ResourceStats[] temp, int left, int right) {
        if (left >= right) {
            return;
        }

        int mid = left + (right - left) / 2;

        // Divide
        mergeSortRecursive(arr, temp, left, mid);
        mergeSortRecursive(arr, temp, mid + 1, right);

        // Conquer / Merge
        merge(arr, temp, left, mid, right);
    }

    /**
     * Merges two sorted halves of ResourceStats in descending order.
     * Uses >= for stability.
     */
    private static void merge(ResourceStats[] arr, ResourceStats[] temp, int left, int mid, int right) {
        int i = left;
        int j = mid + 1;
        int k = left;

        while (i <= mid && j <= right) {
            // Descending order: higher visit count comes first.
            // Using >= ensures stability (left items with equal visits retain prior position).
            if (arr[i].getVisitCount() >= arr[j].getVisitCount()) {
                temp[k++] = arr[i++];
            } else {
                temp[k++] = arr[j++];
            }
        }

        while (i <= mid) {
            temp[k++] = arr[i++];
        }

        while (j <= right) {
            temp[k++] = arr[j++];
        }

        for (int idx = left; idx <= right; idx++) {
            arr[idx] = temp[idx];
        }
    }

    /**
     * Sorts an array of HashEntry objects in descending order of visit count.
     * Does not mutate original array; returns a new sorted array.
     *
     * @param original input HashEntry array
     * @return new sorted HashEntry array
     */
    public static HashEntry[] sortHashEntriesByVisitCount(HashEntry[] original) {
        if (original == null) {
            return new HashEntry[0];
        }
        if (original.length <= 1) {
            HashEntry[] copy = new HashEntry[original.length];
            System.arraycopy(original, 0, copy, 0, original.length);
            return copy;
        }

        HashEntry[] arr = new HashEntry[original.length];
        System.arraycopy(original, 0, arr, 0, original.length);

        HashEntry[] temp = new HashEntry[arr.length];
        mergeSortEntriesRecursive(arr, temp, 0, arr.length - 1);
        return arr;
    }

    private static void mergeSortEntriesRecursive(HashEntry[] arr, HashEntry[] temp, int left, int right) {
        if (left >= right) {
            return;
        }

        int mid = left + (right - left) / 2;
        mergeSortEntriesRecursive(arr, temp, left, mid);
        mergeSortEntriesRecursive(arr, temp, mid + 1, right);
        mergeEntries(arr, temp, left, mid, right);
    }

    private static void mergeEntries(HashEntry[] arr, HashEntry[] temp, int left, int mid, int right) {
        int i = left;
        int j = mid + 1;
        int k = left;

        while (i <= mid && j <= right) {
            if (arr[i].getVisitCount() >= arr[j].getVisitCount()) {
                temp[k++] = arr[i++];
            } else {
                temp[k++] = arr[j++];
            }
        }

        while (i <= mid) {
            temp[k++] = arr[i++];
        }

        while (j <= right) {
            temp[k++] = arr[j++];
        }

        for (int idx = left; idx <= right; idx++) {
            arr[idx] = temp[idx];
        }
    }

    /**
     * Sorts an array of HistoryRecord objects by visit timestamp using custom recursive Merge Sort.
     * Does not mutate the original array; returns a new sorted array.
     *
     * @param original the input array of HistoryRecord objects
     * @param newestFirst true to sort from newest to oldest, false for oldest to newest
     * @return a new array sorted by timestamp in the specified order
     */
    public static com.browseback.model.HistoryRecord[] sortHistoryByTimestamp(
            com.browseback.model.HistoryRecord[] original, boolean newestFirst) {
        if (original == null) {
            return new com.browseback.model.HistoryRecord[0];
        }
        if (original.length <= 1) {
            com.browseback.model.HistoryRecord[] copy = new com.browseback.model.HistoryRecord[original.length];
            System.arraycopy(original, 0, copy, 0, original.length);
            return copy;
        }

        com.browseback.model.HistoryRecord[] arr = new com.browseback.model.HistoryRecord[original.length];
        System.arraycopy(original, 0, arr, 0, original.length);

        com.browseback.model.HistoryRecord[] temp = new com.browseback.model.HistoryRecord[arr.length];
        mergeSortHistoryRecursive(arr, temp, 0, arr.length - 1, newestFirst);
        return arr;
    }

    private static void mergeSortHistoryRecursive(
            com.browseback.model.HistoryRecord[] arr,
            com.browseback.model.HistoryRecord[] temp,
            int left,
            int right,
            boolean newestFirst) {
        if (left >= right) {
            return;
        }

        int mid = left + (right - left) / 2;
        mergeSortHistoryRecursive(arr, temp, left, mid, newestFirst);
        mergeSortHistoryRecursive(arr, temp, mid + 1, right, newestFirst);
        mergeHistory(arr, temp, left, mid, right, newestFirst);
    }

    private static void mergeHistory(
            com.browseback.model.HistoryRecord[] arr,
            com.browseback.model.HistoryRecord[] temp,
            int left,
            int mid,
            int right,
            boolean newestFirst) {
        int i = left;
        int j = mid + 1;
        int k = left;

        while (i <= mid && j <= right) {
            String t1 = (arr[i] != null && arr[i].getTimestamp() != null) ? arr[i].getTimestamp() : "";
            String t2 = (arr[j] != null && arr[j].getTimestamp() != null) ? arr[j].getTimestamp() : "";

            int cmp = t1.compareTo(t2);
            boolean takeLeft;
            if (newestFirst) {
                // Descending: newer timestamp comes first.
                // Using >= ensures stability for identical timestamps.
                takeLeft = (cmp >= 0);
            } else {
                // Ascending: older timestamp comes first.
                // Using <= ensures stability for identical timestamps.
                takeLeft = (cmp <= 0);
            }

            if (takeLeft) {
                temp[k++] = arr[i++];
            } else {
                temp[k++] = arr[j++];
            }
        }

        while (i <= mid) {
            temp[k++] = arr[i++];
        }

        while (j <= right) {
            temp[k++] = arr[j++];
        }

        for (int idx = left; idx <= right; idx++) {
            arr[idx] = temp[idx];
        }
    }
}
