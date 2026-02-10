# Circleboarding

A **Kanban-style dashboard** for 5WH + “So what?” indicators. Six category boxes (Who?, What?, Why?, When?, Where?, How?) plus a 6-lane “So what?” area. Other modules (e.g. Timeline) can export to **Indicators.txt**; the circleboard keeps its own data in **CircleboardData.txt** so overwriting Indicators.txt does not destroy your work.

## Data files

- **CircleboardData.txt** – The app’s main data file (when the server is used). Loaded first on startup. All saves (drags, edits) write here and to the browser’s localStorage. Other tools do not write this file.
- **Indicators.txt** – Export target for other modules. The circleboard **never overwrites** it. Use **Refresh from Indicators.txt** to **merge** new items from this file into the current board (existing items and “So what?” lanes are kept; only new bullets are appended per category).

## Load order

1. **CircleboardData.txt** – if present (e.g. when served by `node server.js`), it is loaded first.
2. **Indicators.txt** – if CircleboardData.txt is missing or not available, this is loaded.
3. **localStorage** – if the app has been used before in this browser, that state can be used when no file was loaded.
4. **Embedded fallback** – if nothing else is available (e.g. opening `index.html` via file://).

## Refresh

Click **Refresh from Indicators.txt** to:

- Read **Indicators.txt** (e.g. after another tool has exported to it).
- Merge its items into the current state: **new** items are appended to each category; existing items and “So what?” lanes are unchanged. Duplicates (same text in the same category) are skipped.

## Features

- Six category boxes and a 6-lane “So what?” area; drag between them and reorder within lanes.
- Persistence: localStorage plus **CircleboardData.txt** when the server is running (POST `/api/save-circleboard`).
- Inline edit (double-click), same formats as before (Markdown-like, YAML-like, JSON).

## Run locally

- **With server (recommended):** run `node server.js`, then open **http://localhost:8082**. Data is read/written from **CircleboardData.txt** in this folder.
- **Without server:** open `index.html` (e.g. via file://). Data is kept in localStorage only; Refresh still fetches Indicators.txt if the page was loaded from a server.

## Port

This tool’s server uses **port 8082** (see repo root `HUB-PAGE-INSTRUCTIONS.md`).

## Files

- `index.html` – Dashboard and Refresh button.
- `styles.css` – Layout and styles.
- `app.js` – Load (CircleboardData.txt → Indicators.txt), merge, save, drag-and-drop.
- `Indicators.txt` – Export from other modules; read-only for circleboard, merged in on Refresh.
- `CircleboardData.txt` – Created/updated by the app when the server is used.
- `server.js` – Static server + POST `/api/save-circleboard` to write CircleboardData.txt.
