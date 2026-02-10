# Hub Page – Instructions for AI Coder

**Context:** You are working at the **Structured-Analytic-Techniques** repository root. The repo contains multiple tools in subfolders (e.g. `structured-analytic-causal-map`, `structured-analytic-timeline`, `structured-analytic-circleboarding`). Each tool may run its own local server on a fixed port.

**Goal:** Create a single **HTML hub page** at the repo root that presents one button per tool. Clicking a button opens that tool in the browser (e.g. in a new tab) at the correct URL (e.g. `http://localhost:PORT`). Servers must use **distinct ports** so they never collide when multiple tools are run at once.

---

## 1. Where to create the hub

- **Primary option:** Add or update **`index.html`** at the **Structured-Analytic-Techniques** root (same level as `README.md`, `structured-analytic-causal-map/`, `structured-analytic-timeline/`, etc.).
- **Alternative:** Use a subfolder such as `hub/` with its own `index.html` and optional small server, and link to it from the root README or root `index.html` redirect.

The hub page should be the main entry point when someone opens the repo in a browser or runs a simple static server at the repo root.

---

## 2. Button order (left to right)

Arrange buttons in this order, **left to right**:

| Order | Label / Concept        | Target tool / folder                         | Purpose                          |
|-------|------------------------|----------------------------------------------|----------------------------------|
| 1     | **Causal Map**         | `structured-analytic-causal-map`             | Opens causal map tool            |
| 2     | **Timeline**           | `structured-analytic-timeline`               | Opens timeline tool              |
| 3     | **Circleboarding**     | `structured-analytic-circleboarding`         | Opens circleboarding tool        |
| 4     | **EXTRA 1**            | (future project)                             | Placeholder for later tool        |
| 5     | **EXTRA 2**            | (future project)                             | Placeholder for later tool        |
| 6     | **EXTRA 3**            | (future project)                             | Placeholder for later tool        |
| 7     | **EXTRA 4**            | (future project)                             | Placeholder for later tool        |
| 8     | **EXTRA 5**            | (future project)                             | Placeholder for later tool        |

- The first three buttons correspond to existing (or planned) tools in the repo.
- The five **EXTRA** buttons are placeholders: same style and behavior (open a URL), but the URLs/ports will be filled in when those projects exist. You can use labels like “EXTRA 1” … “EXTRA 5” or “Coming soon” until then.

---

## 3. Port assignment (no collisions)

Each tool that runs a **local server** must use **exactly one** port from this table. No two tools should share a port.

| Tool                    | Default port | Folder / note                                      |
|-------------------------|-------------|-----------------------------------------------------|
| Causal Map              | **8765**    | `structured-analytic-causal-map` (already uses 8765) |
| Timeline                | **8080**    | `structured-analytic-timeline` (already uses 8080)   |
| Circleboarding          | **8082**    | `structured-analytic-circleboarding`                 |
| Multiple Hypothesis     | **8083**    | `structured-analytic-multiple-hypothesis-generation` |
| EXTRA 2         | **8084**    | Reserve for future project                          |
| EXTRA 3         | **8085**    | Reserve for future project                          |
| EXTRA 4         | **8086**    | Reserve for future project                          |
| EXTRA 5         | **8087**    | Reserve for future project                          |

**Your tasks:**

- Ensure each project’s server (e.g. `server.js`) uses the port from this table. If you add or change a server, document the port in that project’s README and, if applicable, in this hub’s copy of the table.
- In the hub page, each button must open `http://localhost:&lt;port&gt;` (or the correct host/port if the hub is meant for a different environment). Use the ports above.

---

## 4. Behavior of each button

- **Clicking a button** should open the tool in a **new browser tab** (or window), e.g. `window.open('http://localhost:PORT', '_blank')` or an `<a href="http://localhost:PORT" target="_blank">` wrapped around the button/link.
- **Icons:** Each button should have an **icon** that suggests the tool (e.g. timeline icon for Timeline, map/graph icon for Causal Map, circle/board icon for Circleboarding). Use inline SVG, an icon font, or a small image; keep assets under the repo (e.g. `assets/` at root) if you use images.
- **EXTRA buttons:** Same interaction (click → open URL). Use a generic icon (e.g. “+” or “?”) and the reserved port (8083–8087). The URL can point to `http://localhost:8083` … `http://localhost:8087` even if no server is running yet (will 404 until the project exists).

---

## 5. Hub page content and style

- **Title:** e.g. “Structured Analytic Techniques” or “SAT Tools”.
- **Short line of text:** e.g. “Choose a tool to open it in a new tab.”
- **Layout:** Buttons in a single row (or wrap on small screens) in the order above: Causal Map → Timeline → Circleboarding → EXTRA 1 … EXTRA 5.
- **Accessibility:** Use semantic HTML (e.g. `<a>` or `<button>`), `aria-label` where helpful, and ensure keyboard and screen-reader use is clear.
- **Styling:** Simple, readable, and consistent with the rest of the repo (e.g. dark/light theme to match other tools if desired). No external CSS/JS unless the repo already allows it.

---

## 6. Checklist for implementation

When implementing or updating the hub page, ensure:

- [ ] Hub HTML lives at repo root (e.g. `index.html`) or in an agreed location (e.g. `hub/index.html`).
- [ ] Buttons appear **left to right** in this order: **Causal Map → Timeline → Circleboarding → EXTRA 1 → EXTRA 2 → EXTRA 3 → EXTRA 4 → EXTRA 5**.
- [ ] Each button has an **icon** and opens the correct **http://localhost:PORT** in a **new tab**.
- [ ] Ports used match the table above and do **not** collide with any other tool’s server.
- [ ] EXTRA 1–5 use ports **8083–8087** and are visually consistent placeholders (labels like “EXTRA 1” … “EXTRA 5” or “Coming soon”).
- [ ] Any new or modified server in a subfolder uses its **assigned port** and documents it in that project’s README.

---

## 7. Optional: serving the hub at the repo root

If users open the repo root via a static server (e.g. `python -m http.server 3000` or `npx serve .` at the repo root), the hub `index.html` will be served as the default page. The hub does **not** need to run the individual tools’ servers; it only provides links. Each tool is started separately (e.g. `node server.js` in `structured-analytic-timeline`, `structured-analytic-causal-map`, etc.) on its assigned port.

You can add a short note to the **root README** explaining: “Open `index.html` or run a static server at the repo root to see the hub; start each tool’s server from its folder for the buttons to work.”
