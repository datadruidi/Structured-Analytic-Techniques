/**
 * Local server for the Multiple Hypothesis Generation app.
 * Serves static files from this folder. Per HUB-PAGE-INSTRUCTIONS.md, uses port 8083.
 *
 * Run: node server.js
 * Then open http://localhost:8083
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8083;
const ROOT = __dirname;
const SOURCE_FILE = path.join(ROOT, "Multiple_Hypothesis_Generation.txt");
const HYPOTHESES_FILE = path.join(ROOT, "Hypotheses.txt");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
};

function send(res, statusCode, body, contentType) {
  res.writeHead(statusCode, { "Content-Type": contentType || "text/plain; charset=utf-8" });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];

  if (req.method === "POST" && urlPath === "/api/add-source") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      let label = Buffer.concat(chunks).toString("utf8").trim();
      if (req.headers["content-type"] && req.headers["content-type"].includes("application/json")) {
        try {
          const json = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          label = (json.label || json.text || "").trim();
        } catch (_) {}
      }
      if (!label) {
        send(res, 400, JSON.stringify({ ok: false, error: "Empty label" }), "application/json");
        return;
      }
      const line = "\n- " + label;
      fs.readFile(SOURCE_FILE, "utf8", (err, content) => {
        const toWrite = err && err.code === "ENOENT" ? "So What?" + line : (content || "") + line;
        fs.writeFile(SOURCE_FILE, toWrite, "utf8", (writeErr) => {
          if (writeErr) {
            send(res, 500, JSON.stringify({ ok: false, error: String(writeErr.message) }), "application/json");
            return;
          }
          send(res, 200, JSON.stringify({ ok: true }), "application/json");
        });
      });
    });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/source") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch (_) {
        send(res, 400, JSON.stringify({ ok: false, error: "Invalid JSON" }), "application/json");
        return;
      }
      const items = Array.isArray(body.items) ? body.items.map((l) => (l == null ? "" : String(l).trim())).filter(Boolean) : [];
      const content = "So What?\n" + items.map((i) => "- " + i).join("\n") + (items.length ? "\n" : "");
      fs.writeFile(SOURCE_FILE, content, "utf8", (writeErr) => {
        if (writeErr) {
          send(res, 500, JSON.stringify({ ok: false, error: String(writeErr.message) }), "application/json");
          return;
        }
        send(res, 200, JSON.stringify({ ok: true }), "application/json");
      });
    });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/update-hypothesis-line") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch (_) {
        send(res, 400, JSON.stringify({ ok: false, error: "Invalid JSON" }), "application/json");
        return;
      }
      const index = typeof body.index === "number" ? body.index : -1;
      const text = typeof body.text === "string" ? body.text : "";
      if (index < 0) {
        send(res, 400, JSON.stringify({ ok: false, error: "Invalid index" }), "application/json");
        return;
      }
      fs.readFile(HYPOTHESES_FILE, "utf8", (err, content) => {
        if (err && err.code !== "ENOENT") {
          send(res, 500, JSON.stringify({ ok: false, error: String(err.message) }), "application/json");
          return;
        }
        const lines = (err || !content ? "" : content).split(/\r?\n/);
        if (index >= lines.length) {
          send(res, 400, JSON.stringify({ ok: false, error: "Index out of range" }), "application/json");
          return;
        }
        lines[index] = text;
        fs.writeFile(HYPOTHESES_FILE, lines.join("\n"), "utf8", (writeErr) => {
          if (writeErr) {
            send(res, 500, JSON.stringify({ ok: false, error: String(writeErr.message) }), "application/json");
            return;
          }
          send(res, 200, JSON.stringify({ ok: true }), "application/json");
        });
      });
    });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/save-hypothesis") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      let body = raw;
      if (req.headers["content-type"] && req.headers["content-type"].includes("application/json")) {
        try {
          const json = JSON.parse(raw);
          body = typeof json.permutation === "string" ? json.permutation : (typeof json.text === "string" ? json.text : raw);
        } catch (_) {}
      }
      const line = (body === undefined ? "" : body) + "\n";
      fs.appendFile(HYPOTHESES_FILE, line, { encoding: "utf8", flag: "a" }, (err) => {
        if (err) {
          send(res, 500, JSON.stringify({ ok: false, error: String(err.message) }), "application/json");
          return;
        }
        send(res, 200, JSON.stringify({ ok: true }), "application/json");
      });
    });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/save-hypothesis-ach") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch (_) {
        send(res, 400, JSON.stringify({ ok: false, error: "Invalid JSON" }), "application/json");
        return;
      }
      const id = typeof body.id === "string" && /^H\d+$/.test(body.id) ? body.id : "H1";
      const title = typeof body.title === "string" ? body.title : "";
      const description = typeof body.description === "string" ? body.description : "";
      const achDir = path.join(ROOT, "..", "structured-analysis-of-competing-hypothesis");
      const outPath = path.join(achDir, "hypothesis.json");
      try {
        if (!fs.existsSync(achDir)) {
          fs.mkdirSync(achDir, { recursive: true });
        }
        let payload = {};
        if (fs.existsSync(outPath)) {
          try {
            payload = JSON.parse(fs.readFileSync(outPath, "utf8"));
          } catch (_) {}
        }
        if (typeof payload !== "object" || payload === null) payload = {};
        payload[id] = { id, title, description };
        fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
      } catch (err) {
        send(res, 500, JSON.stringify({ ok: false, error: String(err.message) }), "application/json");
        return;
      }
      send(res, 200, JSON.stringify({ ok: true }), "application/json");
    });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/hypotheses") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch (_) {
        send(res, 400, JSON.stringify({ ok: false, error: "Invalid JSON" }), "application/json");
        return;
      }
      const lines = Array.isArray(body.lines) ? body.lines.map((l) => (l == null ? "" : String(l))) : [];
      fs.writeFile(HYPOTHESES_FILE, lines.join("\n"), "utf8", (writeErr) => {
        if (writeErr) {
          send(res, 500, JSON.stringify({ ok: false, error: String(writeErr.message) }), "application/json");
          return;
        }
        send(res, 200, JSON.stringify({ ok: true }), "application/json");
      });
    });
    return;
  }

  if (req.method !== "GET") {
    send(res, 405, "Method not allowed", "text/plain");
    return;
  }

  const staticPath = urlPath === "/" ? "/index.html" : urlPath;
  const safePath = staticPath.replace(/^\/+/, "").replace(/\.\./g, "");
  const filePath = path.resolve(ROOT, safePath || "index.html");

  if (!filePath.startsWith(ROOT)) {
    send(res, 403, "Forbidden", "text/plain");
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") send(res, 404, "Not found", "text/plain");
      else send(res, 500, "Server error", "text/plain");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log("Multiple Hypothesis Generation: http://localhost:" + PORT);
});
