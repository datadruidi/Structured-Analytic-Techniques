# Create Indicators Button – Specification for Reuse

This document describes the **Create Indicators** button and its full flow so another module or AI agent can implement an identical feature.

---

## 1. Where the button appears

- **Toolbar (main screen):** One red button in the top bar, e.g. in a “toolbar-right” area. Label: **“Create new Indicators”**. Same row as other toolbar controls.
- **Comment/event panel (optional):** The same red button is also placed inside the comment/event detail panel (e.g. at the bottom, same row as “Save and Close”). Same label, same behavior.

Both instances do the same thing: open the Indicators popup (see below).

---

## 2. Button styling

- **Class:** e.g. `btn-keywords` or `btn-indicators` (used for styling only).
- **Appearance:** Red background (e.g. `#b91c1c`), white text, red border. Hover slightly lighter red.
- **Size:** Same as other toolbar/panel buttons (padding, font size).

---

## 3. What happens when the button is clicked

**Single action:** Open the **Indicators popup** (modal/overlay). No other side effects.

- If the button is in the **comment/event panel** and that panel is open: show the Indicators popup **next to** the comment panel (side-by-side, same vertical level) so both are visible. The Indicators content is either rendered in a slot in the same overlay or moved into that overlay.
- If the button is in the **toolbar** (or comment panel is not open): show the Indicators popup as a **centered overlay** over the page.

---

## 4. Indicators popup content and behavior

### 4.1 Structure

- **Title:** “Create Indicators”
- **Hint:** e.g. “Fill one or more fields (comma-separated for multiple). Not all are required.”
- **Six entity blocks**, in order: **What?**, **Who?**, **When?**, **Where?**, **Why?**, **How?**

Each entity block has:

- A **label** (e.g. “What?”).
- **One or more rows.** Each row is a single line: **[text input] [+]** on the same row.
  - **Input:** full width of the row minus the + button; placeholder is a help question (e.g. What? → “What kind of indicator could it be?”).
  - **+ button:** at the **end** of the row (right side). Clicking it **adds a new row** for that same entity (same placeholder). New row is inserted after the current row. Every row has its own + so the user can add as many rows per entity as they want.
- Rows are stacked vertically per entity; the + is always at the end of each row, not below the block.

### 4.2 Placeholders (help questions) per entity

| Entity | Placeholder (example) |
|--------|------------------------|
| What?  | What kind of indicator could it be? |
| Who?   | Who could cause the indicator? |
| When?  | When would we see the indicator? |
| Where? | Where would we see the indicator? |
| Why?   | Why is the indicator important? |
| How?   | How would this indicator manifest / be observed? |

### 4.3 Popup actions

- **“Create Indicators” (primary, red):** see Section 5.
- **“Cancel”:** close the popup without saving. If the popup was shown beside the comment panel, only the Indicators popup closes; the comment panel stays open.
- **Close (×) / overlay click:** same as Cancel.

### 4.4 On open

- Clear all inputs and reset each entity to **one row** (remove any extra rows added previously). So every time the popup opens, it starts with one input per entity and one + per entity row.

---

## 5. “Create Indicators” action (primary button)

When the user clicks **“Create Indicators”** inside the popup:

1. **Collect form data**  
   For each entity (What, Who, When, Where, Why, How), collect all values from **all** input rows. For each input, trim and split by comma; treat each resulting non-empty string as one indicator item. So each entity gets a list of strings (possibly empty).

2. **Merge with stored data**  
   There is a single in-memory (or localStorage) store: an object with keys `What`, `Who`, `When`, `Where`, `Why`, `How`, each value an **array of strings**. Append the newly collected items to the existing arrays (do not replace; append). Then persist this merged object (e.g. to localStorage under a key like `osamuuttuja_keywords` or `indicators_store`).

3. **Close the Indicators popup immediately**  
   Close the popup right after reading the form (so the user sees it close before any file or network action). If the popup was shown beside the comment panel, remove the Indicators content from that panel so only the comment panel remains.

4. **Write the indicators to file**  
   Build a single string that represents the **full** stored data (all entities, all items). Format is plain text, UTF-8:
   - For each entity that has at least one item: a line `{Entity}?` (e.g. `What?`), then for each item a line `- {item}`. Blank line between entities.
   - Example:
     ```
     What?
     - item one
     - item two

     Who?
     - person A
     ```
   - If there are no items at all, use a single line like “No indicators yet.”

   Then:

   - **Preferred (no user prompt):** Try to send this string to a **local backend** that writes it to a fixed path:
     - **Endpoint:** `POST /api/save-indicators`
     - **Body:** raw string (Content-Type: `text/plain; charset=utf-8`).
     - **Success:** backend writes the body to the project’s indicators file (see below). No save dialog, no download. If response is OK (e.g. 200), consider the flow done.
   - **Fallback (no server or request failed):**  
     - If the browser supports the File System Access API, show the **Save file** dialog with suggested name **“Indicators.txt”** and write the same string to the user-chosen file.  
     - Otherwise, trigger a **download** of a file named **“Indicators.txt”** with that string as content.

5. **Reset popup state**  
   Reset the form to one row per entity and clear values (so the next time the popup opens it is clean).

---

## 6. Backend contract (for “no prompt” behavior)

To avoid any save dialog and write directly to a file in the project:

- **Method and path:** `POST /api/save-indicators`
- **Request body:** The full indicators text (same format as in Section 5, step 4). Content-Type: `text/plain; charset=utf-8`.
- **Response:**  
  - **200:** Body written successfully. Optional JSON body e.g. `{ "ok": true }`.  
  - **5xx / 4xx:** Error; frontend should fall back to save dialog or download.

**Server responsibility:** Write the request body to the indicators file. Recommended path (relative to the app that serves the page):

- **File:** `indicators.txt`
- **Directory:** sibling folder of the current app, e.g.  
  `../structured-analytic-circleboarding/indicators.txt`  
  so the full path on disk is like:  
  `{Structured-Analytic-Techniques}/structured-analytic-circleboarding/indicators.txt`

The server should create the directory if it does not exist. No authentication is required for this local-only use.

---

## 7. Data and storage summary

- **In-memory / localStorage:** One object, keys `What`, `Who`, `When`, `Where`, `Why`, `How`; values = arrays of strings. **Append-only** when the user clicks Create Indicators (new form values are appended to existing arrays).
- **Exported file:** Plain text, UTF-8, name **Indicators.txt** (or `indicators.txt` on disk when using the server). Structure: entity headers and `- item` lines as in Section 5.

---

## 8. Checklist for an identical button in another module

- [ ] Red “Create new Indicators” button in the main UI (e.g. toolbar) and optionally in the comment/event panel.
- [ ] On click: open Indicators popup (side-by-side with comment panel if applicable, else centered overlay).
- [ ] Popup: title “Create Indicators”, six entities (What, Who, When, Where, Why, How), each with one or more rows; each row = input + “+” at the end; “+” adds another row for that entity.
- [ ] Placeholders: use the help questions from the table in Section 4.2.
- [ ] Primary action “Create Indicators”: collect form → merge into stored arrays (append) → close popup → build full text → try `POST /api/save-indicators` → on success done; on failure use Save dialog or download `Indicators.txt`.
- [ ] Backend (if used): `POST /api/save-indicators`, body = full text; write to `../structured-analytic-circleboarding/indicators.txt` (or equivalent).
- [ ] On popup open: reset to one row per entity and clear inputs.

This gives another module everything needed to replicate the button and the full flow.
