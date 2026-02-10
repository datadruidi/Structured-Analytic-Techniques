/**
 * Local server for causal-map. Serves the app and writes indicators to
 * ../structured-analytic-circleboarding/indicators.txt when requested.
 * Run from this folder: node server.js
 * Then open http://localhost:8765 in the browser.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8765;
const INDICATORS_PATH = path.join(__dirname, '..', 'structured-analytic-circleboarding', 'indicators.txt');

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/save-indicators') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const dir = path.dirname(INDICATORS_PATH);
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(INDICATORS_PATH, body, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(err.message) }));
      }
    });
    return;
  }

  const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\))+/, '');
  const filePath = path.join(__dirname, safePath);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      res.end();
      return;
    }
    serveFile(filePath, res);
  });
});

server.listen(PORT, () => {
  console.log(`Causal map server: http://localhost:${PORT}`);
  console.log(`Indicators will be written to: ${INDICATORS_PATH}`);
});
