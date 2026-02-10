/**
 * Optional local server for the Timeline app.
 * Serves static files and provides POST /api/save-indicators to write
 * indicators to ../structured-analytic-circleboarding/indicators.txt
 * (no save dialog when server is used). Always appends (>>), never overwrites.
 *
 * Run: node server.js
 * Then open http://localhost:8080
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8080;
const ROOT = __dirname;
const INDICATORS_PATH = path.join(ROOT, "..", "structured-analytic-circleboarding", "indicators.txt");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
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
  if (req.method === "POST" && req.url === "/api/save-indicators") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      let body = Buffer.concat(chunks).toString("utf8");
      const dir = path.dirname(INDICATORS_PATH);
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
          send(res, 500, JSON.stringify({ ok: false, error: "Could not create directory" }), "application/json");
          return;
        }
        fs.stat(INDICATORS_PATH, (errStat, st) => {
          if (!errStat && st && st.size > 0 && body.length > 0) {
            body = "\n" + body;
          }
          fs.appendFile(INDICATORS_PATH, body, "utf8", (err) => {
            if (err) {
              send(res, 500, JSON.stringify({ ok: false, error: String(err.message) }), "application/json");
              return;
            }
            send(res, 200, JSON.stringify({ ok: true }), "application/json");
          });
        });
      });
    });
    return;
  }

  if (req.method !== "GET") {
    send(res, 405, "Method not allowed", "text/plain");
    return;
  }

  let urlPath = req.url.split("?")[0] || "/";
  if (urlPath === "/") urlPath = "/index.html";
  const safePath = urlPath.replace(/^\/+/, "").replace(/\.\./g, "");
  const filePath = path.resolve(ROOT, safePath || "index.html");
  if (!filePath.startsWith(ROOT)) {
    send(res, 403, "Forbidden", "text/plain");
    return;
  }
  serveFile(filePath, res);
});

server.listen(PORT, () => {
  console.log("Timeline server at http://localhost:" + PORT);
  console.log("Indicators file: " + INDICATORS_PATH);
});
