/**
 * BrowseBack — Direct Chrome History Connection
 * Popup User Interface Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const backendStatusBadge = document.getElementById('backendStatusBadge');
  const backendStatusText = document.getElementById('backendStatusText');
  const notification = document.getElementById('notification');

  const lastSyncTimeText = document.getElementById('lastSyncTimeText');
  const lastImportCountText = document.getElementById('lastImportCountText');
  const lastDuplicateCountText = document.getElementById('lastDuplicateCountText');

  const timeRangeSelect = document.getElementById('timeRangeSelect');
  const maxItemsSelect = document.getElementById('maxItemsSelect');

  const syncNowBtn = document.getElementById('syncNowBtn');
  const syncBtnText = document.getElementById('syncBtnText');
  const openWebAppBtn = document.getElementById('openWebAppBtn');

  // Check Web App connection (http://localhost:5173)
  async function checkWebAppStatus() {
    backendStatusBadge.className = 'status-badge status-checking';
    backendStatusText.textContent = 'Checking...';

    try {
      const res = await fetch('http://localhost:5173/', { method: 'HEAD', mode: 'no-cors' });
      backendStatusBadge.className = 'status-badge status-online';
      backendStatusText.textContent = 'App Ready';
    } catch {
      backendStatusBadge.className = 'status-badge status-offline';
      backendStatusText.textContent = 'App Offline';
    }
  }

  checkWebAppStatus();

  // Load last stats from storage
  chrome.storage.local.get(['lastSyncTime', 'lastImportedCount', 'lastDuplicateCount'], (stored) => {
    if (stored.lastSyncTime) {
      lastSyncTimeText.textContent = new Date(stored.lastSyncTime).toLocaleTimeString();
    }
    if (stored.lastImportedCount !== undefined) {
      lastImportCountText.textContent = `${stored.lastImportedCount} visits`;
    }
  });

  // Open BrowseBack Web App
  openWebAppBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173/' });
  });

  // Test History Retrieval directly in popup
  syncNowBtn.addEventListener('click', async () => {
    const timeRangeMs = parseInt(timeRangeSelect.value, 10);
    const maxResults = parseInt(maxItemsSelect.value, 10);

    syncNowBtn.disabled = true;
    syncBtnText.textContent = 'Reading Chrome History...';
    hideNotification();

    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            action: 'RETRIEVE_HISTORY',
            options: { timeRangeMs, maxResults }
          },
          (res) => resolve(res)
        );
      });

      if (response && response.success) {
        showNotification(
          `Successfully read ${response.records.length} visits from Chrome. Open the BrowseBack app to explore.`,
          'success'
        );
        lastSyncTimeText.textContent = new Date().toLocaleTimeString();
        lastImportCountText.textContent = `${response.records.length} visits`;
        chrome.storage.local.set({
          lastSyncTime: Date.now(),
          lastImportedCount: response.records.length,
        });
      } else {
        showNotification(response?.error || 'Failed to read Chrome history.', 'error');
      }
    } catch (err) {
      showNotification(`Error: ${err.message}`, 'error');
    } finally {
      syncNowBtn.disabled = false;
      syncBtnText.textContent = 'Sync Chrome History Now';
    }
  });

  function showNotification(msg, type = 'info') {
    notification.className = `notification notification-${type}`;
    notification.textContent = msg;
    notification.classList.remove('hidden');
  }

  function hideNotification() {
    notification.classList.add('hidden');
  }
});
