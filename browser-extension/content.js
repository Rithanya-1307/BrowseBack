/**
 * BrowseBack — Content Script Bridge
 * Injected ONLY into authorized local origins (http://localhost:5173, etc.)
 * Safely announces presence and advertises the verified Extension ID to the web page.
 * Website communication executes directly via chrome.runtime.sendMessage(extensionId, ...).
 */

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

function isAuthorizedOrigin() {
  return ALLOWED_ORIGINS.includes(window.location.origin);
}

if (isAuthorizedOrigin()) {
  try {
    const extensionId = typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.id : null;
    const version = '1.1.0';

    if (extensionId) {
      // 1. Mark presence on HTML root for synchronous detection
      function setExtensionAttributes() {
        try {
          if (document && document.documentElement) {
            document.documentElement.setAttribute('data-browseback-extension', version);
            document.documentElement.setAttribute('data-browseback-extension-id', extensionId);
          }
        } catch {
          // Ignore in detached DOM
        }
      }

      setExtensionAttributes();

      // 2. Announce verified presence & ID to the web page
      function announceReady() {
        setExtensionAttributes();
        try {
          window.dispatchEvent(
            new CustomEvent('BROWSEBACK_EXTENSION_READY', {
              detail: { version, extensionId, status: 'ready' }
            })
          );
        } catch {
          // Ignore if page unloading
        }
      }

      announceReady();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', announceReady);
      }
      window.addEventListener('load', announceReady);
    }
  } catch (err) {
    // If extension context was invalidated, gracefully ignore without throwing
    console.debug('[BrowseBack] Content script startup notice:', err.message);
  }
}
