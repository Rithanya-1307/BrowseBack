# BrowseBack — Backend REST API & DSA Engine

The Spring Boot backend for **BrowseBack: Smart Web Research Manager**, exposing high-performance REST APIs powered by scratch-built Data Structures and Algorithms from Units I, II, and III.

## Technology Stack
- **Java 17+** (Adoptium OpenJDK)
- **Spring Boot 3.2.5** (Spring Web, Validation, Actuator)
- **Apache Maven 3.9.6**
- **JUnit 5 / Spring Boot Test**

## DSA Architecture Mapped to Units
1. **Unit I — CustomStack (`com.browseback.dsa.CustomStack`)**
   - Pure linked-node LIFO stack without built-in Java collections.
   - Powers `POST /api/navigation/back` and `POST /api/navigation/forward`.
   - $O(1)$ push, pop, peek, size, and clear.
2. **Unit II — DoublyLinkedList (`com.browseback.dsa.DoublyLinkedList`)**
   - Bidirectional chronological browsing history with `head` (oldest) and `tail` (newest).
   - $O(1)$ insertion at tail, $O(N)$ traversal and node unlinking.
   - Powers `GET /api/history` and `DELETE /api/history/{id}`.
3. **Unit II — SequentialSearch (`com.browseback.dsa.SequentialSearch`)**
   - Case-insensitive linear search across history records.
   - Counts character/string comparisons and execution time ($O(N)$).
   - Powers `GET /api/search?q={keyword}`.
4. **Unit III — CustomHashTable (`com.browseback.dsa.CustomHashTable`)**
   - Polynomial rolling hash function with separate chaining collision handling.
   - Dynamic rehashing at load factor $\ge 0.75$.
   - $O(1)$ average exact URL lookup and visit frequency indexing.
   - Powers `GET /api/search/url?url={encodedUrl}` and visit synchronization.
5. **Unit III — MergeSort (`com.browseback.dsa.MergeSort`)**
   - Stable divide-and-conquer sorting algorithm ($O(N \log N)$).
   - Sorts resources in descending order of visit frequency without modifying input.
   - Powers `GET /api/analytics/popular`.

## REST API Endpoints Summary
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/resources` | Retrieve all curated research resources |
| `POST` | `/api/resources` | Add a new research resource |
| `GET` | `/api/resources/{id}` | Retrieve single resource by ID |
| `PUT` | `/api/resources/{id}` | Update an existing resource |
| `DELETE` | `/api/resources/{id}` | Delete a resource |
| `GET` | `/api/history` | Retrieve chronological browsing history |
| `DELETE` | `/api/history/{id}` | Delete one history visit & decrement URL count |
| `DELETE` | `/api/history` | Clear all history visits |
| `POST` | `/api/navigation/visit` | Open/record a resource visit |
| `POST` | `/api/navigation/back` | Navigate back via CustomStack |
| `POST` | `/api/navigation/forward` | Navigate forward via CustomStack |
| `GET` | `/api/navigation/current` | Retrieve active page & navigation state |
| `GET` | `/api/search?q={query}` | Sequential linear search |
| `GET` | `/api/search/url?url={url}` | Exact URL lookup via CustomHashTable |
| `GET` | `/api/analytics/summary` | Aggregate metrics and category counts |
| `GET` | `/api/analytics/popular` | Most-visited ranking via MergeSort |
| `GET` | `/api/analytics/performance` | Empirical benchmark: Sequential vs Hash Lookup |
| `GET` | `/api/health` | Service health status |

## Build and Run Instructions
```powershell
# Compile classes
.\mvn.cmd compile

# Execute all 57 unit & integration tests
.\mvn.cmd test

# Run Spring Boot Application on port 8080
.\mvn.cmd spring-boot:run
```
