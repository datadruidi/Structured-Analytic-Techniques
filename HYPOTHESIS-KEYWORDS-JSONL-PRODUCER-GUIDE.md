# Hypothesis Keywords – Producer Guide (JSONL)

For **an AI or developer adding “save to circleboarding” to another SAT tool** (e.g. Timeline, ACH).  
The **Causal Map** tool already implements this; use it as reference. This guide explains what to implement so your tool writes to the same file and the circleboarding app can read it.

The **Consumer Guide** (`HYPOTHESIS-KEYWORDS-JSONL-CONSUMER-GUIDE.md`) describes how the circleboarding app reads the file.

---

## 1. What you are implementing

- **One file** — All producers append to the same JSONL file so circleboarding can “Refresh” and merge everything.
- **File path (from repo root):**  
  `02-exploration/structured-analytic-circleboarding/input/hypothesis_keywords.jsonl`
- **Behavior:** Each time the user runs “Generate Hypothesis Keywords” (or your equivalent), **append one new line** to that file. Do not overwrite; do not replace the file.

---

## 2. Server-side: endpoint and file path

Your tool’s Node server (e.g. `server.js` in your tool folder) must:

1. **Handle POST requests** to path: **`/api/save-indicators`** (same path as Causal Map for consistency).
2. **Resolve the JSONL file path** relative to your server’s location.

Your server typically lives under:

- `01-getting-organized/structured-analytic-causal-map/` → repo root is `../..`
- `01-getting-organized/structured-analytic-timeline/` → repo root is `../..`
- `03-diagnostics/structured-analytic-multiple-hypothesis-generation/` → repo root is `../..`

So from **any** of these, the JSONL path is:

```js
const path = require('path');

// From a tool folder under 01-getting-organized/ or 03-diagnostics/, repo root is two levels up:
const JSONL_PATH = path.resolve(__dirname, '..', '..', '02-exploration', 'structured-analytic-circleboarding', 'input', 'hypothesis_keywords.jsonl');
```

If your tool lives at repo root (e.g. a single `server.js` at root), use:

```js
const JSONL_PATH = path.resolve(__dirname, '02-exploration', 'structured-analytic-circleboarding', 'input', 'hypothesis_keywords.jsonl');
```

3. **Create the directory if it does not exist** before appending:

```js
const dir = path.dirname(JSONL_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
```

4. **Append one line per request** — see record format below.

---

## 3. Request format (client → server)

- **Method:** `POST`
- **URL path:** `/api/save-indicators` (on the same origin as your app, e.g. `http://localhost:YOUR_PORT/api/save-indicators`)
- **Headers:** `Content-Type: application/json`
- **Body:** Single JSON object with the fields described in the next section.

---

## 4. Record format (normalize before writing)

Each **line** in the file is one JSON object. **Normalize** the body you receive so that:

- **Required:** `createdAt`, `what`, `who`, `when`, `where`, `why`, `how`.
- **Optional:** `id`, `evidence`, `sessionId`, `appVersion`.

**Normalization rules (match Causal Map):**

| Field        | Rule |
|-------------|------|
| `createdAt` | If present and matches ISO 8601 (e.g. `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}`), use it; otherwise use `new Date().toISOString()`. |
| `what`, `who`, `when`, `where`, `why`, `how` | Always arrays of strings. If value is an array, trim each string and remove empty; if not an array, treat as single string and wrap in array (or empty `[]`). |
| `id`        | Include only if present and non-empty string. |
| `evidence`  | Include only if present and non-empty string. |
| `sessionId` | Include only if present and non-empty string. |
| `appVersion`| Include only if present and non-empty string. |

**Helper (same logic as Causal Map):**

```js
function toArray(val) {
  if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
  if (val == null) return [];
  return [String(val).trim()].filter(Boolean);
}

function normalizeRecord(body) {
  const createdAt =
    body && body.createdAt && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(String(body.createdAt))
      ? String(body.createdAt)
      : new Date().toISOString();
  const record = {
    createdAt,
    what:  toArray(body && body.what),
    who:   toArray(body && body.who),
    when:  toArray(body && body.when),
    where: toArray(body && body.where),
    why:   toArray(body && body.why),
    how:   toArray(body && body.how)
  };
  if (body && body.id != null && String(body.id).trim() !== '') record.id = String(body.id).trim();
  if (body && body.evidence != null && String(body.evidence).trim() !== '') record.evidence = String(body.evidence).trim();
  if (body && body.sessionId != null && String(body.sessionId).trim() !== '') record.sessionId = String(body.sessionId).trim();
  if (body && body.appVersion != null && String(body.appVersion).trim() !== '') record.appVersion = String(body.appVersion).trim();
  return record;
}
```

Then:

```js
const line = JSON.stringify(record) + '\n';
fs.appendFileSync(JSONL_PATH, line, 'utf8');
```

---

## 5. Server responses

- **200** — Success. Body: `{"ok":true}`.
- **400** — Invalid JSON body. Body: `{"ok":false,"error":"Invalid JSON"}` (or similar).
- **500** — Write failed (e.g. permission). Body: `{"ok":false,"error":"<message>"}`.

Use `Content-Type: application/json` for these responses.

---

## 6. Client-side (browser)

When the user triggers “Generate Hypothesis Keywords” (or your equivalent):

1. **Build a record** with at least: `createdAt` (e.g. `new Date().toISOString()`), and `what`, `who`, `when`, `where`, `why`, `how` as arrays of strings (from your form or UI). Add `id`, `evidence`, etc. if you have them.
2. **POST to your server:**  
   `fetch('/api/save-indicators', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) })`.
3. **If the request succeeds (`r.ok`):** You’re done; the file was appended. Optionally clear the form or show a short success message.
4. **If the request fails** (no server, network error, or `!r.ok`): **Fallback** — offer a download of the same record as a single line in a `.jsonl` file (e.g. `hypothesis_keywords.jsonl`), so the user can save it and manually place it or merge it later. Same pattern as Causal Map: `const line = JSON.stringify(record) + '\n';` then use `Blob` + download or `showSaveFilePicker` if available.

Example (minimal):

```js
const record = {
  createdAt: new Date().toISOString(),
  what:  ['keyword1'],
  who:   [],
  when:  ['2025'],
  where: [],
  why:   [],
  how:   []
};

try {
  const r = await fetch('/api/save-indicators', {
    method: 'POST',
    body: JSON.stringify(record),
    headers: { 'Content-Type': 'application/json' }
  });
  if (r.ok) {
    // Success: appended to circleboarding/input/hypothesis_keywords.jsonl
    return;
  }
} catch (_) {}

// Fallback: download as .jsonl file
const line = JSON.stringify(record) + '\n';
const blob = new Blob([line], { type: 'application/x-ndjson; charset=utf-8' });
// ... trigger download (e.g. <a download>, or showSaveFilePicker)
```

---

## 7. Reference implementation

- **Server:** `01-getting-organized/structured-analytic-causal-map/server.js`  
  - POST `/api/save-indicators`, path to `02-exploration/.../input/hypothesis_keywords.jsonl`, `normalizeRecord`, `appendFileSync`, create directory if missing.
- **Client:** `01-getting-organized/structured-analytic-causal-map/index.html`  
  - Search for `api/save-indicators` and `keywords-create` to see how the record is built and how the fallback download works.

---

## 8. Checklist for another tool

- [ ] Server: resolve `JSONL_PATH` to `.../02-exploration/structured-analytic-circleboarding/input/hypothesis_keywords.jsonl` (adjust `__dirname` for your tool’s folder).
- [ ] Server: on POST `/api/save-indicators`, parse JSON body, normalize with the same rules (toArray for the six fields, createdAt, optional id/evidence/sessionId/appVersion).
- [ ] Server: create parent directory if needed; append one line (`JSON.stringify(record) + '\n'`); respond with `{ ok: true }` or `{ ok: false, error }`.
- [ ] Client: build record from your UI, POST to `/api/save-indicators`; on failure, fall back to downloading a `.jsonl` file with that one line.

Once this is in place, your tool will write to the same file the circleboarding app reads from **Refresh from hypothesis_keywords.jsonl** (`input/hypothesis_keywords.jsonl`).
