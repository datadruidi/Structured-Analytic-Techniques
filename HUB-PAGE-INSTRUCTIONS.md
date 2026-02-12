# Hub – Ports and tools

**Hub:** `index.html` at repo root. Run `node start-all.js` (or `node server.js`) to serve the hub at **http://localhost:3000** and all tools below.

## Port assignment

| Tool                 | Port  | Folder |
|----------------------|-------|--------|
| Hub                  | 3000  | repo root |
| Causal Map           | 8765  | `01-getting-organized/structured-analytic-causal-map` |
| Timeline             | 8080  | `01-getting-organized/structured-analytic-timeline` |
| Circleboarding       | 8082  | `02-exploration/structured-analytic-circleboarding` |
| Multiple Hypothesis  | 8083  | `03-diagnostics/structured-analytic-multiple-hypothesis-generation` |
| Competing Hypothesis | 8084  | `03-diagnostics/structured-analysis-of-competing-hypothesis` |
| EXTRA 2              | 8085  | reserved |
| EXTRA 3              | 8086  | reserved |
| EXTRA 4              | 8087  | reserved |
| EXTRA 5              | 8088  | reserved |

Each tool’s `server.js` must use its port above. Hub buttons open `http://localhost:<port>` in a new tab.
