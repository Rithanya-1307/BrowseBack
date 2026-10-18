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
 * Retrieves actual Chrome browsing history records directly using the Chrome History API.
 */
async function retrieveChromeHistory(options = {}) {
  // Check permission
  if (!chrome.history || typeof chrome.history.search !== 'function') {
    return {
      success: false,
      records: [],
      totalQueried: 0,
      permissionRequired: true,
      error: 'Chrome history permission not available or not granted in this browser context.'
    };
  }

  const timeRangeMs = typeof options.timeRangeMs === 'number' ? options.timeRangeMs : 604800000; // default 7 days
  const startTime = timeRangeMs > 0 ? Date.now() - timeRangeMs : 0;
  const maxResults = Math.min(Math.max(parseInt(options.maxResults, 10) || 250, 1), 5000);
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
      message: 'No web browsing visits found in Chrome for the selected criteria.'
    };
  }

  // 2. Fetch accurate visit timestamps for each item in batches of 20
  const extractedRecords = [];
  const CHUNK_SIZE = 20;

  for (let i = 0; i < validItems.length; i += CHUNK_SIZE) {
    const chunk = validItems.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async (item) => {
        const cleanUrl = (item.url || '').trim();
        if (!cleanUrl) return;
        const cleanTitle = (item.title || '').trim() || cleanUrl;

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
            if (relevantVisits.length > 0) {
              for (const v of relevantVisits) {
                extractedRecords.push({
                  url: cleanUrl,
                  title: cleanTitle,
                  visitedAt: safeIsoTimestamp(v.visitTime),
                  visitCount: item.visitCount || 1
                });
              }
            } else {
              extractedRecords.push({
                url: cleanUrl,
                title: cleanTitle,
                visitedAt: safeIsoTimestamp(item.lastVisitTime),
                visitCount: item.visitCount || 1
              });
            }
          } else {
            extractedRecords.push({
              url: cleanUrl,
              title: cleanTitle,
              visitedAt: safeIsoTimestamp(item.lastVisitTime),
              visitCount: item.visitCount || 1
            });
          }
        } catch {
          extractedRecords.push({
            url: cleanUrl,
            title: cleanTitle,
            visitedAt: safeIsoTimestamp(item.lastVisitTime),
            visitCount: item.visitCount || 1
          });
        }
      })
    );
  }

  // 3. Deduplicate records by URL + visitedAt
  const seenKeys = new Set();
  const uniqueRecords = [];

  for (const rec of extractedRecords) {
    if (!rec || !rec.url) continue;
    const key = `${rec.url}::${rec.visitedAt}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueRecords.push(rec);
    }
  }

  return {
    success: true,
    records: uniqueRecords,
    totalQueried: validItems.length,
    message: `Retrieved ${uniqueRecords.length} visits (${validItems.length} unique pages) from Chrome.`
  };
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
