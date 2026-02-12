/**
 * Local server for causal-map. Serves the app and appends one JSONL record to
 * 02-exploration/structured-analytic-circleboarding/input/hypothesis_keywords.jsonl when requested.
 * Run from this folder: node server.js
 * Then open http://localhost:8765 in the browser.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8765;
const JSONL_PATH = path.resolve(__dirname, '..', '..', '02-exploration', 'structured-analytic-circleboarding', 'input', 'hypothesis_keywords.jsonl');

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
    what: toArray(body && body.what),
    who: toArray(body && body.who),
    when: toArray(body && body.when),
    where: toArray(body && body.where),
    why: toArray(body && body.why),
    how: toArray(body && body.how)
  };
  if (body && body.id != null && String(body.id).trim() !== '') record.id = String(body.id).trim();
  if (body && body.evidence != null && String(body.evidence).trim() !== '') record.evidence = String(body.evidence).trim();
  if (body && body.sessionId != null && String(body.sessionId).trim() !== '') record.sessionId = String(body.sessionId).trim();
  if (body && body.appVersion != null && String(body.appVersion).trim() !== '') record.appVersion = String(body.appVersion).trim();
  return record;
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '').split('?')[0].replace(/\/$/, '') || '/';
  if (req.method === 'POST' && urlPath === '/api/save-indicators') {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
        return;
      }
      const record = normalizeRecord(body);
      const line = JSON.stringify(record) + '\n';
      const dir = path.dirname(JSONL_PATH);
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(JSONL_PATH, line, 'utf8');
        console.log('Appended hypothesis keywords to:', JSONL_PATH);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error('Error writing hypothesis keywords:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(err.message) }));
      }
    });
    return;
  }

  const staticPath = urlPath === '/' ? '/index.html' : urlPath;
  const safePath = path.normalize(staticPath).replace(/^(\.\.(\/|\\))+/, '').replace(/^[\\/]+/, '');
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
  console.log('Causal map server: http://localhost:' + PORT);
  console.log('Hypothesis keywords (JSONL) will be written to:', JSONL_PATH);
});
