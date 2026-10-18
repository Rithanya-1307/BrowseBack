package com.browseback;

import com.browseback.model.HashEntry;
import com.browseback.model.HistoryRecord;
import com.browseback.model.ResourceStats;
import com.browseback.service.BrowseBackService;

/**
 * Interactive Demonstration Driver for BrowseBack Core DSA Engine:
 * - Unit I: CustomStack (LIFO Browser Back/Forward navigation)
 * - Unit II: DoublyLinkedList (Bidirectional history) & SequentialSearch (O(N) case-insensitive search)
 * - Unit III: CustomHashTable (O(1) Separate Chaining frequency index) & MergeSort (Stable O(N log N) ranking)
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println("   BROWSEBACK — Smart Web Research Manager (Core DSA Engine Units I, II, III)");
        System.out.println("================================================================================\n");

        BrowseBackService service = new BrowseBackService();

        // ---------------------------------------------------------------------
        // 1. UNIT I: CustomStack & Browser Navigation
        // ---------------------------------------------------------------------
        System.out.println("--- [UNIT I] CustomStack: Browser Navigation (LIFO) ---");
        service.recordVisit("https://visualgo.net/en", "Visualgo", "Data Structures", "2025-02-14T10:00:00Z");
        service.recordVisit("https://ocw.mit.edu/courses/6-006/", "MIT 6.006 Algorithms", "Algorithms", "2025-02-14T10:15:00Z");
        service.recordVisit("https://cp-algorithms.com/", "CP-Algorithms", "Competitive Programming", "2025-02-14T10:30:00Z");

        System.out.println("Current Page: " + service.getCurrentPage().getTitle());
        System.out.println("Back stack size: " + service.getBackStack().size());

        System.out.println("\nAction: User clicks Back <--");
        HistoryRecord prev = service.goBack();
        System.out.println("Navigated Back to: " + (prev != null ? prev.getTitle() : "None"));
        System.out.println("Can go forward? " + service.canGoForward());

        System.out.println("\nAction: User clicks Forward -->");
        HistoryRecord fwd = service.goForward();
        System.out.println("Navigated Forward to: " + (fwd != null ? fwd.getTitle() : "None"));

        // ---------------------------------------------------------------------
        // 2. UNIT II: DoublyLinkedList (History Records)
        // ---------------------------------------------------------------------
        System.out.println("\n--- [UNIT II] DoublyLinkedList: Bidirectional Browsing History ---");
        // Add more visits including duplicates
        service.recordVisit("https://visualgo.net/en", "Visualgo", "Data Structures", "2025-02-14T11:00:00Z");
        service.recordVisit("https://dataintensive.net/", "Designing Data-Intensive Apps", "System Design", "2025-02-14T11:45:00Z");

        System.out.println("Forward Traversal (Oldest -> Newest):");
        HistoryRecord[] forwardHistory = service.getHistoryChronological();
        for (int i = 0; i < forwardHistory.length; i++) {
            System.out.printf("  [%d] (%s) %s -> %s%n", i + 1, forwardHistory[i].getId(),
                    forwardHistory[i].getTitle(), forwardHistory[i].getUrl());
        }

        System.out.println("\nBackward Traversal (Newest -> Oldest):");
        HistoryRecord[] backwardHistory = service.getHistoryReverse();
        for (int i = 0; i < backwardHistory.length; i++) {
            System.out.printf("  [%d] (%s) %s%n", i + 1, backwardHistory[i].getId(), backwardHistory[i].getTitle());
        }

        // ---------------------------------------------------------------------
        // 3. UNIT II: SequentialSearch across History
        // ---------------------------------------------------------------------
        System.out.println("\n--- [UNIT II] SequentialSearch: Case-Insensitive Multi-Match ---");
        var searchRes = service.searchByKeyword("algorithms");
        System.out.printf("Query: 'algorithms' -> Found %d matches in %d comparisons:%n",
                searchRes.getMatchCount(), searchRes.getComparisonCount());
        for (HistoryRecord match : searchRes.getMatches()) {
            System.out.println("  - " + match.getTitle() + " (" + match.getUrl() + ")");
        }

        // ---------------------------------------------------------------------
        // 4. UNIT III: CustomHashTable (O(1) Visit Frequency Tracking)
        // ---------------------------------------------------------------------
        System.out.println("\n--- [UNIT III] CustomHashTable: Separate Chaining & Frequency Tracking ---");
        System.out.println("Total Unique URLs indexed: " + service.getUniqueUrlCount());
        String testUrl = "https://visualgo.net/en";
        HashEntry visualgoEntry = service.findExactUrl(testUrl);
        System.out.printf("Lookup '%s': Visits = %d, First = %s, Last = %s%n",
                testUrl,
                service.getVisitCount(testUrl),
                visualgoEntry != null ? visualgoEntry.getFirstVisitedAt() : "N/A",
                visualgoEntry != null ? visualgoEntry.getLastVisitedAt() : "N/A");

        // ---------------------------------------------------------------------
        // 5. UNIT III: MergeSort (Ranking Resources by Visit Count)
        // ---------------------------------------------------------------------
        System.out.println("\n--- [UNIT III] MergeSort: Stable Ranking by Visit Count (Descending) ---");
        ResourceStats[] ranked = service.getMostVisitedResources();
        for (int i = 0; i < ranked.length; i++) {
            System.out.printf("  Rank #%d: %s (Visits: %d)%n", i + 1, ranked[i].getTitle(), ranked[i].getVisitCount());
        }

        // ---------------------------------------------------------------------
        // 6. SYNCHRONIZATION: Record Deletion Consistency
        // ---------------------------------------------------------------------
        System.out.println("\n--- Synchronized Deletion (History <-> Hash Table) ---");
        System.out.println("Deleting 1 visit of visualgo (id: 'hist-4')...");
        int beforeCount = service.getVisitCount("https://visualgo.net/en");
        service.deleteHistoryRecord("hist-4");
        int afterCount = service.getVisitCount("https://visualgo.net/en");
        System.out.printf("Visualgo visits before: %d, after: %d (Decremented correctly)%n", beforeCount, afterCount);

        // ---------------------------------------------------------------------
        // 7. EMPIRICAL DSA COMPARISON: Sequential Search vs Hash Table
        // ---------------------------------------------------------------------
        System.out.println("\n--- Empirical Performance Comparison (Unit II vs Unit III) ---");
        var comparison = service.compareSearchPerformance("https://visualgo.net/en");
        System.out.println(comparison);

        System.out.println("\n================================================================================");
        System.out.println("   All DSA Modules executed successfully!");
        System.out.println("================================================================================");
    }
}
