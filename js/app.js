/**
 * BrowseBack — Application Logic and State Management (Vanilla JS)
 * 
 * Strict Academic Implementation:
 * - Employs custom DSA structures: CustomStack, DoublyLinkedList, CustomHashTable,
 *   SequentialSearch, and MergeSort.
 * - Genuine empty state on startup.
 * - Real interactions, real state updates, zero hardcoded/fabricated data.
 * - Fully accessible and responsive.
 */

import {
  CustomStack,
  DoublyLinkedList,
  CustomHashTable,
  SequentialSearch,
  MergeSort,
} from './dsa.js';

// ==========================================
// Application State Singleton
// ==========================================
class AppState {
  constructor() {
    // Persistent browsing history structures
    this.historyList = new DoublyLinkedList();
    this.urlIndex = new CustomHashTable(17);
    this.historyLimit = 0; // 0 = unlimited
    this.evictedCount = 0;

    // Simulated browser session navigation stacks
    this.backStack = new CustomStack();
    this.forwardStack = new CustomStack();
    this.currentPage = null;
    this.lastActionDescription = 'Browser session ready. Enter a URL above to start browsing.';

    // UI state
    this.selectedHistoryId = null;
    this.historySortOrder = 'newest';
    this.historyFilterQuery = '';
    this.activeTab = 'page-home';

    // Benchmark state
    this.benchmarkDatasetSize = 1000;

    // Chrome Extension Direct Connection & Lifecycle
    // States: 'disconnected' | 'connecting' | 'connected' | 'permission_required'
    this.connectionState = 'disconnected';
    this.extensionConnected = false;
    this.extensionVersion = '1.1.0';
    this.extensionId = null;
    this.domainStats = [];
    this.dashboardTimeRangeMs = 604800000; // default 7 days
  }
}

const state = new AppState();

// ==========================================
// DOM Element References
// ==========================================
const DOM = {
  // Navigation
  tabs: document.querySelectorAll('.nav-tab-btn'),
  pages: document.querySelectorAll('.page-view'),
  brandLink: document.getElementById('brand-home-link'),
  headerStatusDot: document.getElementById('header-status-dot'),
  headerStatusText: document.getElementById('header-status-text'),

  // Chrome Extension & My Browsing Dashboard Controls
  extStatusPill: document.getElementById('ext-status-pill'),
  extStatusDot: document.getElementById('ext-status-dot'),
  extStatusLabel: document.getElementById('ext-status-label'),
  btnConnectChrome: document.getElementById('btn-connect-chrome'),
  btnConnectChromeText: document.getElementById('btn-connect-chrome-text'),
  connectChromeSpinner: document.getElementById('connect-chrome-spinner'),
  connectedActions: document.getElementById('connected-actions'),
  dashboardTimeRange: document.getElementById('dashboard-time-range'),
  btnRefreshData: document.getElementById('btn-refresh-data'),
  btnRefreshText: document.getElementById('btn-refresh-text'),
  refreshIcon: document.getElementById('refresh-icon'),
  refreshSpinner: document.getElementById('refresh-spinner'),
  dashboardNotice: document.getElementById('dashboard-notice'),
  noticeIconBox: document.getElementById('notice-icon-box'),
  noticeTitle: document.getElementById('notice-title'),
  noticeDesc: document.getElementById('notice-desc'),
  btnNoticeAction: document.getElementById('btn-notice-action'),
  btnDismissNotice: document.getElementById('btn-dismiss-notice'),

  // 4 Dashboard Summary Cards
  dashUniqueWebsites: document.getElementById('dash-unique-websites'),
  dashSubtextUnique: document.getElementById('dash-subtext-unique'),
  dashTotalVisits: document.getElementById('dash-total-visits'),
  dashSubtextVisits: document.getElementById('dash-subtext-visits'),
  dashMostVisited: document.getElementById('dash-most-visited'),
  dashSubtextMostVisited: document.getElementById('dash-subtext-most-visited'),
  dashLatestVisit: document.getElementById('dash-latest-visit'),
  dashSubtextLatestVisit: document.getElementById('dash-subtext-latest-visit'),

  // Frequently Visited Websites
  frequentSitesList: document.getElementById('frequent-sites-list'),
  frequentEmptyState: document.getElementById('frequent-empty-state'),

  // Secondary Tools (Manual JSON Import & Extension Setup)
  secondaryToolsToggle: document.getElementById('secondary-tools-toggle'),
  secondaryToolsChevron: document.getElementById('secondary-tools-chevron'),
  secondaryToolsContent: document.getElementById('secondary-tools-content'),
  fileInput: document.getElementById('history-file-input'),
  dropzone: document.getElementById('import-dropzone'),
  btnBrowse: document.getElementById('btn-browse-file'),
  importStatus: document.getElementById('import-status-area'),
  btnTogglePaste: document.getElementById('btn-toggle-paste-json'),
  pasteContainer: document.getElementById('paste-json-container'),
  pasteTextarea: document.getElementById('paste-json-textarea'),
  btnCancelPaste: document.getElementById('btn-cancel-paste-json'),
  btnSubmitPaste: document.getElementById('btn-submit-paste-json'),
  btnRecheckExt: document.getElementById('btn-recheck-ext'),
  extIdInput: document.getElementById('ext-id-input'),
  btnSaveExtId: document.getElementById('btn-save-ext-id'),

  // Browser Simulator
  btnBack: document.getElementById('btn-browser-back'),
  btnForward: document.getElementById('btn-browser-forward'),
  addressInput: document.getElementById('browser-address-input'),
  btnGo: document.getElementById('btn-browser-go'),
  actionText: document.getElementById('browser-action-text'),
  currentPageTitle: document.getElementById('current-page-title'),
  currentPageUrl: document.getElementById('current-page-url'),
  currentPageVisits: document.getElementById('current-page-visits'),
  currentPageTime: document.getElementById('current-page-time'),
  backStackCount: document.getElementById('back-stack-count'),
  backStackList: document.getElementById('back-stack-list'),
  forwardStackCount: document.getElementById('forward-stack-count'),
  forwardStackList: document.getElementById('forward-stack-list'),

  // History Table & Details
  evictionBanner: document.getElementById('history-eviction-banner'),
  evictionText: document.getElementById('eviction-notice-text'),
  detailsTotal: document.getElementById('details-total-count'),
  detailsEarliest: document.getElementById('details-earliest-time'),
  detailsLatest: document.getElementById('details-latest-time'),
  neighborPrevTitle: document.getElementById('neighbor-prev-title'),
  neighborPrevUrl: document.getElementById('neighbor-prev-url'),
  neighborNextTitle: document.getElementById('neighbor-next-title'),
  neighborNextUrl: document.getElementById('neighbor-next-url'),
  historySearchInput: document.getElementById('history-search-input'),
  historySortSelect: document.getElementById('history-sort-select'),
  historyLimitSelect: document.getElementById('history-limit-select'),
  btnExportJson: document.getElementById('btn-export-json'),
  btnClearHistory: document.getElementById('btn-clear-history'),
  historyTbody: document.getElementById('history-tbody'),

  // Search & Insights
  subtabFind: document.getElementById('subtab-find'),
  subtabKeyword: document.getElementById('subtab-keyword'),
  secFind: document.getElementById('search-sec-find'),
  secKeyword: document.getElementById('search-sec-keyword'),
  formFind: document.getElementById('form-find-page'),
  inputFind: document.getElementById('input-find-url'),
  findResult: document.getElementById('find-page-result'),
  formKeyword: document.getElementById('form-keyword-search'),
  inputKeyword: document.getElementById('input-keyword-search'),
  keywordResults: document.getElementById('keyword-search-results'),
  btnToggleInsights: document.getElementById('btn-toggle-insights'),
  insightsChevron: document.getElementById('insights-chevron'),
  insightsPanel: document.getElementById('insights-panel'),
  diagCapacity: document.getElementById('diag-capacity'),
  diagUnique: document.getElementById('diag-unique'),
  diagLoadFactor: document.getElementById('diag-load-factor'),
  diagCollisions: document.getElementById('diag-collisions'),
  diagLongestChain: document.getElementById('diag-longest-chain'),
  diagEmptyBuckets: document.getElementById('diag-empty-buckets'),
  insightLastQueryBox: document.getElementById('insight-last-query-box'),
  insightChainViewer: document.getElementById('insight-chain-viewer'),

  // Performance Benchmark
  btnBenchmark1000: document.getElementById('btn-size-1000'),
  btnBenchmark5000: document.getElementById('btn-size-5000'),
  btnBenchmark10000: document.getElementById('btn-size-10000'),
  btnRunBenchmark: document.getElementById('btn-run-benchmark'),
  btnBenchmarkText: document.getElementById('btn-benchmark-text'),
  benchmarkSpinner: document.getElementById('benchmark-spinner'),
  benchmarkInitialState: document.getElementById('benchmark-initial-state'),
  benchmarkResultsContainer: document.getElementById('benchmark-results-container'),
  benchmarkTbody: document.getElementById('benchmark-tbody'),
  benchmarkChart: document.getElementById('benchmark-chart'),

  // Modal & Toast
  confirmModal: document.getElementById('confirm-modal'),
  btnModalCancel: document.getElementById('btn-modal-cancel'),
  btnModalConfirm: document.getElementById('btn-modal-confirm'),
  toastContainer: document.getElementById('toast-container'),
};

// ==========================================
// Navigation & Tab Switching
// ==========================================
function switchTab(targetPageId) {
  state.activeTab = targetPageId;

  // Update tabs
  DOM.tabs.forEach((tab) => {
    const isActive = tab.getAttribute('data-target') === targetPageId;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Update pages
  DOM.pages.forEach((page) => {
    const isActive = page.id === targetPageId;
    page.classList.toggle('active', isActive);
  });

  // Page-specific refresh when viewed
  if (targetPageId === 'page-history') {
    renderHistoryTable();
    renderHistoryDetails();
  } else if (targetPageId === 'page-search') {
    renderDiagnostics();
  } else if (targetPageId === 'page-browser') {
    renderBrowserView();
  }
}

// ==========================================
// Toast Notifications
// ==========================================
function showToast(message, type = 'info') {
  if (!DOM.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 200ms ease';
    setTimeout(() => toast.remove(), 200);
  }, 3200);
}

// ==========================================
// Formatting Helpers
// ==========================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(isoString) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return String(isoString);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// ==========================================
// JSON History Import & Validation
// ==========================================
function processJsonString(content, sourceName = 'file') {
  if (!content || !content.trim()) {
    DOM.importStatus.innerHTML = `
      <div class="alert alert-error">
        <strong>Import Error:</strong> The provided JSON data is empty. Please provide valid JSON content.
      </div>
    `;
    return;
  }

  try {
    let rawData;
    try {
      rawData = JSON.parse(content);
    } catch (parseErr) {
      DOM.importStatus.innerHTML = `
        <div class="alert alert-error">
          <strong>Malformed JSON:</strong> Could not parse JSON. Please verify the syntax. (${escapeHtml(parseErr.message)})
        </div>
      `;
      return;
    }

    // Identify record list
    let rawList = [];
    if (Array.isArray(rawData)) {
      rawList = rawData;
    } else if (rawData && typeof rawData === 'object') {
      if (Array.isArray(rawData['Browser History'])) {
        // Standard Chrome Takeout
        rawList = rawData['Browser History'];
      } else if (Array.isArray(rawData.history)) {
        rawList = rawData.history;
      } else if (Array.isArray(rawData.records)) {
        rawList = rawData.records;
      } else {
        DOM.importStatus.innerHTML = `
          <div class="alert alert-error">
            <strong>Unsupported JSON Structure:</strong> Expected an array of browsing records or an object with a "Browser History" array.
          </div>
        `;
        return;
      }
    }

    if (rawList.length === 0) {
      DOM.importStatus.innerHTML = `
        <div class="alert alert-error">
          <strong>Empty Dataset:</strong> The JSON data contains zero browsing history records.
        </div>
      `;
      return;
    }

    // Reset application history state to prevent stale data
    state.historyList.clear();
    state.urlIndex.clear();
    state.evictedCount = 0;
    state.selectedHistoryId = null;

    let validCount = 0;

    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      if (!item || typeof item !== 'object') continue;

      let url = item.url || item.URL;
      if (!url || typeof url !== 'string' || !url.trim()) continue;
      url = url.trim();

      let title = item.title || item.Title || extractDomain(url);
      if (typeof title !== 'string') title = String(title);

      let visitedAt = '';
      if (typeof item.time_usec === 'number') {
        // Chrome Takeout: microseconds since 1970
        visitedAt = new Date(item.time_usec / 1000).toISOString();
      } else if (item.visitedAt) {
        visitedAt = new Date(item.visitedAt).toISOString();
      } else if (item.time || item.timestamp) {
        const rawTime = item.time || item.timestamp;
        const parsedTime = new Date(rawTime);
        visitedAt = !isNaN(parsedTime.getTime()) ? parsedTime.toISOString() : new Date().toISOString();
      } else {
        visitedAt = new Date().toISOString();
      }

      const record = {
        id: `rec_${Date.now()}_${i}`,
        url,
        title,
        visitedAt,
      };

      state.historyList.addLast(record);
      state.urlIndex.recordVisit(url, title, visitedAt);
      validCount++;
    }

    if (validCount === 0) {
      DOM.importStatus.innerHTML = `
        <div class="alert alert-error">
          <strong>No Valid Records:</strong> None of the items contained a valid 'url' field.
        </div>
      `;
      return;
    }

    // Apply history size limit if set
    applyHistoryLimit();

    // Update Summary Cards & UI
    renderHomeSummary();
    renderHistoryTable();
    renderHistoryDetails();
    renderDiagnostics();
    updateHeaderStatus();

    DOM.importStatus.innerHTML = `
      <div class="alert alert-success">
        <strong>Success:</strong> Successfully imported ${validCount} visit records (${state.urlIndex.getUniqueCount()} unique URLs) from ${escapeHtml(sourceName)}.
      </div>
    `;
    showToast(`Imported ${validCount} history records`);

    if (DOM.pasteContainer) {
      DOM.pasteContainer.style.display = 'none';
      DOM.pasteTextarea.value = '';
    }

  } catch (err) {
    DOM.importStatus.innerHTML = `
      <div class="alert alert-error">
        <strong>Processing Error:</strong> An unexpected error occurred while processing the history: ${escapeHtml(err.message)}
      </div>
    `;
  }
}

async function handleHistoryFile(file) {
  if (!file) return;

  DOM.importStatus.className = 'import-status-area visible';
  DOM.importStatus.innerHTML = `
    <div class="alert alert-info">
      <span class="spinner" style="border-top-color: var(--color-back); width: 14px; height: 14px;"></span>
      <span>Processing ${escapeHtml(file.name)}...</span>
    </div>
  `;

  if (file.size === 0) {
    DOM.importStatus.innerHTML = `
      <div class="alert alert-error">
        <strong>Import Error:</strong> The selected file is completely empty. Please choose a valid JSON file.
      </div>
    `;
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    processJsonString(e.target.result, file.name);
  };
  reader.onerror = () => {
    DOM.importStatus.innerHTML = `
      <div class="alert alert-error">
        <strong>File Read Error:</strong> Could not read the selected file from disk.
      </div>
    `;
  };
  reader.readAsText(file);
}

function handlePasteJson() {
  const content = DOM.pasteTextarea.value;
  DOM.importStatus.className = 'import-status-area visible';
  processJsonString(content, 'pasted JSON');
}

// ==========================================
// Dashboard Notice Banner Helpers
// ==========================================
function showDashboardNotice({ title, desc, type = 'warning', actionText = null, actionHandler = null }) {
  if (!DOM.dashboardNotice) return;
  DOM.dashboardNotice.className = `dashboard-notice-banner notice-${type}`;
  if (DOM.noticeTitle) DOM.noticeTitle.textContent = title;
  if (DOM.noticeDesc) DOM.noticeDesc.innerHTML = desc;
  DOM.dashboardNotice.style.display = 'flex';

  if (actionText && actionHandler && DOM.btnNoticeAction) {
    DOM.btnNoticeAction.textContent = actionText;
    DOM.btnNoticeAction.style.display = 'inline-flex';
    DOM.btnNoticeAction.onclick = actionHandler;
  } else if (DOM.btnNoticeAction) {
    DOM.btnNoticeAction.style.display = 'none';
  }
}

function hideDashboardNotice() {
  if (DOM.dashboardNotice) {
    DOM.dashboardNotice.style.display = 'none';
  }
}

// ==========================================
// Direct Chrome Extension Connection & Lifecycle
// ==========================================

function getExtensionId() {
  if (state.extensionId) return state.extensionId;
  const fromDom = document.documentElement.getAttribute('data-browseback-extension-id');
  if (fromDom) {
    state.extensionId = fromDom;
    try { localStorage.setItem('browseback_extension_id', fromDom); } catch (e) {}
    if (DOM.extIdInput && !DOM.extIdInput.value) DOM.extIdInput.value = fromDom;
    return fromDom;
  }
  try {
    const fromStorage = localStorage.getItem('browseback_extension_id');
    if (fromStorage) {
      state.extensionId = fromStorage;
      if (DOM.extIdInput && !DOM.extIdInput.value) DOM.extIdInput.value = fromStorage;
      return fromStorage;
    }
  } catch (e) {}
  if (DOM.extIdInput && DOM.extIdInput.value.trim()) {
    const fromInput = DOM.extIdInput.value.trim();
    state.extensionId = fromInput;
    return fromInput;
  }
  return null;
}

function sendExtensionMessage(message) {
  return new Promise((resolve, reject) => {
    const extId = getExtensionId();
    if (!extId) {
      return reject(new Error('Extension ID not detected. Please load the BrowseBack extension in chrome://extensions and reload this page.'));
    }
    if (typeof window.chrome === 'undefined' || !window.chrome.runtime || typeof window.chrome.runtime.sendMessage !== 'function') {
      return reject(new Error('Direct chrome.runtime.sendMessage is unavailable. Ensure you are browsing http://localhost:5173 in Google Chrome.'));
    }

    try {
      window.chrome.runtime.sendMessage(extId, message, (response) => {
        const lastError = window.chrome.runtime.lastError;
        if (lastError) {
          const errMsg = lastError.message || 'Extension runtime communication failed.';
          console.error('[BrowseBack] Extension messaging error:', errMsg);
          return reject(new Error(errMsg));
        }
        if (!response) {
          return reject(new Error('No response received from extension background service worker.'));
        }
        resolve(response);
      });
    } catch (err) {
      console.error('[BrowseBack] Exception in chrome.runtime.sendMessage:', err);
      reject(err);
    }
  });
}

function setExtensionConnectionState(newState, detail = {}) {
  state.connectionState = newState;
  if (detail.version) state.extensionVersion = detail.version;
  if (detail.extensionId) {
    state.extensionId = detail.extensionId;
    try { localStorage.setItem('browseback_extension_id', detail.extensionId); } catch (e) {}
    if (DOM.extIdInput) DOM.extIdInput.value = detail.extensionId;
  }

  if (!DOM.extStatusPill) return;

  // Update status pill styling
  DOM.extStatusPill.className = `connection-status-pill status-${newState}`;

  switch (newState) {
    case 'disconnected':
      state.extensionConnected = false;
      DOM.extStatusLabel.textContent = 'Extension Disconnected';
      if (DOM.btnConnectChrome) {
        DOM.btnConnectChrome.style.display = 'inline-flex';
        DOM.btnConnectChrome.disabled = false;
        if (DOM.btnConnectChromeText) DOM.btnConnectChromeText.textContent = 'Connect Chrome';
      }
      if (DOM.connectChromeSpinner) DOM.connectChromeSpinner.style.display = 'none';
      if (DOM.connectedActions) DOM.connectedActions.style.display = 'none';
      break;

    case 'connecting':
      state.extensionConnected = false;
      DOM.extStatusLabel.textContent = 'Connecting to Chrome...';
      if (DOM.btnConnectChrome) {
        DOM.btnConnectChrome.style.display = 'inline-flex';
        DOM.btnConnectChrome.disabled = true;
        if (DOM.btnConnectChromeText) DOM.btnConnectChromeText.textContent = 'Connecting...';
      }
      if (DOM.connectChromeSpinner) DOM.connectChromeSpinner.style.display = 'inline-block';
      if (DOM.connectedActions) DOM.connectedActions.style.display = 'none';
      break;

    case 'connected':
      state.extensionConnected = true;
      const vText = state.extensionVersion ? ` (v${state.extensionVersion})` : '';
      DOM.extStatusLabel.textContent = `Connected to Chrome${vText}`;
      if (DOM.btnConnectChrome) DOM.btnConnectChrome.style.display = 'none';
      if (DOM.connectChromeSpinner) DOM.connectChromeSpinner.style.display = 'none';
      if (DOM.connectedActions) DOM.connectedActions.style.display = 'flex';
      if (DOM.btnRefreshData) DOM.btnRefreshData.disabled = false;
      if (DOM.refreshSpinner) DOM.refreshSpinner.style.display = 'none';
      if (DOM.refreshIcon) DOM.refreshIcon.style.display = 'inline-block';
      hideDashboardNotice();
      break;

    case 'permission_required':
      state.extensionConnected = false;
      DOM.extStatusLabel.textContent = 'Permission Required';
      if (DOM.btnConnectChrome) {
        DOM.btnConnectChrome.style.display = 'inline-flex';
        DOM.btnConnectChrome.disabled = false;
        if (DOM.btnConnectChromeText) DOM.btnConnectChromeText.textContent = 'Grant Permission';
      }
      if (DOM.connectChromeSpinner) DOM.connectChromeSpinner.style.display = 'none';
      if (DOM.connectedActions) DOM.connectedActions.style.display = 'none';
      showDashboardNotice({
        title: 'Chrome History Permission Required',
        desc: 'BrowseBack extension requires Chrome History permission. Please ensure the extension is enabled in <code>chrome://extensions</code> with history permissions enabled.',
        type: 'warning',
        actionText: 'Retry Connection',
        actionHandler: () => connectChromeExtension(true)
      });
      break;
  }
}

async function checkChromeExtensionConnection() {
  const extId = getExtensionId();
  if (!extId) {
    setExtensionConnectionState('disconnected');
    return;
  }

  try {
    const res = await sendExtensionMessage({ action: 'PING' });
    if (res && (res.status === 'PONG' || res.hasHistoryPermission)) {
      setExtensionConnectionState('connected', {
        version: res.version || '1.1.0',
        extensionId: extId
      });
    } else if (res && (res.status === 'PERMISSION_REQUIRED' || res.permissionRequired)) {
      setExtensionConnectionState('permission_required', {
        version: res.version || '1.1.0',
        extensionId: extId
      });
    } else {
      setExtensionConnectionState('disconnected');
    }
  } catch (err) {
    console.debug('[BrowseBack] Extension ping notice:', err.message);
    // Never show connected if ping fails or context is invalidated!
    setExtensionConnectionState('disconnected');
  }
}

async function connectChromeExtension(triggerFetch = true) {
  setExtensionConnectionState('connecting');

  const extId = getExtensionId();
  if (!extId) {
    setExtensionConnectionState('disconnected');
    showDashboardNotice({
      title: 'Extension Not Detected',
      desc: 'Could not connect to the BrowseBack Chrome Extension. Load the extension in <code>chrome://extensions</code> using Developer mode.',
      type: 'warning',
      actionText: 'Setup Instructions',
      actionHandler: () => {
        if (DOM.secondaryToolsContent) {
          DOM.secondaryToolsContent.style.display = 'block';
          if (DOM.secondaryToolsToggle) DOM.secondaryToolsToggle.setAttribute('aria-expanded', 'true');
          DOM.secondaryToolsContent.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
    return;
  }

  try {
    const res = await sendExtensionMessage({ action: 'CHECK_PERMISSIONS' });
    if (res && (res.hasHistoryPermission || res.status === 'PONG')) {
      setExtensionConnectionState('connected', {
        version: res.version || '1.1.0',
        extensionId: extId
      });
      showToast('Connected to BrowseBack Chrome Extension');
      if (triggerFetch) {
        await refreshDashboardData();
      }
    } else if (res && (res.permissionRequired || res.status === 'PERMISSION_REQUIRED')) {
      setExtensionConnectionState('permission_required', {
        version: res.version || '1.1.0',
        extensionId: extId
      });
    } else {
      setExtensionConnectionState('disconnected');
      showDashboardNotice({
        title: 'Extension Unavailable',
        desc: escapeHtml(res?.error || 'Extension service is not active.'),
        type: 'error'
      });
    }
  } catch (err) {
    console.error('[BrowseBack] Connect Chrome failed:', err);
    setExtensionConnectionState('disconnected');
    showDashboardNotice({
      title: 'Connection Failed',
      desc: `Could not connect to extension: <code>${escapeHtml(err.message)}</code>. If you reloaded the extension in <code>chrome://extensions</code>, click Retry.`,
      type: 'error',
      actionText: 'Retry Connection',
      actionHandler: () => connectChromeExtension(triggerFetch)
    });
    showToast(`Connection failed: ${err.message}`, 'error');
  }
}

async function refreshDashboardData() {
  if (DOM.btnRefreshData) DOM.btnRefreshData.disabled = true;
  if (DOM.refreshIcon) DOM.refreshIcon.style.display = 'none';
  if (DOM.refreshSpinner) DOM.refreshSpinner.style.display = 'inline-block';
  if (DOM.btnRefreshText) DOM.btnRefreshText.textContent = 'Refreshing...';

  const timeRangeMs = DOM.dashboardTimeRange ? parseInt(DOM.dashboardTimeRange.value, 10) : state.dashboardTimeRangeMs;
  state.dashboardTimeRangeMs = timeRangeMs;

  try {
    const result = await sendExtensionMessage({
      action: 'RETRIEVE_HISTORY',
      options: {
        timeRangeMs,
        maxResults: 500
      }
    });

    if (result && result.success && Array.isArray(result.records)) {
      setExtensionConnectionState('connected');
      if (result.records.length === 0) {
        state.historyList.clear();
        state.urlIndex.clear();
        state.evictedCount = 0;
        state.selectedHistoryId = null;
        renderDashboard();
        renderHistoryTable();
        renderHistoryDetails();
        renderDiagnostics();
        updateHeaderStatus();
        showToast('No Chrome visits found for selected criteria');
      } else {
        processDirectChromeRecords(result.records);
      }
    } else if (result && result.permissionRequired) {
      setExtensionConnectionState('permission_required');
    } else {
      const errorMsg = result?.error || 'Could not retrieve history from Chrome.';
      console.error('[BrowseBack] History retrieval failure:', errorMsg);
      showDashboardNotice({
        title: 'History Retrieval Failed',
        desc: escapeHtml(errorMsg),
        type: 'error',
        actionText: 'Retry Refresh',
        actionHandler: () => refreshDashboardData()
      });
      showToast('Chrome history retrieval failed', 'error');
    }
  } catch (err) {
    console.error('[BrowseBack] History retrieval error:', err);
    // Mark as disconnected immediately! Remove false green connected badge!
    setExtensionConnectionState('disconnected');
    showDashboardNotice({
      title: 'History Retrieval Failed',
      desc: escapeHtml(err.message || 'Extension runtime communication failed.'),
      type: 'error',
      actionText: 'Reconnect Extension',
      actionHandler: () => connectChromeExtension(true)
    });
    showToast(`Chrome history retrieval failed: ${err.message}`, 'error');
  } finally {
    if (DOM.btnRefreshData) DOM.btnRefreshData.disabled = false;
    if (DOM.refreshSpinner) DOM.refreshSpinner.style.display = 'none';
    if (DOM.refreshIcon) DOM.refreshIcon.style.display = 'inline-block';
    if (DOM.btnRefreshText) DOM.btnRefreshText.textContent = 'Refresh Data';
  }
}

function processDirectChromeRecords(records) {
  // Clear existing data to prevent duplicate counting on refresh
  state.historyList.clear();
  state.urlIndex.clear();
  state.evictedCount = 0;
  state.selectedHistoryId = null;

  let validCount = 0;

  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    if (!item || !item.url) continue;

    const record = {
      id: `chrome_${Date.now()}_${i}`,
      url: item.url.trim(),
      title: item.title || extractDomain(item.url),
      visitedAt: item.visitedAt || new Date().toISOString()
    };

    state.historyList.addLast(record);
    state.urlIndex.recordVisit(record.url, record.title, record.visitedAt);
    validCount++;
  }

  applyHistoryLimit();

  renderDashboard();
  renderHistoryTable();
  renderHistoryDetails();
  renderDiagnostics();
  updateHeaderStatus();

  showToast(`Loaded ${validCount.toLocaleString()} Chrome visits`);
}

// ==========================================
// Bounded History Management
// ==========================================
function applyHistoryLimit() {
  if (state.historyLimit <= 0) return;

  let evictedThisTime = 0;
  while (state.historyList.size() > state.historyLimit) {
    const oldest = state.historyList.evictHead();
    if (oldest) {
      state.urlIndex.decrementVisit(oldest.url);
      state.evictedCount++;
      evictedThisTime++;
    }
  }

  if (state.evictedCount > 0) {
    if (DOM.evictionBanner) DOM.evictionBanner.style.display = 'flex';
    if (DOM.evictionText) DOM.evictionText.textContent = `History limit (${state.historyLimit} records) active: ${state.evictedCount} oldest record(s) have been evicted.`;
  } else {
    if (DOM.evictionBanner) DOM.evictionBanner.style.display = 'none';
  }
}

// ==========================================
// Page 1: My Browsing Dashboard Rendering
// ==========================================
function renderDashboard() {
  const records = state.historyList.toArray();
  const totalVisitsCount = records.length;

  if (totalVisitsCount === 0) {
    if (DOM.dashUniqueWebsites) DOM.dashUniqueWebsites.textContent = '--';
    if (DOM.dashSubtextUnique) DOM.dashSubtextUnique.textContent = 'Distinct domains visited';
    if (DOM.dashTotalVisits) DOM.dashTotalVisits.textContent = '--';
    if (DOM.dashSubtextVisits) DOM.dashSubtextVisits.textContent = 'Recorded visit events';
    if (DOM.dashMostVisited) {
      DOM.dashMostVisited.textContent = '--';
      DOM.dashMostVisited.removeAttribute('title');
    }
    if (DOM.dashSubtextMostVisited) DOM.dashSubtextMostVisited.textContent = 'Highest visit frequency';
    if (DOM.dashLatestVisit) {
      DOM.dashLatestVisit.textContent = '--';
      DOM.dashLatestVisit.removeAttribute('title');
    }
    if (DOM.dashSubtextLatestVisit) DOM.dashSubtextLatestVisit.textContent = 'Most recent recorded time';

    if (DOM.frequentSitesList) {
      DOM.frequentSitesList.innerHTML = `
        <div class="empty-dashboard-state" id="frequent-empty-state">
          <div class="empty-state-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
          </div>
          <p class="empty-state-title">No browsing activity recorded yet</p>
          <p class="empty-state-desc">Connect your Chrome extension or refresh data to view your top 5 most visited websites.</p>
        </div>
      `;
    }
    return;
  }

  // Domain aggregation & latest visit calculation
  const domainMap = new Map();
  let maxTimeMs = -1;
  let overallLatestDomain = null;
  let overallLatestTime = null;

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    if (!rec || !rec.url) continue;

    const domain = extractDomain(rec.url);
    if (!domain) continue;

    const tStr = rec.visitedAt || rec.time || '';
    const tMs = tStr ? new Date(tStr).getTime() : 0;
    if (!isNaN(tMs) && tMs > maxTimeMs) {
      maxTimeMs = tMs;
      overallLatestDomain = domain;
      overallLatestTime = tStr;
    }

    if (!domainMap.has(domain)) {
      domainMap.set(domain, {
        domain,
        visitCount: 1,
        latestTime: tStr
      });
    } else {
      const entry = domainMap.get(domain);
      entry.visitCount += 1;
      const curEntryMs = entry.latestTime ? new Date(entry.latestTime).getTime() : 0;
      if (!isNaN(tMs) && tMs > curEntryMs) {
        entry.latestTime = tStr;
      }
    }
  }

  // 1. Unique Websites (distinct domains)
  const uniqueDomainsCount = domainMap.size;
  if (DOM.dashUniqueWebsites) DOM.dashUniqueWebsites.textContent = uniqueDomainsCount.toLocaleString();
  if (DOM.dashSubtextUnique) {
    DOM.dashSubtextUnique.textContent = `${uniqueDomainsCount.toLocaleString()} distinct website domain${uniqueDomainsCount === 1 ? '' : 's'}`;
  }

  // 2. Total Visits (all visit events)
  if (DOM.dashTotalVisits) DOM.dashTotalVisits.textContent = totalVisitsCount.toLocaleString();
  if (DOM.dashSubtextVisits) {
    DOM.dashSubtextVisits.textContent = `${totalVisitsCount.toLocaleString()} recorded visit event${totalVisitsCount === 1 ? '' : 's'}`;
  }

  // 3. Most Visited Website (sorted with MergeSort)
  const domainArray = Array.from(domainMap.values());
  const sortedDomains = MergeSort.sortHashEntriesByVisitCount(domainArray);
  state.domainStats = sortedDomains;

  if (sortedDomains.length > 0) {
    const topSite = sortedDomains[0];
    if (DOM.dashMostVisited) {
      DOM.dashMostVisited.textContent = topSite.domain;
      DOM.dashMostVisited.setAttribute('title', topSite.domain);
    }
    if (DOM.dashSubtextMostVisited) {
      DOM.dashSubtextMostVisited.textContent = `${topSite.visitCount.toLocaleString()} recorded visit${topSite.visitCount === 1 ? '' : 's'}`;
    }
  }

  // 4. Latest Visit
  if (DOM.dashLatestVisit && overallLatestDomain) {
    DOM.dashLatestVisit.textContent = overallLatestDomain;
    DOM.dashLatestVisit.setAttribute('title', overallLatestDomain);
  }
  if (DOM.dashSubtextLatestVisit && overallLatestTime) {
    DOM.dashSubtextLatestVisit.textContent = formatDate(overallLatestTime);
  }

  // 5. Frequently Visited Websites (up to 5 items)
  if (DOM.frequentSitesList) {
    const top5 = sortedDomains.slice(0, 5);
    const maxVisits = top5.length > 0 ? top5[0].visitCount : 1;

    let itemsHtml = '';
    top5.forEach((site, index) => {
      const rank = index + 1;
      const percent = Math.max(8, Math.min(100, Math.round((site.visitCount / maxVisits) * 100)));
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(site.domain)}&sz=32`;

      itemsHtml += `
        <div class="frequent-site-item" data-domain="${escapeHtml(site.domain)}">
          <div class="site-bar-fill" style="width: ${percent}%;"></div>
          <div class="site-info-col">
            <span class="site-rank-badge">${rank}</span>
            <img class="site-favicon" src="${faviconUrl}" alt="" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%2364748b\\' stroke-width=\\'2\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\'/><line x1=\\'2\\' y1=\\'12\\' x2=\\'22\\' y2=\\'12\\'/></svg>';" />
            <span class="site-domain-name" title="${escapeHtml(site.domain)}">${escapeHtml(site.domain)}</span>
          </div>
          <div class="site-meta-col">
            <span class="site-count-badge">${site.visitCount.toLocaleString()} visit${site.visitCount === 1 ? '' : 's'}</span>
          </div>
        </div>
      `;
    });

    DOM.frequentSitesList.innerHTML = itemsHtml;
  }
}

// Retain alias for any remaining references
const renderHomeSummary = renderDashboard;

function updateHeaderStatus() {
  const count = state.historyList.size();
  if (count > 0) {
    DOM.headerStatusDot.classList.add('active');
    DOM.headerStatusText.textContent = `${count.toLocaleString()} visits loaded`;
  } else {
    DOM.headerStatusDot.classList.remove('active');
    DOM.headerStatusText.textContent = 'No history imported';
  }
}

// ==========================================
// Page 2: Browser Simulator Logic
// ==========================================
function navigateToUrl(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return;

  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // Push existing current page to Back stack
  if (state.currentPage) {
    state.backStack.push(state.currentPage);
    // Explicit Requirement: "A new visit after going Back clears the Forward history."
    state.forwardStack.clear();
    state.lastActionDescription = `Visited ${url}. Forward history was cleared.`;
  } else {
    state.lastActionDescription = `Loaded ${url}.`;
  }

  // Update current page
  const visitCount = state.urlIndex.getVisitCount(url);
  state.currentPage = {
    url,
    title: extractDomain(url),
    visitedAt: new Date().toLocaleTimeString(),
    visitCount: visitCount > 0 ? visitCount : 1,
  };

  DOM.addressInput.value = url;
  renderBrowserView();
  showToast(`Navigated to ${url}`);
}

function navigateBack() {
  if (state.backStack.isEmpty()) return;

  // Push current page to Forward stack
  if (state.currentPage) {
    state.forwardStack.push(state.currentPage);
  }

  // Pop from Back stack
  state.currentPage = state.backStack.pop();
  state.lastActionDescription = `Moved back to ${state.currentPage.url}.`;

  DOM.addressInput.value = state.currentPage.url;
  renderBrowserView();
}

function navigateForward() {
  if (state.forwardStack.isEmpty()) return;

  // Push current page to Back stack
  if (state.currentPage) {
    state.backStack.push(state.currentPage);
  }

  // Pop from Forward stack
  state.currentPage = state.forwardStack.pop();
  state.lastActionDescription = `Moved forward to ${state.currentPage.url}.`;

  DOM.addressInput.value = state.currentPage.url;
  renderBrowserView();
}

function renderBrowserView() {
  // Navigation button states
  const canGoBack = !state.backStack.isEmpty();
  const canGoForward = !state.forwardStack.isEmpty();

  DOM.btnBack.disabled = !canGoBack;
  DOM.btnForward.disabled = !canGoForward;

  // Action status message
  DOM.actionText.textContent = state.lastActionDescription;

  // Current page card
  if (state.currentPage) {
    DOM.currentPageTitle.textContent = state.currentPage.title || extractDomain(state.currentPage.url);
    DOM.currentPageUrl.textContent = state.currentPage.url;
    DOM.currentPageVisits.textContent = String(state.currentPage.visitCount || 1);
    DOM.currentPageTime.textContent = state.currentPage.visitedAt || 'Just now';
  } else {
    DOM.currentPageTitle.textContent = 'No page loaded';
    DOM.currentPageUrl.textContent = 'Type a URL in the address bar and click Go to start browsing.';
    DOM.currentPageVisits.textContent = '0';
    DOM.currentPageTime.textContent = '--';
  }

  // Live Back Stack Visualisation
  const backItems = state.backStack.toArray();
  DOM.backStackCount.textContent = `${backItems.length} page${backItems.length === 1 ? '' : 's'}`;
  if (backItems.length === 0) {
    DOM.backStackList.innerHTML = '<div class="empty-state-text">Back history is empty</div>';
  } else {
    DOM.backStackList.innerHTML = backItems
      .map((item, idx) => `
        <div class="stack-item ${idx === 0 ? 'top-item' : ''}">
          <div class="stack-item-title">${idx === 0 ? '★ Next Back: ' : ''}${escapeHtml(item.title || extractDomain(item.url))}</div>
          <div class="stack-item-url">${escapeHtml(item.url)}</div>
        </div>
      `)
      .join('');
  }

  // Live Forward Stack Visualisation
  const forwardItems = state.forwardStack.toArray();
  DOM.forwardStackCount.textContent = `${forwardItems.length} page${forwardItems.length === 1 ? '' : 's'}`;
  if (forwardItems.length === 0) {
    DOM.forwardStackList.innerHTML = '<div class="empty-state-text">Forward history is empty</div>';
  } else {
    DOM.forwardStackList.innerHTML = forwardItems
      .map((item, idx) => `
        <div class="stack-item ${idx === 0 ? 'top-item' : ''}">
          <div class="stack-item-title">${idx === 0 ? '★ Next Forward: ' : ''}${escapeHtml(item.title || extractDomain(item.url))}</div>
          <div class="stack-item-url">${escapeHtml(item.url)}</div>
        </div>
      `)
      .join('');
  }
}

// ==========================================
// Page 3: History Table, Details & Actions
// ==========================================
function renderHistoryTable() {
  const allRecords = state.historyList.getAllRecords();

  if (allRecords.length === 0) {
    DOM.historyTbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state-text" style="padding: 3rem 1rem;">
          No browsing history available. Import a JSON file on the Home page to populate this view.
        </td>
      </tr>
    `;
    return;
  }

  // Filter with SequentialSearch if filter query is present
  let filtered = allRecords;
  if (state.historyFilterQuery && state.historyFilterQuery.trim()) {
    const searchResult = SequentialSearch.searchByKeyword(allRecords, state.historyFilterQuery);
    filtered = searchResult.matches;
  }

  // Sort with MergeSort
  const isNewest = state.historySortOrder === 'newest';
  const sorted = MergeSort.sortHistoryByTimestamp(filtered, isNewest);

  if (sorted.length === 0) {
    DOM.historyTbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state-text" style="padding: 2rem 1rem;">
          No records matched your filter: "${escapeHtml(state.historyFilterQuery)}".
        </td>
      </tr>
    `;
    return;
  }

  // Render rows
  DOM.historyTbody.innerHTML = sorted
    .map((record) => {
      const isSelected = record.id === state.selectedHistoryId;
      const visits = state.urlIndex.getVisitCount(record.url);

      return `
        <tr class="${isSelected ? 'selected' : ''}" data-id="${record.id}" style="cursor: pointer;">
          <td>
            <div class="table-title">${escapeHtml(record.title || extractDomain(record.url))}</div>
            <div class="table-url" title="${escapeHtml(record.url)}">${escapeHtml(record.url)}</div>
          </td>
          <td>${formatDate(record.visitedAt)}</td>
          <td><span class="badge-count">${visits}</span></td>
          <td style="text-align: right;">
            <button class="btn btn-outline btn-sm btn-delete-row" data-id="${record.id}" title="Delete this record">
              Delete
            </button>
          </td>
        </tr>
      `;
    })
    .join('');

  // Row selection & delete listeners
  DOM.historyTbody.querySelectorAll('tr').forEach((row) => {
    row.addEventListener('click', (e) => {
      // Don't trigger selection if user clicked the delete button
      if (e.target.closest('.btn-delete-row')) return;
      const id = row.getAttribute('data-id');
      selectHistoryRecord(id);
    });
  });

  DOM.historyTbody.querySelectorAll('.btn-delete-row').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      deleteHistoryRecord(id);
    });
  });
}

function selectHistoryRecord(recordId) {
  state.selectedHistoryId = recordId;

  // Highlight selected row in table
  DOM.historyTbody.querySelectorAll('tr').forEach((row) => {
    row.classList.toggle('selected', row.getAttribute('data-id') === recordId);
  });

  renderHistoryDetails();
}

function renderHistoryDetails() {
  const total = state.historyList.size();
  DOM.detailsTotal.textContent = total.toLocaleString();

  const head = state.historyList.head ? state.historyList.head.record : null;
  const tail = state.historyList.tail ? state.historyList.tail.record : null;

  DOM.detailsEarliest.textContent = head ? formatDate(head.visitedAt) : '--';
  DOM.detailsLatest.textContent = tail ? formatDate(tail.visitedAt) : '--';

  if (!state.selectedHistoryId) {
    DOM.neighborPrevTitle.textContent = 'None selected';
    DOM.neighborPrevUrl.textContent = 'Click any row in the table below to inspect neighbours';
    DOM.neighborNextTitle.textContent = 'None selected';
    DOM.neighborNextUrl.textContent = 'Click any row in the table below to inspect neighbours';
    return;
  }

  // Retrieve previous and next records via DoublyLinkedList bidirectional pointers
  const prevRecord = state.historyList.getPreviousRecord(state.selectedHistoryId);
  const nextRecord = state.historyList.getNextRecord(state.selectedHistoryId);

  if (prevRecord) {
    DOM.neighborPrevTitle.textContent = prevRecord.title || extractDomain(prevRecord.url);
    DOM.neighborPrevUrl.textContent = `${prevRecord.url} (${formatDate(prevRecord.visitedAt)})`;
  } else {
    DOM.neighborPrevTitle.textContent = 'Start of History (Oldest)';
    DOM.neighborPrevUrl.textContent = 'No previous record exists.';
  }

  if (nextRecord) {
    DOM.neighborNextTitle.textContent = nextRecord.title || extractDomain(nextRecord.url);
    DOM.neighborNextUrl.textContent = `${nextRecord.url} (${formatDate(nextRecord.visitedAt)})`;
  } else {
    DOM.neighborNextTitle.textContent = 'End of History (Latest)';
    DOM.neighborNextUrl.textContent = 'No next record exists.';
  }
}

function deleteHistoryRecord(recordId) {
  const deleted = state.historyList.deleteById(recordId);
  if (!deleted) return;

  // Decrement visit in hash table
  state.urlIndex.decrementVisit(deleted.url);

  if (state.selectedHistoryId === recordId) {
    state.selectedHistoryId = null;
  }

  // Update views
  renderHistoryTable();
  renderHistoryDetails();
  renderHomeSummary();
  renderDiagnostics();
  updateHeaderStatus();

  showToast(`Deleted record: ${deleted.url}`);
}

function clearAllHistory() {
  state.historyList.clear();
  state.urlIndex.clear();
  state.evictedCount = 0;
  state.selectedHistoryId = null;

  renderHomeSummary();
  renderHistoryTable();
  renderHistoryDetails();
  renderDiagnostics();
  updateHeaderStatus();

  DOM.confirmModal.classList.remove('open');
  showToast('All browsing history has been cleared');
}

function exportHistoryAsJson() {
  const records = state.historyList.getAllRecords();
  if (records.length === 0) {
    showToast('No history records to export', 'error');
    return;
  }

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    totalRecords: records.length,
    records: records.map((r) => ({
      url: r.url,
      title: r.title,
      visitedAt: r.visitedAt,
    })),
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `browseback-history-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Exported ${records.length} records to JSON`);
}

// ==========================================
// Page 4: Search & Insights Logic
// ==========================================
function handleFindPage(urlQuery) {
  if (!urlQuery || !urlQuery.trim()) return;

  const normalized = urlQuery.trim();
  const result = state.urlIndex.searchWithMetrics(normalized);

  DOM.findResult.style.display = 'block';

  if (result.entry) {
    DOM.findResult.innerHTML = `
      <div class="result-card">
        <span class="result-badge visited">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Visited Page
        </span>
        <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem;">${escapeHtml(result.entry.title || extractDomain(result.entry.url))}</h3>
        <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">${escapeHtml(result.entry.url)}</p>
        <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
          <div><strong>Total visits recorded:</strong> ${result.entry.visitCount}</div>
          <div><strong>Last visited:</strong> ${formatDate(result.entry.lastVisitedAt)}</div>
          <div style="margin-top: 0.5rem; color: var(--text-muted); font-size: 0.8rem;">
            Lookup location: bucket #${result.bucketIndex} • ${result.comparisons} key comparison(s) • ${result.durationMs.toFixed(3)} ms.
          </div>
        </div>
      </div>
    `;
  } else {
    DOM.findResult.innerHTML = `
      <div class="result-card">
        <span class="result-badge not-visited">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          Not Visited
        </span>
        <h3 style="font-size: 1rem; color: var(--text-main); margin-bottom: 0.25rem;">No Visit Record Found</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          "${escapeHtml(normalized)}" does not appear in your currently retained browsing history.
        </p>
        <div style="margin-top: 0.5rem; color: var(--text-subtle); font-size: 0.8rem;">
          Verified across bucket #${result.bucketIndex} with ${result.comparisons} comparison(s) in ${result.durationMs.toFixed(3)} ms.
        </div>
      </div>
    `;
  }

  // Update Insights details with this query
  DOM.insightLastQueryBox.style.display = 'block';
  DOM.insightChainViewer.innerHTML = `
    <div><strong>Key:</strong> ${escapeHtml(normalized)}</div>
    <div><strong>Computed Hash:</strong> ${result.hashValue}</div>
    <div><strong>Bucket Index:</strong> #${result.bucketIndex} (of ${state.urlIndex.capacity})</div>
    <div><strong>Collision Chain Depth:</strong> ${result.chainLength} entry/entries</div>
    <div style="margin-top: 0.35rem;"><strong>Entries in this bucket:</strong></div>
    <ul style="padding-left: 1.25rem; margin-top: 0.25rem;">
      ${result.chainEntries.map((u) => `<li>${escapeHtml(u)}</li>`).join('') || '<li>(None)</li>'}
    </ul>
  `;
}

function handleKeywordSearch(keyword) {
  if (!keyword || !keyword.trim()) return;

  const allRecords = state.historyList.getAllRecords();
  const searchResult = SequentialSearch.searchByKeyword(allRecords, keyword);

  const totalChecked = allRecords.length;
  const matchCount = searchResult.matches.length;

  if (matchCount === 0) {
    DOM.keywordResults.innerHTML = `
      <div class="empty-state-text">
        No matches found for "<strong>${escapeHtml(keyword)}</strong>" across ${totalChecked} checked records (${searchResult.durationMs.toFixed(2)} ms).
      </div>
    `;
    return;
  }

  // Render highlighted matches
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

  const itemsHtml = searchResult.matches
    .slice(0, 50) // Cap display at 50 items for snappy DOM
    .map((rec) => {
      const safeTitle = escapeHtml(rec.title || extractDomain(rec.url));
      const safeUrl = escapeHtml(rec.url);

      const highlightedTitle = safeTitle.replace(regex, '<mark class="highlight">$1</mark>');
      const highlightedUrl = safeUrl.replace(regex, '<mark class="highlight">$1</mark>');

      return `
        <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
          <h4 style="font-size: 0.95rem; margin-bottom: 0.2rem;">${highlightedTitle}</h4>
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); word-break: break-all; margin-bottom: 0.4rem;">
            ${highlightedUrl}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-subtle);">
            Visited: ${formatDate(rec.visitedAt)}
          </div>
        </div>
      `;
    })
    .join('');

  DOM.keywordResults.innerHTML = `
    <div class="search-stats-summary">
      Found <strong>${matchCount}</strong> match${matchCount === 1 ? '' : 'es'} across <strong>${totalChecked}</strong> history records in <strong>${searchResult.durationMs.toFixed(3)} ms</strong> (${searchResult.comparisonCount} comparisons).
    </div>
    ${itemsHtml}
    ${matchCount > 50 ? `<div class="empty-state-text" style="padding-top: 1rem;">Showing first 50 results of ${matchCount} matches.</div>` : ''}
  `;
}

function renderDiagnostics() {
  const diag = state.urlIndex.getDiagnostics();
  DOM.diagCapacity.textContent = String(diag.capacity);
  DOM.diagUnique.textContent = String(diag.uniqueCount);
  DOM.diagLoadFactor.textContent = String(diag.loadFactor);
  DOM.diagCollisions.textContent = String(diag.collisions);
  DOM.diagLongestChain.textContent = String(diag.longestChain);
  DOM.diagEmptyBuckets.textContent = String(diag.emptyBuckets);
}

// ==========================================
// Page 5: Performance Benchmark Logic
// ==========================================
async function runPerformanceBenchmark() {
  const datasetSize = state.benchmarkDatasetSize;

  DOM.btnRunBenchmark.disabled = true;
  DOM.benchmarkSpinner.style.display = 'inline-block';
  DOM.btnBenchmarkText.textContent = 'Running Benchmark...';
  DOM.benchmarkInitialState.style.display = 'none';

  // Allow browser paint to show spinner before CPU-bound loop
  await new Promise((resolve) => setTimeout(resolve, 50));

  try {
    // 1. Generate Synthetic isolated dataset (never added to user's history!)
    const syntheticArray = [];
    const syntheticHashTable = new CustomHashTable(Math.floor(datasetSize / 2));

    const domains = ['wikipedia.org', 'github.com', 'developer.mozilla.org', 'stackoverflow.com', 'arxiv.org', 'nature.com', 'acm.org'];

    for (let i = 0; i < datasetSize; i++) {
      const domain = domains[i % domains.length];
      const url = `https://${domain}/article/research-topic-${i}`;
      const title = `Synthetic Article ${i} on ${domain}`;
      const timestamp = new Date(1700000000000 + i * 1000).toISOString();

      const rec = { id: `bench_${i}`, url, title, visitedAt: timestamp };
      syntheticArray.push(rec);
      syntheticHashTable.recordVisit(url, title, timestamp);
    }

    // Choose target URL near the 85th percentile of the dataset for fair testing
    const targetIndex = Math.floor(datasetSize * 0.85);
    const targetUrl = syntheticArray[targetIndex].url;

    // Run 5 trials of Sequential Search
    const TRIALS = 5;
    let seqTotalTime = 0;
    let seqTotalComparisons = 0;

    for (let t = 0; t < TRIALS; t++) {
      const res = SequentialSearch.searchByExactUrl(syntheticArray, targetUrl);
      seqTotalTime += res.durationMs;
      seqTotalComparisons += res.comparisonCount;
    }

    const avgSeqTime = seqTotalTime / TRIALS;
    const avgSeqComp = Math.round(seqTotalComparisons / TRIALS);

    // Run 5 trials of Custom Hash Table Lookup
    let hashTotalTime = 0;
    let hashTotalComparisons = 0;

    for (let t = 0; t < TRIALS; t++) {
      const res = syntheticHashTable.searchWithMetrics(targetUrl);
      hashTotalTime += res.durationMs;
      hashTotalComparisons += res.comparisons;
    }

    const avgHashTime = hashTotalTime / TRIALS;
    const avgHashComp = Math.round(hashTotalComparisons / TRIALS);

    // Speedup calculation
    let speedupDisplay = '--';
    if (avgHashTime > 0.0001 && avgSeqTime > 0) {
      const ratio = avgSeqTime / avgHashTime;
      speedupDisplay = `${ratio.toFixed(1)}x`;
    } else if (avgSeqTime > 0) {
      speedupDisplay = '> 100x';
    }

    // Populate Results Table
    DOM.benchmarkTbody.innerHTML = `
      <tr>
        <td><strong>Sequential Linear Search</strong></td>
        <td>${avgSeqTime.toFixed(4)} ms</td>
        <td>${avgSeqComp.toLocaleString()} checks</td>
        <td><code>O(N)</code></td>
        <td>1.0x (Baseline)</td>
      </tr>
      <tr>
        <td><strong>Custom Hash Table Lookup</strong></td>
        <td>${avgHashTime.toFixed(4)} ms</td>
        <td>${avgHashComp.toLocaleString()} check${avgHashComp === 1 ? '' : 's'}</td>
        <td><code>O(1)</code> average</td>
        <td><strong style="color: var(--color-forward);">${speedupDisplay}</strong></td>
      </tr>
    `;

    // Visual Bar Chart
    const maxTime = Math.max(avgSeqTime, avgHashTime, 0.001);
    const seqPct = Math.min(100, Math.max(12, (avgSeqTime / maxTime) * 100));
    const hashPct = Math.min(100, Math.max(6, (avgHashTime / maxTime) * 100));

    DOM.benchmarkChart.innerHTML = `
      <div class="chart-row">
        <div class="chart-row-label">
          <span>Sequential Search (Linear)</span>
          <span>${avgSeqTime.toFixed(4)} ms</span>
        </div>
        <div class="chart-track">
          <div class="chart-bar sequential-bar" style="width: ${seqPct}%;">
            ${avgSeqTime.toFixed(3)} ms
          </div>
        </div>
      </div>
      <div class="chart-row">
        <div class="chart-row-label">
          <span>Hash Table Lookup (Separate Chaining)</span>
          <span>${avgHashTime.toFixed(4)} ms</span>
        </div>
        <div class="chart-track">
          <div class="chart-bar hash-bar" style="width: ${hashPct}%;">
            ${avgHashTime.toFixed(4)} ms
          </div>
        </div>
      </div>
    `;

    DOM.benchmarkResultsContainer.classList.add('visible');
    showToast(`Benchmark on ${datasetSize.toLocaleString()} URLs complete`);

  } catch (err) {
    showToast(`Benchmark error: ${err.message}`, 'error');
  } finally {
    DOM.btnRunBenchmark.disabled = false;
    DOM.benchmarkSpinner.style.display = 'none';
    DOM.btnBenchmarkText.textContent = 'Run Benchmark';
  }
}

// ==========================================
// Event Listeners Registration
// ==========================================
function setupEventListeners() {
  // Navigation Tabs
  DOM.tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      switchTab(target);
    });
  });

  DOM.brandLink.addEventListener('click', () => {
    switchTab('page-home');
  });

  DOM.brandLink.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      switchTab('page-home');
    }
  });

  // Page 1: Home / Import
  DOM.btnBrowse.addEventListener('click', () => {
    DOM.fileInput.click();
  });

  DOM.fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleHistoryFile(e.target.files[0]);
    }
  });

  DOM.dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.dropzone.classList.add('dragover');
  });

  DOM.dropzone.addEventListener('dragleave', () => {
    DOM.dropzone.classList.remove('dragover');
  });

  DOM.dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleHistoryFile(e.dataTransfer.files[0]);
    }
  });

  DOM.dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      DOM.fileInput.click();
    }
  });

  if (DOM.secondaryToolsToggle) {
    DOM.secondaryToolsToggle.addEventListener('click', () => {
      const isExpanded = DOM.secondaryToolsToggle.getAttribute('aria-expanded') === 'true';
      DOM.secondaryToolsToggle.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
      if (DOM.secondaryToolsContent) {
        DOM.secondaryToolsContent.style.display = !isExpanded ? 'block' : 'none';
      }
      if (DOM.secondaryToolsChevron) {
        DOM.secondaryToolsChevron.style.transform = !isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }

  if (DOM.btnTogglePaste) {
    DOM.btnTogglePaste.addEventListener('click', () => {
      const isVisible = DOM.pasteContainer.style.display === 'block';
      DOM.pasteContainer.style.display = isVisible ? 'none' : 'block';
      if (!isVisible && DOM.pasteTextarea) {
        DOM.pasteTextarea.focus();
      }
    });
  }

  if (DOM.btnCancelPaste) {
    DOM.btnCancelPaste.addEventListener('click', () => {
      if (DOM.pasteContainer) DOM.pasteContainer.style.display = 'none';
    });
  }

  if (DOM.btnSubmitPaste) {
    DOM.btnSubmitPaste.addEventListener('click', () => {
      handlePasteJson();
    });
  }

  // Page 2: Browser Simulator
  DOM.btnGo.addEventListener('click', () => {
    navigateToUrl(DOM.addressInput.value);
  });

  DOM.addressInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigateToUrl(DOM.addressInput.value);
    }
  });

  DOM.btnBack.addEventListener('click', () => {
    navigateBack();
  });

  DOM.btnForward.addEventListener('click', () => {
    navigateForward();
  });

  // Page 3: History Table, Actions & Filter
  DOM.historySearchInput.addEventListener('input', (e) => {
    state.historyFilterQuery = e.target.value;
    renderHistoryTable();
  });

  DOM.historySortSelect.addEventListener('change', (e) => {
    state.historySortOrder = e.target.value;
    renderHistoryTable();
  });

  DOM.historyLimitSelect.addEventListener('change', (e) => {
    state.historyLimit = parseInt(e.target.value, 10) || 0;
    applyHistoryLimit();
    renderHistoryTable();
    renderHistoryDetails();
    renderHomeSummary();
    renderDiagnostics();
    updateHeaderStatus();
  });

  DOM.btnExportJson.addEventListener('click', () => {
    exportHistoryAsJson();
  });

  DOM.btnClearHistory.addEventListener('click', () => {
    DOM.confirmModal.classList.add('open');
  });

  DOM.btnModalCancel.addEventListener('click', () => {
    DOM.confirmModal.classList.remove('open');
  });

  DOM.btnModalConfirm.addEventListener('click', () => {
    clearAllHistory();
  });

  DOM.confirmModal.addEventListener('click', (e) => {
    if (e.target === DOM.confirmModal) {
      DOM.confirmModal.classList.remove('open');
    }
  });

  // Page 4: Search Subtabs & Forms
  DOM.subtabFind.addEventListener('click', () => {
    DOM.subtabFind.classList.add('active');
    DOM.subtabKeyword.classList.remove('active');
    DOM.secFind.classList.add('active');
    DOM.secKeyword.classList.remove('active');
  });

  DOM.subtabKeyword.addEventListener('click', () => {
    DOM.subtabKeyword.classList.add('active');
    DOM.subtabFind.classList.remove('active');
    DOM.secKeyword.classList.add('active');
    DOM.secFind.classList.remove('active');
  });

  DOM.formFind.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFindPage(DOM.inputFind.value);
  });

  DOM.formKeyword.addEventListener('submit', (e) => {
    e.preventDefault();
    handleKeywordSearch(DOM.inputKeyword.value);
  });

  DOM.btnToggleInsights.addEventListener('click', () => {
    const isVisible = DOM.insightsPanel.classList.toggle('visible');
    DOM.btnToggleInsights.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
    DOM.btnToggleInsights.querySelector('span').textContent = isVisible ? 'Hide Search Insights' : 'Show Search Insights';
    DOM.insightsChevron.style.transform = isVisible ? 'rotate(90deg)' : 'rotate(0deg)';
    if (isVisible) {
      renderDiagnostics();
    }
  });

  // Page 5: Performance Benchmark
  const sizeButtons = [DOM.btnBenchmark1000, DOM.btnBenchmark5000, DOM.btnBenchmark10000];
  sizeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      sizeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.benchmarkDatasetSize = parseInt(btn.getAttribute('data-size'), 10);
    });
  });

  DOM.btnRunBenchmark.addEventListener('click', () => {
    runPerformanceBenchmark();
  });

  // Chrome Extension & My Browsing Dashboard Listeners
  if (DOM.btnConnectChrome) {
    DOM.btnConnectChrome.addEventListener('click', () => {
      connectChromeExtension(true);
    });
  }

  if (DOM.btnRefreshData) {
    DOM.btnRefreshData.addEventListener('click', () => {
      refreshDashboardData();
    });
  }

  if (DOM.dashboardTimeRange) {
    DOM.dashboardTimeRange.addEventListener('change', () => {
      refreshDashboardData();
    });
  }

  if (DOM.btnDismissNotice) {
    DOM.btnDismissNotice.addEventListener('click', () => {
      hideDashboardNotice();
    });
  }

  if (DOM.btnRecheckExt) {
    DOM.btnRecheckExt.addEventListener('click', () => {
      connectChromeExtension(true);
      showToast('Rechecking Chrome Extension...');
    });
  }

  if (DOM.btnSaveExtId && DOM.extIdInput) {
    DOM.btnSaveExtId.addEventListener('click', () => {
      const val = DOM.extIdInput.value.trim();
      if (val) {
        state.extensionId = val;
        try { localStorage.setItem('browseback_extension_id', val); } catch (e) {}
        connectChromeExtension(true);
      }
    });
  }

  window.addEventListener('BROWSEBACK_EXTENSION_READY', (event) => {
    const detail = event.detail || {};
    if (detail.extensionId) {
      state.extensionId = detail.extensionId;
      try { localStorage.setItem('browseback_extension_id', detail.extensionId); } catch (e) {}
      if (DOM.extIdInput) DOM.extIdInput.value = detail.extensionId;
    }
    checkChromeExtensionConnection();
  });
}

// ==========================================
// Initialization
// ==========================================
function init() {
  setupEventListeners();
  checkChromeExtensionConnection();
  renderDashboard();
  renderBrowserView();
  renderHistoryTable();
  renderHistoryDetails();
  renderDiagnostics();
  updateHeaderStatus();
}

// Boot on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
