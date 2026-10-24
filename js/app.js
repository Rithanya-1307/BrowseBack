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
    this.historyTimeRangeMs = 604800000;
    this.rawLoadedRecords = []; // Master records within selected time range
    this.selectedWebsiteDetails = null; // { url, domain, title, isDomainLevel }
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
  neighborPrevCard: document.getElementById('neighbor-prev-card'),
  neighborPrevTitle: document.getElementById('neighbor-prev-title'),
  neighborPrevUrl: document.getElementById('neighbor-prev-url'),
  neighborNextCard: document.getElementById('neighbor-next-card'),
  neighborNextTitle: document.getElementById('neighbor-next-title'),
  neighborNextUrl: document.getElementById('neighbor-next-url'),
  historySearchInput: document.getElementById('history-search-input'),
  historyTimeRangeSelect: document.getElementById('history-time-range-select'),
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
  websiteDetailsModal: document.getElementById('website-details-modal'),
  btnCloseWebsiteModal: document.getElementById('btn-close-website-modal'),
  btnWebsiteModalCloseAction: document.getElementById('btn-website-modal-close-action'),
  websiteModalTitle: document.getElementById('website-modal-title'),
  websiteModalDomain: document.getElementById('website-modal-domain'),
  websiteModalFavicon: document.getElementById('website-modal-favicon'),
  websiteModalLoading: document.getElementById('website-modal-loading'),
  websiteModalNotice: document.getElementById('website-modal-notice'),
  websiteModalNoticeText: document.getElementById('website-modal-notice-text'),
  websiteModalContent: document.getElementById('website-modal-content'),
  websiteModalUrlBox: document.getElementById('website-url-box'),
  websiteModalUrl: document.getElementById('website-modal-url'),
  websiteModalTotalVisits: document.getElementById('website-modal-total-visits'),
  websiteModalPeriodText: document.getElementById('website-modal-period-text'),
  websiteModalEarliest: document.getElementById('website-modal-earliest'),
  websiteModalLatest: document.getElementById('website-modal-latest'),
  websiteModalVisitCount: document.getElementById('website-modal-visit-count'),
  websiteModalVisitsList: document.getElementById('website-modal-visits-list'),
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

function parseTimestampToMs(val) {
  if (val === null || val === undefined || val === '') return NaN;
  if (typeof val === 'number') {
    if (val > 1e14) return Math.floor(val / 1000);
    if (val < 1e11) return Math.floor(val * 1000);
    return Math.floor(val);
  }
  const str = String(val).trim();
  const num = Number(str);
  if (!isNaN(num) && num > 0) {
    if (num > 1e14) return Math.floor(num / 1000);
    if (num < 1e11) return Math.floor(num * 1000);
    return Math.floor(num);
  }
  const d = new Date(str);
  const time = d.getTime();
  return isNaN(time) ? NaN : time;
}

function safeIsoString(val) {
  const ms = parseTimestampToMs(val);
  if (!isNaN(ms) && ms > 0) {
    return new Date(ms).toISOString();
  }
  return new Date().toISOString();
}

function formatDate(isoString) {
  if (!isoString) return '--';
  const ms = parseTimestampToMs(isoString);
  if (isNaN(ms) || ms <= 0) return typeof isoString === 'string' && isoString.trim() ? isoString : '--';
  const d = new Date(ms);
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

    const validRecords = [];

    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      if (!item || typeof item !== 'object') continue;

      let url = item.url || item.URL;
      if (!url || typeof url !== 'string' || !url.trim()) continue;
      url = url.trim();

      let title = item.title || item.Title || extractDomain(url);
      if (typeof title !== 'string') title = String(title);

      let rawTime = item.time_usec || item.visitedAt || item.time || item.timestamp;
      let visitedAt = safeIsoString(rawTime);

      validRecords.push({
        id: `rec_${Date.now()}_${i}`,
        url,
        title,
        visitedAt,
        visitCount: item.visitCount || 1,
      });
    }

    if (validRecords.length === 0) {
      DOM.importStatus.innerHTML = `
        <div class="alert alert-error">
          <strong>No Valid Records:</strong> None of the items contained a valid 'url' field.
        </div>
      `;
      return;
    }

    // Sort chronologically ascending (oldest first)
    validRecords.sort((a, b) => {
      const tA = parseTimestampToMs(a.visitedAt) || 0;
      const tB = parseTimestampToMs(b.visitedAt) || 0;
      return tA - tB;
    });

    state.rawLoadedRecords = [...validRecords];

    for (let i = 0; i < validRecords.length; i++) {
      const record = validRecords[i];
      state.historyList.addLast(record);
      state.urlIndex.recordVisit(record.url, record.title, record.visitedAt);
    }
    const validCount = validRecords.length;

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

function setTimeRange(timeRangeMs) {
  const ms = parseInt(timeRangeMs, 10);
  state.historyTimeRangeMs = ms;
  state.dashboardTimeRangeMs = ms;

  if (DOM.historyTimeRangeSelect && DOM.historyTimeRangeSelect.value !== String(ms)) {
    DOM.historyTimeRangeSelect.value = String(ms);
  }
  if (DOM.dashboardTimeRange && DOM.dashboardTimeRange.value !== String(ms)) {
    DOM.dashboardTimeRange.value = String(ms);
  }

  if (state.extensionConnected) {
    refreshDashboardData();
  } else {
    repopulateFromRawRecords();
  }

  // Update website visit details if modal is currently open
  if (state.selectedWebsiteDetails && DOM.websiteDetailsModal && DOM.websiteDetailsModal.classList.contains('open')) {
    loadWebsiteVisitDetails(state.selectedWebsiteDetails);
  }
}

function repopulateFromRawRecords() {
  if (!state.rawLoadedRecords || state.rawLoadedRecords.length === 0) {
    state.historyList.clear();
    state.urlIndex.clear();
    state.evictedCount = 0;
    state.selectedHistoryId = null;
    renderDashboard();
    renderHistoryTable();
    renderDiagnostics();
    updateHeaderStatus();
    return;
  }

  const startTime = state.dashboardTimeRangeMs > 0 ? Date.now() - state.dashboardTimeRangeMs : 0;
  const filtered = state.rawLoadedRecords.filter((r) => {
    if (!r || !r.url) return false;
    if (startTime > 0) {
      const ms = parseTimestampToMs(r.visitedAt);
      if (!isNaN(ms) && ms > 0 && ms < startTime) return false;
    }
    return true;
  });

  state.historyList.clear();
  state.urlIndex.clear();
  state.evictedCount = 0;
  state.selectedHistoryId = null;

  for (let i = 0; i < filtered.length; i++) {
    const item = filtered[i];
    const record = {
      id: item.id || `rec_${i}`,
      url: item.url,
      title: item.title,
      visitedAt: item.visitedAt,
      visitCount: item.visitCount,
    };
    state.historyList.addLast(record);
    state.urlIndex.recordVisit(record.url, record.title, record.visitedAt);
  }

  applyHistoryLimit();

  renderDashboard();
  renderHistoryTable();
  renderDiagnostics();
  updateHeaderStatus();
}

function processDirectChromeRecords(records) {
  // Clear existing data to prevent duplicate counting on refresh
  state.historyList.clear();
  state.urlIndex.clear();
  state.evictedCount = 0;
  state.selectedHistoryId = null;

  const startTime = state.dashboardTimeRangeMs > 0 ? Date.now() - state.dashboardTimeRangeMs : 0;
  const validRecords = [];

  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    if (!item || !item.url) continue;

    const visitedMs = parseTimestampToMs(item.visitedAt);
    if (startTime > 0 && !isNaN(visitedMs) && visitedMs > 0 && visitedMs < startTime) {
      continue;
    }

    validRecords.push({
      id: `chrome_${Date.now()}_${i}`,
      url: item.url.trim(),
      title: item.title || extractDomain(item.url),
      visitedAt: safeIsoString(item.visitedAt),
      visitCount: item.visitCount || 1,
    });
  }

  // Sort ascending by timestamp so DoublyLinkedList head is oldest and tail is newest
  validRecords.sort((a, b) => {
    const tA = parseTimestampToMs(a.visitedAt) || 0;
    const tB = parseTimestampToMs(b.visitedAt) || 0;
    return tA - tB;
  });

  state.rawLoadedRecords = [...validRecords];

  for (let i = 0; i < validRecords.length; i++) {
    const record = validRecords[i];
    state.historyList.addLast(record);
    state.urlIndex.recordVisit(record.url, record.title, record.visitedAt);
  }

  applyHistoryLimit();

  renderDashboard();
  renderHistoryTable();
  renderDiagnostics();
  updateHeaderStatus();

  showToast(`Loaded ${validRecords.length.toLocaleString()} Chrome visits`);
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

    // Attach click listeners to frequent sites for domain-level visit inspection
    DOM.frequentSitesList.querySelectorAll('.frequent-site-item').forEach((item) => {
      item.addEventListener('click', () => {
        const domain = item.getAttribute('data-domain');
        if (domain) {
          openWebsiteDetails({ domain, title: `Domain: ${domain}`, isDomainLevel: true });
        }
      });
    });
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
          No browsing history available. Connect to Chrome or import a JSON file on the Home page to populate this view.
        </td>
      </tr>
    `;
    renderHistoryDetails([]);
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

  // Apply size limit if configured
  const displayedRecords = (state.historyLimit > 0 && sorted.length > state.historyLimit)
    ? sorted.slice(0, state.historyLimit)
    : sorted;

  if (displayedRecords.length === 0) {
    DOM.historyTbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state-text" style="padding: 2rem 1rem;">
          No records matched your filter: "${escapeHtml(state.historyFilterQuery)}".
        </td>
      </tr>
    `;
    renderHistoryDetails([]);
    return;
  }

  // Render rows
  DOM.historyTbody.innerHTML = displayedRecords
    .map((record) => {
      const isSelected = record.id === state.selectedHistoryId;
      const visits = state.urlIndex.getVisitCount(record.url) || record.visitCount || 1;

      return `
        <tr class="${isSelected ? 'selected' : ''}" data-id="${record.id}" style="cursor: pointer;">
          <td>
            <div class="table-title">${escapeHtml(record.title || extractDomain(record.url))}</div>
            <button type="button" class="table-url-btn" data-url="${escapeHtml(record.url)}" data-title="${escapeHtml(record.title || extractDomain(record.url))}" title="Click to view visit details for this website">
              <svg class="url-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <span>${escapeHtml(record.url)}</span>
            </button>
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
      // Don't trigger selection if user clicked the delete button or url button
      if (e.target.closest('.btn-delete-row') || e.target.closest('.table-url-btn')) return;
      const id = row.getAttribute('data-id');
      selectHistoryRecord(id);
    });
  });

  // URL click listeners
  DOM.historyTbody.querySelectorAll('.table-url-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = btn.getAttribute('data-url');
      const title = btn.getAttribute('data-title');
      openWebsiteDetails({ url, title, isDomainLevel: false });
    });
  });

  DOM.historyTbody.querySelectorAll('.btn-delete-row').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      deleteHistoryRecord(id);
    });
  });

  // Always keep History Details in exact sync with currently displayed records
  renderHistoryDetails(displayedRecords);
}

function selectHistoryRecord(recordId) {
  state.selectedHistoryId = recordId;

  // Highlight selected row in table and scroll into view smoothly
  let selectedRow = null;
  DOM.historyTbody.querySelectorAll('tr').forEach((row) => {
    const isSelected = row.getAttribute('data-id') === recordId;
    row.classList.toggle('selected', isSelected);
    if (isSelected) selectedRow = row;
  });

  if (selectedRow) {
    selectedRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  renderHistoryDetails();
}

function renderHistoryDetails(records = null) {
  let currentRecords = records;
  if (!currentRecords) {
    const allRecords = state.historyList.getAllRecords();
    let filtered = allRecords;
    if (state.historyFilterQuery && state.historyFilterQuery.trim()) {
      filtered = SequentialSearch.searchByKeyword(allRecords, state.historyFilterQuery).matches;
    }
    const isNewest = state.historySortOrder === 'newest';
    const sorted = MergeSort.sortHistoryByTimestamp(filtered, isNewest);
    currentRecords = (state.historyLimit > 0 && sorted.length > state.historyLimit)
      ? sorted.slice(0, state.historyLimit)
      : sorted;
  }

  // 1. Total Records: exact count of currently loaded/displayed records
  const total = currentRecords.length;
  if (DOM.detailsTotal) {
    DOM.detailsTotal.textContent = total.toLocaleString();
  }

  // 2. Earliest Record (minimum timestamp) and Latest Record (maximum timestamp)
  if (total === 0) {
    if (DOM.detailsEarliest) DOM.detailsEarliest.textContent = '--';
    if (DOM.detailsLatest) DOM.detailsLatest.textContent = '--';
  } else {
    let minMs = Infinity;
    let maxMs = -Infinity;

    for (let i = 0; i < currentRecords.length; i++) {
      const ms = parseTimestampToMs(currentRecords[i].visitedAt);
      if (!isNaN(ms) && ms > 0) {
        if (ms < minMs) minMs = ms;
        if (ms > maxMs) maxMs = ms;
      }
    }

    if (DOM.detailsEarliest) {
      DOM.detailsEarliest.textContent = minMs !== Infinity ? formatDate(new Date(minMs).toISOString()) : '--';
    }
    if (DOM.detailsLatest) {
      DOM.detailsLatest.textContent = maxMs !== -Infinity ? formatDate(new Date(maxMs).toISOString()) : '--';
    }
  }

  // 3. Previous Page (Older) and Next Page (Newer)
  if (total === 0) {
    updateNeighborCard('prev', null, 'No history records available in selected range');
    updateNeighborCard('next', null, 'No history records available in selected range');
    return;
  }

  if (!state.selectedHistoryId) {
    updateNeighborCard('prev', null, 'Click any row in the table below to inspect older record');
    updateNeighborCard('next', null, 'Click any row in the table below to inspect newer record');
    return;
  }

  const selectedIdx = currentRecords.findIndex((r) => r.id === state.selectedHistoryId);

  if (selectedIdx === -1) {
    state.selectedHistoryId = null;
    updateNeighborCard('prev', null, 'Click any row in the table below to inspect older record');
    updateNeighborCard('next', null, 'Click any row in the table below to inspect newer record');
    return;
  }

  // Chronological traversal:
  // If newest-first: index 0 is newest, index total-1 is oldest.
  //   older record is at selectedIdx + 1.
  //   newer record is at selectedIdx - 1.
  // If oldest-first: index 0 is oldest, index total-1 is newest.
  //   older record is at selectedIdx - 1.
  //   newer record is at selectedIdx + 1.
  const isNewestFirst = state.historySortOrder === 'newest';
  const olderIdx = isNewestFirst ? selectedIdx + 1 : selectedIdx - 1;
  const newerIdx = isNewestFirst ? selectedIdx - 1 : selectedIdx + 1;

  const prevOlderRecord = (olderIdx >= 0 && olderIdx < total) ? currentRecords[olderIdx] : null;
  const nextNewerRecord = (newerIdx >= 0 && newerIdx < total) ? currentRecords[newerIdx] : null;

  if (prevOlderRecord) {
    updateNeighborCard('prev', prevOlderRecord);
  } else {
    updateNeighborCard('prev', null, 'No older record exists in current view', true);
  }

  if (nextNewerRecord) {
    updateNeighborCard('next', nextNewerRecord);
  } else {
    updateNeighborCard('next', null, 'No newer record exists in current view', true);
  }
}

function updateNeighborCard(type, record, emptyMessage = '', isBoundary = false) {
  const isPrev = type === 'prev';
  const titleEl = isPrev ? DOM.neighborPrevTitle : DOM.neighborNextTitle;
  const urlEl = isPrev ? DOM.neighborPrevUrl : DOM.neighborNextUrl;
  const cardEl = isPrev ? DOM.neighborPrevCard : DOM.neighborNextCard;

  if (!titleEl || !urlEl) return;

  if (record) {
    titleEl.textContent = record.title || extractDomain(record.url);
    urlEl.textContent = `${record.url} • ${formatDate(record.visitedAt)}`;
    if (cardEl) {
      cardEl.style.cursor = 'pointer';
      cardEl.title = `Click to select this ${isPrev ? 'older' : 'newer'} record`;
      cardEl.onclick = () => selectHistoryRecord(record.id);
    }
  } else {
    titleEl.textContent = isBoundary
      ? (isPrev ? 'Start of History (Oldest)' : 'End of History (Latest)')
      : 'None selected';
    urlEl.textContent = emptyMessage || (isPrev ? 'No older record exists.' : 'No newer record exists.');
    if (cardEl) {
      cardEl.style.cursor = 'default';
      cardEl.title = '';
      cardEl.onclick = null;
    }
  }
}

// ==========================================
// Website-Specific Visit Details Modal
// ==========================================
function getPeriodLabel(ms) {
  const num = parseInt(ms, 10);
  switch (num) {
    case 604800000: return 'Past 7 Days';
    case 2592000000: return 'Past 1 Month';
    case 7776000000: return 'Past 3 Months';
    case 15552000000: return 'Past 6 Months';
    default: return 'Selected Period';
  }
}

function openWebsiteDetails({ url = '', domain = '', title = '', isDomainLevel = false }) {
  if (!domain && url) {
    domain = extractDomain(url);
  }
  if (!title) {
    title = isDomainLevel ? `Domain: ${domain}` : (url || domain);
  }

  state.selectedWebsiteDetails = { url, domain, title, isDomainLevel };

  if (DOM.websiteDetailsModal) {
    DOM.websiteDetailsModal.classList.add('open');
    DOM.websiteDetailsModal.setAttribute('aria-hidden', 'false');
  }

  loadWebsiteVisitDetails(state.selectedWebsiteDetails);
}

function closeWebsiteDetails() {
  if (DOM.websiteDetailsModal) {
    DOM.websiteDetailsModal.classList.remove('open');
    DOM.websiteDetailsModal.setAttribute('aria-hidden', 'true');
  }
  state.selectedWebsiteDetails = null;
}

async function loadWebsiteVisitDetails(target) {
  if (!target) return;
  const { url, domain, title, isDomainLevel } = target;

  if (DOM.websiteModalLoading) DOM.websiteModalLoading.style.display = 'flex';
  if (DOM.websiteModalNotice) DOM.websiteModalNotice.style.display = 'none';
  if (DOM.websiteModalContent) DOM.websiteModalContent.style.opacity = '0.4';

  const periodLabel = getPeriodLabel(state.historyTimeRangeMs);
  if (DOM.websiteModalPeriodText) DOM.websiteModalPeriodText.textContent = periodLabel;

  if (DOM.websiteModalTitle) DOM.websiteModalTitle.textContent = title || (isDomainLevel ? `Domain: ${domain}` : url);
  if (DOM.websiteModalDomain) DOM.websiteModalDomain.textContent = domain || extractDomain(url);
  if (DOM.websiteModalFavicon) {
    DOM.websiteModalFavicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain || extractDomain(url))}&sz=32`;
  }

  if (DOM.websiteModalUrlBox) {
    if (url && !isDomainLevel) {
      DOM.websiteModalUrlBox.style.display = 'flex';
      if (DOM.websiteModalUrl) {
        DOM.websiteModalUrl.textContent = url;
        DOM.websiteModalUrl.title = url;
      }
    } else {
      DOM.websiteModalUrlBox.style.display = 'none';
    }
  }

  let resultData = null;
  let noticeMessage = null;

  // 1. Try to fetch actual visits from Chrome extension if connected
  if (state.extensionConnected) {
    try {
      const response = await sendExtensionMessage({
        action: 'RETRIEVE_URL_DETAILS',
        options: {
          url: isDomainLevel ? '' : url,
          domain: isDomainLevel ? domain : '',
          timeRangeMs: state.historyTimeRangeMs,
        },
      });

      if (response && response.success) {
        resultData = response;
      } else {
        noticeMessage = response?.error || 'Could not retrieve visit details from Chrome History.';
      }
    } catch (err) {
      noticeMessage = `Extension request failed: ${err.message}. Showing local dataset records.`;
    }
  } else {
    noticeMessage = 'Extension is currently disconnected. Showing visits available in loaded history dataset.';
  }

  // 2. Fallback / offline calculation from state.rawLoadedRecords / state.historyList
  if (!resultData) {
    const startTime = state.historyTimeRangeMs > 0 ? Date.now() - state.historyTimeRangeMs : 0;
    const pool = (state.rawLoadedRecords && state.rawLoadedRecords.length > 0)
      ? state.rawLoadedRecords
      : state.historyList.getAllRecords();

    const matchingVisits = [];
    const seenTimes = new Set();

    for (let i = 0; i < pool.length; i++) {
      const r = pool[i];
      if (!r || !r.url) continue;

      let isMatch = false;
      if (isDomainLevel) {
        isMatch = extractDomain(r.url).toLowerCase() === domain.toLowerCase();
      } else {
        isMatch = r.url === url;
      }

      if (isMatch) {
        const ms = parseTimestampToMs(r.visitedAt);
        if (!isNaN(ms) && ms > 0 && (startTime === 0 || ms >= startTime)) {
          if (!seenTimes.has(ms)) {
            seenTimes.add(ms);
            matchingVisits.push({
              visitTime: ms,
              visitedAt: new Date(ms).toISOString(),
              transition: 'link',
              title: r.title || r.url,
            });
          }
        }
      }
    }

    matchingVisits.sort((a, b) => b.visitTime - a.visitTime);

    let earliestTime = null;
    let latestTime = null;
    if (matchingVisits.length > 0) {
      latestTime = matchingVisits[0].visitedAt;
      earliestTime = matchingVisits[matchingVisits.length - 1].visitedAt;
    }

    resultData = {
      success: true,
      url: url || '',
      title: title || (isDomainLevel ? `Domain: ${domain}` : url),
      domain: domain || extractDomain(url),
      totalVisits: matchingVisits.length,
      earliestVisit: earliestTime,
      latestVisit: latestTime,
      visits: matchingVisits,
    };
  }

  renderWebsiteVisitDetails(resultData, noticeMessage, isDomainLevel);
}

function renderWebsiteVisitDetails(data, noticeMessage, isDomainLevel) {
  if (DOM.websiteModalLoading) DOM.websiteModalLoading.style.display = 'none';
  if (DOM.websiteModalContent) DOM.websiteModalContent.style.opacity = '1';

  if (DOM.websiteModalNotice && DOM.websiteModalNoticeText) {
    if (noticeMessage) {
      DOM.websiteModalNotice.style.display = 'flex';
      DOM.websiteModalNoticeText.textContent = noticeMessage;
    } else {
      DOM.websiteModalNotice.style.display = 'none';
    }
  }

  const totalVisits = data.totalVisits || 0;
  if (DOM.websiteModalTotalVisits) {
    DOM.websiteModalTotalVisits.textContent = totalVisits.toLocaleString();
  }

  if (DOM.websiteModalEarliest) {
    DOM.websiteModalEarliest.textContent = data.earliestVisit ? formatDate(data.earliestVisit) : '--';
  }

  if (DOM.websiteModalLatest) {
    DOM.websiteModalLatest.textContent = data.latestVisit ? formatDate(data.latestVisit) : '--';
  }

  const visits = data.visits || [];
  if (DOM.websiteModalVisitCount) {
    DOM.websiteModalVisitCount.textContent = visits.length.toLocaleString();
  }

  if (DOM.websiteModalVisitsList) {
    if (visits.length === 0) {
      DOM.websiteModalVisitsList.innerHTML = `
        <li style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.86rem;">
          No matching visit events found in Chrome history for the selected time range (${getPeriodLabel(state.historyTimeRangeMs)}).
        </li>
      `;
    } else {
      DOM.websiteModalVisitsList.innerHTML = visits.map((v) => {
        const localFormatted = formatDate(v.visitedAt || v.visitTime);
        const transition = v.transition ? String(v.transition) : 'visit';
        return `
          <li class="visit-list-item">
            <div>
              <div class="visit-time-local">${localFormatted}</div>
              ${isDomainLevel && v.title ? `<div style="font-size: 0.76rem; color: var(--text-muted); max-width: 440px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(v.title)}</div>` : ''}
            </div>
            <span class="visit-type-badge">${escapeHtml(transition)}</span>
          </li>
        `;
      }).join('');
    }
  }
}

function deleteHistoryRecord(recordId) {
  const deleted = state.historyList.deleteById(recordId);
  if (!deleted) return;

  // Decrement visit in hash table
  state.urlIndex.decrementVisit(deleted.url);

  // Remove from raw master records if present
  if (state.rawLoadedRecords) {
    state.rawLoadedRecords = state.rawLoadedRecords.filter((r) => r.id !== recordId);
  }

  if (state.selectedHistoryId === recordId) {
    state.selectedHistoryId = null;
  }

  // Update views
  renderHistoryTable();
  renderDashboard();
  renderDiagnostics();
  updateHeaderStatus();

  if (state.selectedWebsiteDetails && DOM.websiteDetailsModal && DOM.websiteDetailsModal.classList.contains('open')) {
    loadWebsiteVisitDetails(state.selectedWebsiteDetails);
  }

  showToast(`Deleted record: ${deleted.url}`);
}

function clearAllHistory() {
  state.historyList.clear();
  state.urlIndex.clear();
  state.rawLoadedRecords = [];
  state.evictedCount = 0;
  state.selectedHistoryId = null;

  if (DOM.websiteDetailsModal && DOM.websiteDetailsModal.classList.contains('open')) {
    closeWebsiteDetails();
  }

  renderDashboard();
  renderHistoryTable();
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

  if (DOM.historyTimeRangeSelect) {
    DOM.historyTimeRangeSelect.addEventListener('change', (e) => {
      setTimeRange(e.target.value);
    });
  }

  DOM.historyLimitSelect.addEventListener('change', (e) => {
    state.historyLimit = parseInt(e.target.value, 10) || 0;
    if (state.rawLoadedRecords && state.rawLoadedRecords.length > 0) {
      state.historyList.clear();
      state.urlIndex.clear();
      state.evictedCount = 0;
      for (let i = 0; i < state.rawLoadedRecords.length; i++) {
        const item = state.rawLoadedRecords[i];
        state.historyList.addLast(item);
        state.urlIndex.recordVisit(item.url, item.title, item.visitedAt);
      }
    }
    applyHistoryLimit();
    renderHistoryTable();
    renderDashboard();
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

  // Website Details Modal Close Triggers
  if (DOM.btnCloseWebsiteModal) {
    DOM.btnCloseWebsiteModal.addEventListener('click', closeWebsiteDetails);
  }
  if (DOM.btnWebsiteModalCloseAction) {
    DOM.btnWebsiteModalCloseAction.addEventListener('click', closeWebsiteDetails);
  }
  if (DOM.websiteDetailsModal) {
    DOM.websiteDetailsModal.addEventListener('click', (e) => {
      if (e.target === DOM.websiteDetailsModal) {
        closeWebsiteDetails();
      }
    });
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.websiteDetailsModal && DOM.websiteDetailsModal.classList.contains('open')) {
      closeWebsiteDetails();
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
    DOM.dashboardTimeRange.addEventListener('change', (e) => {
      setTimeRange(e.target.value);
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
