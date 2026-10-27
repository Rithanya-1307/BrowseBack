/**
 * BrowseBack — Direct Chrome History Connection
 * Background Service Worker (Manifest V3)
 *
 * Responsibilities:
 * 1. Querying Chrome History API securely upon explicit user request.
 * 2. Strict origin checks restricting access exclusively to authorized BrowseBack origins.
 * 3. Sanitizing and transferring ONLY the fields required by BrowseBack (url, title, visitedAt, visitCount).
 * 4. Zero remote transmission: history stays 100% local inside the browser runtime.
 */

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

/**
 * Normalizes timestamps into valid ISO-8601 strings.
 * Handles microseconds (Chrome WebKit), seconds, and milliseconds cleanly.
 */
function safeIsoTimestamp(rawTime) {
  if (rawTime === null || rawTime === undefined || rawTime === '') {
    return new Date().toISOString();
  }
  let millis = Number(rawTime);
  if (isNaN(millis) || millis <= 0) {
    try {
      const d = new Date(rawTime);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
  // Microseconds (14-16 digits, e.g. WebKit / Chrome internal timestamps) -> convert to ms
  if (millis > 1e14) {
    millis = Math.floor(millis / 1000);
  } else if (millis < 1e11) {
    // Seconds (10 digits) -> convert to ms
    millis = millis * 1000;
  }
  try {
    const d = new Date(millis);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Validates that the URL is a real public or local web page (http/https),
 * filtering out browser internals, extensions, file URIs, and blank pages.
 */
function isValidWebUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase().trim();
  if (
    lower.startsWith('chrome://') ||
    lower.startsWith('chrome-extension://') ||
    lower.startsWith('edge://') ||
    lower.startsWith('devtools://') ||
    lower.startsWith('about:') ||
    lower.startsWith('view-source:') ||
    lower.startsWith('file://')
  ) {
    return false;
  }
  // Exclude local BrowseBack instances to avoid self-referential history loops
  if (
    lower.includes('localhost:5173') ||
    lower.includes('127.0.0.1:5173') ||
    lower.includes('localhost:3000') ||
    lower.includes('127.0.0.1:3000') ||
    lower.includes('localhost:8080')
  ) {
    return false;
  }
  return lower.startsWith('http://') || lower.startsWith('https://');
}

/**
 * Calculates calendar-month start epoch timestamp (milliseconds).
 * Accurately steps back exact calendar months and clamps day-of-month.
 */
function calculateCalendarStartTime(monthsAgo, refDate = new Date()) {
  const targetYear = refDate.getFullYear();
  const targetMonth = refDate.getMonth() - monthsAgo;
  const targetDay = refDate.getDate();

  const target = new Date(
    targetYear,
    targetMonth,
    1,
    refDate.getHours(),
    refDate.getMinutes(),
    refDate.getSeconds(),
    refDate.getMilliseconds()
  );

  const daysInTargetMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(targetDay, daysInTargetMonth));
  return target.getTime();
}

/**
 * Resolves start epoch timestamp for time range options.
 * Accurately supports 7 days, 1 month, 3 months, 6 months via calendar calculations.
 */
function resolveStartTime(options = {}) {
  if (typeof options.startTime === 'number' && options.startTime > 0) {
    return options.startTime;
  }

  const rangeKey = options.timeRange || options.timeRangeKey;
  if (rangeKey === '7d' || rangeKey === 604800000 || rangeKey === '604800000') {
    return Date.now() - (7 * 24 * 60 * 60 * 1000);
  }
  if (rangeKey === '1m' || rangeKey === 2592000000 || rangeKey === '2592000000') {
    return calculateCalendarStartTime(1);
  }
  if (rangeKey === '3m' || rangeKey === 7776000000 || rangeKey === '7776000000') {
    return calculateCalendarStartTime(3);
  }
  if (rangeKey === '6m' || rangeKey === 15552000000 || rangeKey === '15552000000') {
    return calculateCalendarStartTime(6);
  }

  if (typeof options.timeRangeMs === 'number' && options.timeRangeMs > 0) {
    if (options.timeRangeMs === 2592000000) return calculateCalendarStartTime(1);
    if (options.timeRangeMs === 7776000000) return calculateCalendarStartTime(3);
    if (options.timeRangeMs === 15552000000) return calculateCalendarStartTime(6);
    return Date.now() - options.timeRangeMs;
  }

  // Default: Past 7 days
  return Date.now() - (7 * 24 * 60 * 60 * 1000);
}

/**
 * Retrieves actual Chrome browsing history records directly using the Chrome History API.
 */
async function retrieveChromeHistory(options = {}) {
  // Check permission
  if (!chrome.history || typeof chrome.history.search !== 'function') {
    return {
      success: false,
      records: [],
      totalQueried: 0,
      isTruncated: false,
      permissionRequired: true,
      error: 'Chrome history permission not available or not granted in this browser context.'
    };
  }

  const startTime = resolveStartTime(options);
  const maxResults = Math.min(Math.max(parseInt(options.maxResults, 10) || 50000, 1), 100000);
  const textQuery = typeof options.text === 'string' ? options.text.trim() : '';

  const searchParams = {
    text: textQuery,
    maxResults: maxResults
  };
  if (startTime > 0) {
    searchParams.startTime = startTime;
  }

  // 1. Query chrome.history.search
  const historyItems = await new Promise((resolve, reject) => {
    try {
      chrome.history.search(searchParams, (results) => {
        if (chrome.runtime.lastError) {
          const err = chrome.runtime.lastError.message || 'chrome.history.search failed';
          console.error('[BrowseBack Extension] chrome.history.search error:', err);
          reject(new Error(err));
        } else {
          resolve(results || []);
        }
      });
    } catch (err) {
      console.error('[BrowseBack Extension] Exception calling chrome.history.search:', err);
      reject(err);
    }
  });

  // Filter out internal and non-web URLs
  const validItems = historyItems.filter((item) => isValidWebUrl(item.url));

  if (validItems.length === 0) {
    return {
      success: true,
      records: [],
      totalQueried: historyItems.length,
      isTruncated: historyItems.length >= maxResults,
      truncatedLimit: maxResults,
      startTime,
      message: 'No web browsing visits found in Chrome for the selected criteria.'
    };
  }

  // 2. Extract accurate visit events
  const extractedRecords = [];
  const multiVisitItems = [];

  for (const item of validItems) {
    const cleanUrl = (item.url || '').trim();
    if (!cleanUrl) continue;
    const cleanTitle = (item.title || '').trim() || cleanUrl;

    if (item.visitCount && item.visitCount > 1) {
      multiVisitItems.push({ cleanUrl, cleanTitle, item });
    } else {
      if (item.lastVisitTime && item.lastVisitTime >= startTime) {
        extractedRecords.push({
          url: cleanUrl,
          title: cleanTitle,
          visitedAt: safeIsoTimestamp(item.lastVisitTime),
          visitTime: item.lastVisitTime,
          visitId: item.id ? `item_${item.id}` : `${cleanUrl}::${item.lastVisitTime}`
        });
      }
    }
  }

  // Fetch visit timestamps for pages with multiple visits in concurrent chunks
  const CHUNK_SIZE = 50;
  for (let i = 0; i < multiVisitItems.length; i += CHUNK_SIZE) {
    const chunk = multiVisitItems.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async ({ cleanUrl, cleanTitle, item }) => {
        try {
          const visits = await new Promise((resolve) => {
            chrome.history.getVisits({ url: cleanUrl }, (res) => {
              if (chrome.runtime.lastError) {
                resolve([]);
              } else {
                resolve(res || []);
              }
            });
          });

          if (visits && visits.length > 0) {
            const relevantVisits = visits.filter(
              (v) => v && v.visitTime !== undefined && (startTime === 0 || v.visitTime >= startTime)
            );
            for (const v of relevantVisits) {
              extractedRecords.push({
                url: cleanUrl,
                title: cleanTitle,
                visitedAt: safeIsoTimestamp(v.visitTime),
                visitTime: v.visitTime,
                visitId: v.visitId ? `visit_${v.visitId}` : `${cleanUrl}::${v.visitTime}`
              });
            }
          } else if (item.lastVisitTime && item.lastVisitTime >= startTime) {
            extractedRecords.push({
              url: cleanUrl,
              title: cleanTitle,
              visitedAt: safeIsoTimestamp(item.lastVisitTime),
              visitTime: item.lastVisitTime,
              visitId: item.id ? `item_${item.id}` : `${cleanUrl}::${item.lastVisitTime}`
            });
          }
        } catch {
          if (item.lastVisitTime && item.lastVisitTime >= startTime) {
            extractedRecords.push({
              url: cleanUrl,
              title: cleanTitle,
              visitedAt: safeIsoTimestamp(item.lastVisitTime),
              visitTime: item.lastVisitTime,
              visitId: item.id ? `item_${item.id}` : `${cleanUrl}::${item.lastVisitTime}`
            });
          }
        }
      })
    );
  }

  // 3. Deduplicate records strictly by visit event identity
  const seenKeys = new Set();
  const uniqueRecords = [];

  for (const rec of extractedRecords) {
    if (!rec || !rec.url) continue;
    const key = rec.visitId || `${rec.url}::${rec.visitTime}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueRecords.push(rec);
    }
  }

  // 4. Sort chronologically ascending (oldest first) so DoublyLinkedList head = oldest, tail = newest
  uniqueRecords.sort((a, b) => {
    const tA = (typeof a.visitTime === 'number' ? a.visitTime : new Date(a.visitedAt).getTime()) || 0;
    const tB = (typeof b.visitTime === 'number' ? b.visitTime : new Date(b.visitedAt).getTime()) || 0;
    return tA - tB;
  });

  return {
    success: true,
    records: uniqueRecords,
    totalQueried: validItems.length,
    isTruncated: historyItems.length >= maxResults,
    truncatedLimit: maxResults,
    startTime: startTime,
    message: `Retrieved ${uniqueRecords.length} visits (${validItems.length} unique pages) from Chrome.`
  };
}

/**
 * Retrieves actual Chrome visit events for a specific URL or domain within the requested time range.
 */
async function retrieveUrlDetails(options = {}) {
  if (!chrome.history || typeof chrome.history.getVisits !== 'function') {
    return {
      success: false,
      error: 'Chrome history permission not available or not granted in this browser context.'
    };
  }

  const targetUrl = typeof options.url === 'string' ? options.url.trim() : '';
  const targetDomain = typeof options.domain === 'string' ? options.domain.trim() : '';
  const startTime = resolveStartTime(options);

  if (!targetUrl && !targetDomain) {
    return { success: false, error: 'Neither URL nor domain was provided.' };
  }

  // 1. If targetUrl is provided, query visits for this exact URL
  if (targetUrl) {
    let pageTitle = targetUrl;
    try {
      const searchRes = await new Promise((resolve) => {
        chrome.history.search({ text: targetUrl, maxResults: 10 }, (res) => {
          resolve(res || []);
        });
      });
      const match = searchRes.find(item => item && item.url === targetUrl) || searchRes[0];
      if (match && match.title) {
        pageTitle = match.title;
      }
    } catch {
      // Ignore search error and continue with getVisits
    }

    const rawVisits = await new Promise((resolve) => {
      chrome.history.getVisits({ url: targetUrl }, (res) => {
        if (chrome.runtime.lastError) {
          resolve([]);
        } else {
          resolve(res || []);
        }
      });
    });

    // Filter strictly by startTime
    const inRangeVisits = rawVisits.filter(
      (v) => v && v.visitTime !== undefined && (startTime === 0 || v.visitTime >= startTime)
    );

    // Deduplicate identical timestamps for the URL
    const seenTimes = new Set();
    const uniqueVisits = [];
    for (const v of inRangeVisits) {
      if (!seenTimes.has(v.visitTime)) {
        seenTimes.add(v.visitTime);
        uniqueVisits.push({
          visitTime: v.visitTime,
          visitedAt: safeIsoTimestamp(v.visitTime),
          transition: v.transition || 'link',
          visitId: v.visitId
        });
      }
    }

    // Sort descending by timestamp (newest visit first for display)
    uniqueVisits.sort((a, b) => b.visitTime - a.visitTime);

    let earliestTime = null;
    let latestTime = null;
    if (uniqueVisits.length > 0) {
      latestTime = uniqueVisits[0].visitedAt;
      earliestTime = uniqueVisits[uniqueVisits.length - 1].visitedAt;
    }

    let domain = '';
    try {
      domain = new URL(targetUrl).hostname.replace(/^www\./, '');
    } catch {
      domain = targetUrl;
    }

    return {
      success: true,
      url: targetUrl,
      title: pageTitle,
      domain,
      totalVisits: uniqueVisits.length,
      earliestVisit: earliestTime,
      latestVisit: latestTime,
      visits: uniqueVisits,
      timeRangeMs,
    };
  }

  // 2. If targetDomain is provided (domain-level summary)
  if (targetDomain) {
    const searchRes = await new Promise((resolve) => {
      const p = { text: targetDomain, maxResults: 500 };
      if (startTime > 0) p.startTime = startTime;
      chrome.history.search(p, (res) => {
        resolve(res || []);
      });
    });

    const matchingItems = searchRes.filter((item) => {
      if (!item || !item.url) return false;
      try {
        const u = new URL(item.url);
        return u.hostname.replace(/^www\./, '').toLowerCase() === targetDomain.toLowerCase();
      } catch {
        return false;
      }
    });

    const domainVisits = [];
    const seenKeys = new Set();

    for (const item of matchingItems) {
      const vRes = await new Promise((resolve) => {
        chrome.history.getVisits({ url: item.url }, (res) => {
          resolve(res || []);
        });
      });

      const inRange = vRes.filter(
        (v) => v && v.visitTime !== undefined && (startTime === 0 || v.visitTime >= startTime)
      );

      for (const v of inRange) {
        const key = `${item.url}::${v.visitTime}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          domainVisits.push({
            url: item.url,
            title: item.title || item.url,
            visitTime: v.visitTime,
            visitedAt: safeIsoTimestamp(v.visitTime),
            transition: v.transition || 'link',
          });
        }
      }
    }

    domainVisits.sort((a, b) => b.visitTime - a.visitTime);

    let earliestTime = null;
    let latestTime = null;
    if (domainVisits.length > 0) {
      latestTime = domainVisits[0].visitedAt;
      earliestTime = domainVisits[domainVisits.length - 1].visitedAt;
    }

    return {
      success: true,
      url: '',
      title: `Domain: ${targetDomain}`,
      domain: targetDomain,
      totalVisits: domainVisits.length,
      earliestVisit: earliestTime,
      latestVisit: latestTime,
      visits: domainVisits,
      timeRangeMs,
      matchingPagesCount: matchingItems.length
    };
  }
}

// Unified message router
function handleMessage(message, sender, sendResponse) {
  if (!message || !message.action) return false;

  // Origin security check for external messages
  const senderOrigin = sender?.origin || (sender?.url ? new URL(sender.url).origin : null);
  const isInternal = (sender?.id && sender.id === chrome.runtime.id) || (senderOrigin && senderOrigin.startsWith('chrome-extension://'));

  if (!isInternal && senderOrigin) {
    const isAllowed = ALLOWED_ORIGINS.some(allowed => senderOrigin === allowed || senderOrigin.startsWith(allowed));
    if (!isAllowed) {
      console.warn('[BrowseBack Extension] Blocked message from unauthorized origin:', senderOrigin);
      sendResponse({ success: false, error: `Unauthorized website origin: ${senderOrigin}` });
      return false;
    }
  }

  if (message.action === 'PING' || message.action === 'CHECK_PERMISSIONS') {
    const hasHistory = !!(chrome.history && typeof chrome.history.search === 'function');
    sendResponse({
      success: true,
      status: hasHistory ? 'PONG' : 'PERMISSION_REQUIRED',
      version: '1.1.0',
      service: 'BrowseBack-Direct-Extension',
      hasHistoryPermission: hasHistory,
      permissionRequired: !hasHistory
    });
    return false;
  }

  if (message.action === 'RETRIEVE_HISTORY') {
    retrieveChromeHistory(message.options)
      .then((result) => sendResponse(result))
      .catch((err) => {
        console.error('[BrowseBack Extension] retrieveChromeHistory caught error:', err);
        sendResponse({ success: false, records: [], permissionRequired: false, error: err.message || 'Failed to retrieve Chrome history' });
      });
    return true; // Keep channel open for async response
  }

  if (message.action === 'RETRIEVE_URL_DETAILS') {
    retrieveUrlDetails(message.options)
      .then((result) => sendResponse(result))
      .catch((err) => {
        console.error('[BrowseBack Extension] retrieveUrlDetails caught error:', err);
        sendResponse({ success: false, error: err.message || 'Failed to retrieve URL details from Chrome' });
      });
    return true; // Keep channel open for async response
  }

  return false;
}

// Listen for internal messages (from popup.js)
chrome.runtime.onMessage.addListener(handleMessage);

// Listen for direct external messages from authorized web pages
if (chrome.runtime.onMessageExternal) {
  chrome.runtime.onMessageExternal.addListener(handleMessage);
}

// Log lifecycle
chrome.runtime.onInstalled.addListener(() => {
  console.log('[BrowseBack Extension v1.1.0] Installed and ready for direct website connection.');
});
