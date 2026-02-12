# Hypothesis Keywords – Consumer / Receiver Guide (JSONL)

For **an AI or developer building the reader** (e.g. circleboarding or any consumer).  
This guide and the **Producer Guide** (`HYPOTHESIS-KEYWORDS-JSONL-PRODUCER-GUIDE.md`) live in the **repo root** next to `HUB-PAGE-INSTRUCTIONS.md` and `README.md`, so any app or AI can use them.

---

## 1. What you get

- **JSONL only** — one JSON object per line; no commas between lines, no top-level array.
- **Path** — `02-exploration/structured-analytic-circleboarding/input/hypothesis_keywords.jsonl` (relative to repo root).
- **Append-only** — new records are added at the end of the file.
- **One line per “Generate” action** — each time a producer (e.g. Timeline, Causal Map) runs “Generate Hypothesis Keywords”, one new line is appended.

**Explicit:** We do **not** use the `.txt` format anymore. **Do not depend on `hypothesis_keywords.txt` for new data.** That file is legacy; new output goes only to `hypothesis_keywords.jsonl`.

---

## 2. Schema

Each line is a single JSON object. **Guaranteed fields** (every record):

| Field        | Type     | Description |
|-------------|----------|-------------|
| `createdAt` | string   | ISO 8601 UTC timestamp when the record was created (e.g. `"2026-02-10T12:34:56.000Z"`). |
| `what`      | string[] | Keywords for “What?”. Always an array; may be empty `[]`. |
| `who`       | string[] | Keywords for “Who?”. Always an array; may be empty `[]`. |
| `when`      | string[] | Keywords for “When?”. Always an array; may be empty `[]`. |
| `where`     | string[] | Keywords for “Where?”. Always an array; may be empty `[]`. |
| `why`       | string[] | Keywords for “Why?”. Always an array; may be empty `[]`. |
| `how`       | string[] | Keywords for “How?”. Always an array; may be empty `[]`. |

**Optional fields** (may appear):

| Field         | Type   | Description |
|--------------|--------|-------------|
| `id`         | string | Unique id for this record (e.g. UUID). |
| `sessionId`  | string | Optional session identifier from the producer. |
| `evidence`   | string | Optional; e.g. `"Yes"` or `""` from “Use as Evidence?”. |
| `appVersion` | string | Optional producer app/version. |

---

## 3. Example (multi-line file content)

```
{"id":"a1b2c3","createdAt":"2026-02-10T12:00:00.000Z","what":["foo"],"who":[],"when":["2025"],"where":[],"why":[],"how":[]}
{"createdAt":"2026-02-10T12:05:00.000Z","what":[],"who":["Alice"],"when":[],"where":["HQ"],"why":[],"how":["email"]}
```

- No comma between lines.
- No `[` at the start or `]` at the end of the file.
- Empty lines are not part of the contract; skip or ignore them when parsing.

---

## 4. Parsing

1. **Read the file** (e.g. `fs.readFile` in Node, or your language’s file API).
2. **Split on newline** (`\n` or `\r\n`). Each non-empty line is one record.
3. **Parse each line** with `JSON.parse(line)`. Handle invalid JSON (e.g. skip line or log and continue).
4. **Defensive normalization:** if any of `what`, `who`, `when`, `where`, `why`, `how` is **missing or not an array**, treat it as `[]`. If `createdAt` is missing, treat as unknown or skip the record.

### Node.js example

```js
const fs = require("fs");
const path = require("path");

const JSONL_PATH = path.join(__dirname, "02-exploration", "structured-analytic-circleboarding", "input", "hypothesis_keywords.jsonl");

function loadRecords() {
  const raw = fs.readFileSync(JSONL_PATH, "utf8");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim() !== "");
  return lines.map((line) => {
    try {
      const record = JSON.parse(line);
      return {
        id: record.id,
        createdAt: record.createdAt,
        what:  Array.isArray(record.what)  ? record.what  : [],
        who:   Array.isArray(record.who)   ? record.who   : [],
        when:  Array.isArray(record.when) ? record.when : [],
        where: Array.isArray(record.where) ? record.where : [],
        why:   Array.isArray(record.why)   ? record.why   : [],
        how:   Array.isArray(record.how)   ? record.how   : []
      };
    } catch (e) {
      return null; // or log and skip
    }
  }).filter(Boolean);
}
```

---

## 5. Ordering and filtering

- **Order:** Records are appended in time order. You can sort by `createdAt` (ISO 8601 strings sort correctly).
- **Filtering:** Use `createdAt` for date range, and the six arrays for keyword presence, as needed for your UI (e.g. circleboarding).

---

## 6. What we do *not* produce

- **No new `.txt` output.** Producers write only to `hypothesis_keywords.jsonl`. Do not rely on the old text format (e.g. “What?\n- foo”) for new data.
- **No merged/sectioned text.** We do not produce a single merged file grouped by question. **Aggregation is the consumer’s job** — if you want “all What in one list”, merge the `what` arrays from the records yourself.

---

## 7. Summary table

| Topic        | Detail |
|-------------|--------|
| **File**    | `02-exploration/structured-analytic-circleboarding/input/hypothesis_keywords.jsonl` |
| **Format**  | JSON Lines (one JSON object per line, no wrapping array) |
| **Schema**   | Per line: `createdAt` (string) + `what`, `who`, `when`, `where`, `why`, `how` (string arrays); optional `id`, `evidence`, `sessionId`, `appVersion` |
| **Growth**  | Append-only; one line per “Generate” action from producers |
| **Old .txt**| Not used for new data; use only `.jsonl` |

Implement your reader to parse `.jsonl` line-by-line, normalize the six keyword fields to arrays, and use `createdAt` for ordering/filtering. Do not depend on `hypothesis_keywords.txt` for new flows.
