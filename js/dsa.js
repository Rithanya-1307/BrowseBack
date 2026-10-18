/**
 * BrowseBack — Custom Data Structures and Algorithms (Vanilla JS)
 * 
 * Strict academic implementation:
 * 1. CustomStack: Linked-node LIFO stack for Back and Forward navigation.
 * 2. DoublyLinkedList: Node-based bidirectional list with head, tail, and eviction.
 * 3. CustomHashTable: Separate chaining with polynomial rolling hash and metric tracking.
 * 4. SequentialSearch: Linear scanning with comparison counting and timing.
 * 5. MergeSort: Stable recursive divide-and-conquer sorting for timestamps and visit counts.
 * 
 * No native Map, Set, or Array.prototype.sort replacements are used for core operations.
 */

// ==========================================
// 1. Custom Stack (Linked-Node LIFO)
// ==========================================
class StackNode {
  constructor(data, next = null) {
    this.data = data;
    this.next = next;
  }
}

export class CustomStack {
  constructor() {
    this.topNode = null;
    this.count = 0;
  }

  push(item) {
    this.topNode = new StackNode(item, this.topNode);
    this.count++;
  }

  pop() {
    if (this.isEmpty()) {
      return null;
    }
    const val = this.topNode.data;
    this.topNode = this.topNode.next;
    this.count--;
    return val;
  }

  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.topNode.data;
  }

  isEmpty() {
    return this.count === 0 || this.topNode === null;
  }

  size() {
    return this.count;
  }

  clear() {
    this.topNode = null;
    this.count = 0;
  }

  toArray() {
    const result = [];
    let curr = this.topNode;
    while (curr !== null) {
      result.push(curr.data);
      curr = curr.next;
    }
    return result;
  }
}

// ==========================================
// 2. Custom Doubly Linked List
// ==========================================
class ListNode {
  constructor(record) {
    this.record = record;
    this.prev = null;
    this.next = null;
  }
}

export class DoublyLinkedList {
  constructor() {
    this.head = null; // Oldest record
    this.tail = null; // Most recent record
    this.count = 0;
  }

  addLast(record) {
    if (!record) return;
    const newNode = new ListNode(record);

    if (this.isEmpty()) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    this.count++;
    return newNode;
  }

  deleteById(id) {
    if (!id || this.isEmpty()) return null;

    let curr = this.head;
    while (curr !== null) {
      if (curr.record && curr.record.id === id) {
        const deletedRecord = curr.record;
        this.removeNode(curr);
        return deletedRecord;
      }
      curr = curr.next;
    }
    return null;
  }

  removeNode(node) {
    if (!node) return;

    const prevNode = node.prev;
    const nextNode = node.next;

    if (prevNode === null) {
      this.head = nextNode;
    } else {
      prevNode.next = nextNode;
    }

    if (nextNode === null) {
      this.tail = prevNode;
    } else {
      nextNode.prev = prevNode;
    }

    node.prev = null;
    node.next = null;
    this.count--;
  }

  evictHead() {
    if (this.isEmpty()) return null;
    const oldestRecord = this.head.record;
    this.removeNode(this.head);
    return oldestRecord;
  }

  findById(id) {
    const node = this.findNodeById(id);
    return node ? node.record : null;
  }

  findNodeById(id) {
    if (!id || this.isEmpty()) return null;
    let curr = this.head;
    while (curr !== null) {
      if (curr.record && curr.record.id === id) {
        return curr;
      }
      curr = curr.next;
    }
    return null;
  }

  getPreviousRecord(id) {
    const node = this.findNodeById(id);
    if (node && node.prev) {
      return node.prev.record;
    }
    return null;
  }

  getNextRecord(id) {
    const node = this.findNodeById(id);
    if (node && node.next) {
      return node.next.record;
    }
    return null;
  }

  traverseForward() {
    const result = [];
    let curr = this.head;
    while (curr !== null) {
      result.push(curr.record);
      curr = curr.next;
    }
    return result;
  }

  traverseBackward() {
    const result = [];
    let curr = this.tail;
    while (curr !== null) {
      result.push(curr.record);
      curr = curr.prev;
    }
    return result;
  }

  getAllRecords() {
    return this.traverseForward();
  }

  toArray() {
    return this.traverseForward();
  }

  size() {
    return this.count;
  }

  isEmpty() {
    return this.count === 0 || this.head === null;
  }

  clear() {
    let curr = this.head;
    while (curr !== null) {
      const next = curr.next;
      curr.prev = null;
      curr.next = null;
      curr = next;
    }
    this.head = null;
    this.tail = null;
    this.count = 0;
  }
}

// ==========================================
// 3. Custom Hash Table (Separate Chaining)
// ==========================================
export class HashEntry {
  constructor(url, title = '', timestamp = '') {
    this.url = url;
    this.title = title || url;
    this.visitCount = 1;
    this.lastVisitedAt = timestamp || new Date().toISOString();
    this.next = null; // Singly linked list in bucket
  }

  incrementVisit(timestamp = '', title = '') {
    this.visitCount++;
    if (timestamp) {
      this.lastVisitedAt = timestamp;
    }
    if (title && (!this.title || this.title === this.url)) {
      this.title = title;
    }
  }
}

export class CustomHashTable {
  constructor(initialCapacity = 17) {
    this.capacity = Math.max(initialCapacity, 7);
    this.buckets = new Array(this.capacity).fill(null);
    this.uniqueCount = 0;
    this.loadFactorThreshold = 0.75;
  }

  normalizeKey(key) {
    return key ? key.trim() : '';
  }

  computeHash(key) {
    if (!key) return 0;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (31 * hash + key.charCodeAt(i)) & 0x7fffffff;
    }
    return hash % this.capacity;
  }

  recordVisit(url, title = '', timestamp = '') {
    const normalizedUrl = this.normalizeKey(url);
    if (!normalizedUrl) return null;

    const index = this.computeHash(normalizedUrl);
    let curr = this.buckets[index];

    while (curr !== null) {
      if (curr.url === normalizedUrl) {
        curr.incrementVisit(timestamp, title);
        return curr;
      }
      curr = curr.next;
    }

    // Insert new entry at head of bucket chain
    const newEntry = new HashEntry(normalizedUrl, title, timestamp);
    newEntry.next = this.buckets[index];
    this.buckets[index] = newEntry;
    this.uniqueCount++;

    if (this.uniqueCount / this.capacity >= this.loadFactorThreshold) {
      this.rehash();
    }

    return newEntry;
  }

  search(url) {
    const normalizedUrl = this.normalizeKey(url);
    if (!normalizedUrl) return null;

    const index = this.computeHash(normalizedUrl);
    let curr = this.buckets[index];
    while (curr !== null) {
      if (curr.url === normalizedUrl) {
        return curr;
      }
      curr = curr.next;
    }
    return null;
  }

  searchWithMetrics(url) {
    const normalizedUrl = this.normalizeKey(url);
    if (!normalizedUrl) {
      return {
        entry: null,
        comparisons: 0,
        durationMs: 0,
        hashValue: 0,
        bucketIndex: -1,
        chainLength: 0,
        chainEntries: [],
      };
    }

    const t0 = performance.now();
    let rawHash = 0;
    for (let i = 0; i < normalizedUrl.length; i++) {
      rawHash = (31 * rawHash + normalizedUrl.charCodeAt(i)) & 0x7fffffff;
    }
    const index = rawHash % this.capacity;

    let comparisons = 0;
    let foundEntry = null;
    let chainLength = 0;
    const chainEntries = [];

    let curr = this.buckets[index];
    while (curr !== null) {
      chainLength++;
      chainEntries.push(curr.url);
      comparisons++;
      if (curr.url === normalizedUrl) {
        foundEntry = curr;
        // Continue counting remaining chain length for diagnostics
      }
      curr = curr.next;
    }

    const durationMs = performance.now() - t0;
    return {
      entry: foundEntry,
      comparisons,
      durationMs,
      hashValue: rawHash,
      bucketIndex: index,
      chainLength,
      chainEntries,
    };
  }

  contains(url) {
    return this.search(url) !== null;
  }

  getVisitCount(url) {
    const entry = this.search(url);
    return entry ? entry.visitCount : 0;
  }

  decrementVisit(url) {
    const normalizedUrl = this.normalizeKey(url);
    if (!normalizedUrl) return 0;

    const index = this.computeHash(normalizedUrl);
    let curr = this.buckets[index];
    let prev = null;

    while (curr !== null) {
      if (curr.url === normalizedUrl) {
        curr.visitCount--;
        if (curr.visitCount <= 0) {
          // Remove from bucket chain
          if (prev === null) {
            this.buckets[index] = curr.next;
          } else {
            prev.next = curr.next;
          }
          this.uniqueCount--;
          return 0;
        }
        return curr.visitCount;
      }
      prev = curr;
      curr = curr.next;
    }
    return 0;
  }

  remove(url) {
    const normalizedUrl = this.normalizeKey(url);
    if (!normalizedUrl) return false;

    const index = this.computeHash(normalizedUrl);
    let curr = this.buckets[index];
    let prev = null;

    while (curr !== null) {
      if (curr.url === normalizedUrl) {
        if (prev === null) {
          this.buckets[index] = curr.next;
        } else {
          prev.next = curr.next;
        }
        this.uniqueCount--;
        return true;
      }
      prev = curr;
      curr = curr.next;
    }
    return false;
  }

  getAllEntries() {
    const entries = [];
    for (let i = 0; i < this.capacity; i++) {
      let curr = this.buckets[i];
      while (curr !== null) {
        entries.push(curr);
        curr = curr.next;
      }
    }
    return entries;
  }

  getUniqueCount() {
    return this.uniqueCount;
  }

  getDiagnostics() {
    let emptyBuckets = 0;
    let collisions = 0;
    let longestChain = 0;

    for (let i = 0; i < this.capacity; i++) {
      let count = 0;
      let curr = this.buckets[i];
      if (curr === null) {
        emptyBuckets++;
      } else {
        while (curr !== null) {
          count++;
          curr = curr.next;
        }
        if (count > 1) {
          collisions += (count - 1);
        }
        if (count > longestChain) {
          longestChain = count;
        }
      }
    }

    return {
      capacity: this.capacity,
      uniqueCount: this.uniqueCount,
      loadFactor: Number((this.uniqueCount / this.capacity).toFixed(3)),
      emptyBuckets,
      occupiedBuckets: this.capacity - emptyBuckets,
      collisions,
      longestChain,
    };
  }

  rehash() {
    const oldBuckets = this.buckets;
    const newCapacity = this.getNextPrime(this.capacity * 2);

    this.buckets = new Array(newCapacity).fill(null);
    this.capacity = newCapacity;
    this.uniqueCount = 0;

    for (let i = 0; i < oldBuckets.length; i++) {
      let curr = oldBuckets[i];
      while (curr !== null) {
        const next = curr.next;
        const newIndex = this.computeHash(curr.url);
        curr.next = this.buckets[newIndex];
        this.buckets[newIndex] = curr;
        this.uniqueCount++;
        curr = next;
      }
    }
  }

  getNextPrime(n) {
    let candidate = Math.max(n, 7);
    while (!this.isPrime(candidate)) {
      candidate++;
    }
    return candidate;
  }

  isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }

  clear() {
    this.capacity = 17;
    this.buckets = new Array(this.capacity).fill(null);
    this.uniqueCount = 0;
  }
}

// ==========================================
// 4. Sequential (Linear) Search
// ==========================================
export class SequentialSearch {
  static searchByKeyword(records, query) {
    if (!records || records.length === 0 || !query || !query.trim()) {
      return { matches: [], comparisonCount: 0, durationMs: 0 };
    }

    const t0 = performance.now();
    const normalizedQuery = query.trim().toLowerCase();
    let comparisonCount = 0;
    const matches = [];

    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      comparisonCount++;
      if (!rec) continue;

      const titleMatch = rec.title && rec.title.toLowerCase().includes(normalizedQuery);
      const urlMatch = rec.url && rec.url.toLowerCase().includes(normalizedQuery);

      if (titleMatch || urlMatch) {
        matches.push(rec);
      }
    }

    const durationMs = performance.now() - t0;
    return {
      matches,
      comparisonCount,
      durationMs,
    };
  }

  static searchByExactUrl(records, targetUrl) {
    if (!records || records.length === 0 || !targetUrl) {
      return { found: false, record: null, comparisonCount: 0, durationMs: 0 };
    }

    const t0 = performance.now();
    const normalized = targetUrl.trim();
    let comparisonCount = 0;
    let foundRecord = null;

    for (let i = 0; i < records.length; i++) {
      comparisonCount++;
      const rec = records[i];
      if (rec && rec.url && rec.url.trim() === normalized) {
        foundRecord = rec;
        break;
      }
    }

    const durationMs = performance.now() - t0;
    return {
      found: foundRecord !== null,
      record: foundRecord,
      comparisonCount,
      durationMs,
    };
  }
}

// ==========================================
// 5. Merge Sort (Divide-and-Conquer)
// ==========================================
export class MergeSort {
  /**
   * Sorts history records by visit timestamp.
   * Stable: maintains original order for equal timestamps.
   */
  static sortHistoryByTimestamp(records, newestFirst = true) {
    if (!records || records.length <= 1) {
      return records ? [...records] : [];
    }

    const arr = [...records];
    const temp = new Array(arr.length);
    this._mergeSortHistory(arr, temp, 0, arr.length - 1, newestFirst);
    return arr;
  }

  static _mergeSortHistory(arr, temp, left, right, newestFirst) {
    if (left >= right) return;
    const mid = Math.floor(left + (right - left) / 2);

    this._mergeSortHistory(arr, temp, left, mid, newestFirst);
    this._mergeSortHistory(arr, temp, mid + 1, right, newestFirst);
    this._mergeHistory(arr, temp, left, mid, right, newestFirst);
  }

  static _mergeHistory(arr, temp, left, mid, right, newestFirst) {
    let i = left;
    let j = mid + 1;
    let k = left;

    while (i <= mid && j <= right) {
      const t1 = (arr[i] && (arr[i].visitedAt || arr[i].time)) || '';
      const t2 = (arr[j] && (arr[j].visitedAt || arr[j].time)) || '';

      const cmp = t1.localeCompare(t2);
      const takeLeft = newestFirst ? (cmp >= 0) : (cmp <= 0);

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

    for (let idx = left; idx <= right; idx++) {
      arr[idx] = temp[idx];
    }
  }

  /**
   * Sorts HashEntry objects descending by visitCount.
   */
  static sortHashEntriesByVisitCount(entries) {
    if (!entries || entries.length <= 1) {
      return entries ? [...entries] : [];
    }

    const arr = [...entries];
    const temp = new Array(arr.length);
    this._mergeSortEntries(arr, temp, 0, arr.length - 1);
    return arr;
  }

  static _mergeSortEntries(arr, temp, left, right) {
    if (left >= right) return;
    const mid = Math.floor(left + (right - left) / 2);

    this._mergeSortEntries(arr, temp, left, mid);
    this._mergeSortEntries(arr, temp, mid + 1, right);
    this._mergeEntries(arr, temp, left, mid, right);
  }

  static _mergeEntries(arr, temp, left, mid, right) {
    let i = left;
    let j = mid + 1;
    let k = left;

    while (i <= mid && j <= right) {
      // Descending by visit count (>= gives stability)
      if (arr[i].visitCount >= arr[j].visitCount) {
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

    for (let idx = left; idx <= right; idx++) {
      arr[idx] = temp[idx];
    }
  }
}
