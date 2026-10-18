# BrowseBack — Direct Chrome History Connection Extension

A privacy-focused Google Chrome Manifest V3 extension designed to connect your Chrome browsing history directly to your local **BrowseBack: Browser History Simulator** web application (`http://localhost:5173`).

---

## Key Features

1. **Direct Web Connection**: Communicates directly with the BrowseBack web application in memory via secure message-passing.
2. **100% Local & Private**: Browsing records are transferred directly to your local browser session. No data is ever sent to any remote server or external database.
3. **Strict Origin Security**: Extension communication is restricted exclusively to authorized local BrowseBack origins (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`, `http://127.0.0.1:3000`).
4. **Selective Field Extraction**: Only transfers the exact fields needed by BrowseBack:
   - `url`: page address
   - `title`: page title
   - `visitedAt`: visit timestamp (ISO-8601)
   - `visitCount`: visit frequency
5. **Smart Filtering**: Automatically filters out internal browser URLs (`chrome://`, `chrome-extension://`, `about:`, `file://`, `devtools://`) and local BrowseBack development URLs to avoid feedback loops.
6. **Deduplication**: Automatically deduplicates visits by URL and timestamp.

---

## Installation via `chrome://extensions`

Follow these steps to load the extension in Google Chrome or any Chromium-based browser (Brave, Edge, etc.):

1. Open Google Chrome and enter in the address bar:
   ```text
   chrome://extensions/
   ```
2. In the top-right corner, switch the **Developer mode** toggle to **ON**.
3. In the top-left corner, click the **Load unpacked** button.
4. Select the `browser-extension` folder inside this project:
   ```text
   E:\BrowseBack\browser-extension
   ```
5. The extension **BrowseBack — Direct Chrome History Connection** (version 1.1.0) will now appear in your extensions list.
6. If you make any future code changes to the extension, simply click the circular **Reload** icon on the BrowseBack extension card at `chrome://extensions`.

---

## How to Import Directly into BrowseBack

1. Ensure the BrowseBack website is running locally (e.g. `http://localhost:5173/`).
2. Open `http://localhost:5173/` in Google Chrome (where the extension is installed).
3. On the **Home** page under **Google Chrome History**, the status badge will display:
   ```text
   Extension Connected (v1.1.0)
   ```
4. Choose your preferred **Time Range** (e.g., *Past 7 Days*, *Past 24 Hours*, or *All Available History*) and **Max Visits** (e.g., *250 visits*).
5. Click **Import Chrome History**.
6. Your real Chrome visits will be retrieved immediately into your local BrowseBack memory session, updating the summary cards, History table, Doubly Linked List, and Hash Table frequency tracker without any backend server.
