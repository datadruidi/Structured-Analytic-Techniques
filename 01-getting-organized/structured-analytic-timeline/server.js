/**
 * Optional local server for the Timeline app.
 * Serves static files and provides POST /api/save-indicators to append
 * one JSON Lines (NDJSON) record to 02-exploration/structured-analytic-circleboarding/input/hypothesis_keywords.jsonl.
 * One "Generate Hypothesis Keywords" click = one line (append-only).
 *
 * Run: node server.js
 * Then open http://localhost:8080
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8080;
const ROOT = __dirname;
const JSONL_PATH = path.resolve(ROOT, "..", "..", "02-exploration", "structured-analytic-circleboarding", "input", "hypothesis_keywords.jsonl");

function toArray(val) {
  if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
  if (val == null) return [];
  return [String(val).trim()].filter(Boolean);
}

function normalizeRecord(body) {
  const createdAt = body && body.createdAt && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(String(body.createdAt))
    ? String(body.createdAt)
    : new Date().toISOString();
  const record = {
    createdAt,
    what: toArray(body && body.what),
    who: toArray(body && body.who),
    when: toArray(body && body.when),
    where: toArray(body && body.where),
    why: toArray(body && body.why),
    how: toArray(body && body.how)
  };
  if (body && body.id != null && String(body.id).trim() !== "") record.id = String(body.id).trim();
  if (body && body.evidence != null && String(body.evidence).trim() !== "") record.evidence = String(body.evidence).trim();
  if (body && body.sessionId != null && String(body.sessionId).trim() !== "") record.sessionId = String(body.sessionId).trim();
  if (body && body.appVersion != null && String(body.appVersion).trim() !== "") record.appVersion = String(body.appVersion).trim();
  return record;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".jsonl": "application/x-ndjson",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, statusCode, body, contentType) {
  res.writeHead(statusCode, { "Content-Type": contentType || "text/plain; charset=utf-8" });
  res.end(body);
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        send(res, 404, "Not found", "text/plain");
        return;
      }
      send(res, 500, "Server error", "text/plain");
      return;
    }
    send(res, 200, data, contentType);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "").split("?")[0].replace(/\/$/, "") || "/";
  if (req.method === "POST" && urlPath === "/api/save-indicators") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch (e) {
        send(res, 400, JSON.stringify({ ok: false, error: "Invalid JSON" }), "application/json");
        return;
      }
      const record = normalizeRecord(body);
      const line = JSON.stringify(record) + "\n";
      const dir = path.dirname(JSONL_PATH);
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(JSONL_PATH, line, "utf8");
        console.log("Appended hypothesis keywords to:", JSONL_PATH);
        send(res, 200, JSON.stringify({ ok: true }), "application/json");
      } catch (err) {
        console.error("Error writing hypothesis keywords:", err.message);
        send(res, 500, JSON.stringify({ ok: false, error: String(err.message) }), "application/json");
      }
    });
    return;
  }

  if (req.method !== "GET") {
    send(res, 405, "Method not allowed", "text/plain");
    return;
  }

  const filePathFromUrl = urlPath === "/" ? "/index.html" : urlPath;
  const safePath = filePathFromUrl.replace(/^\/+/, "").replace(/\.\./g, "");
  const filePath = path.resolve(ROOT, safePath || "index.html");
  if (!filePath.startsWith(ROOT)) {
    send(res, 403, "Forbidden", "text/plain");
    return;
  }
  serveFile(filePath, res);
});

server.listen(PORT, () => {
  console.log("Timeline server at http://localhost:" + PORT);
  console.log("Hypothesis keywords (JSONL) will be written to:", JSONL_PATH);
});
