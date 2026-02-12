/**
 * Start hub and all tools with reserved ports per HUB-PAGE-INSTRUCTIONS.md:
 * Hub 3000, Causal Map 8765, Timeline 8080, Circleboarding 8082,
 * Multiple Hypothesis 8083, Competing Hypothesis 8084.
 * Reserved for future: 8085, 8086, 8087, 8088.
 * Run from repo root: node start-all.js
 * Press Ctrl+C to stop all servers.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const HUB_PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

const hubServer = http.createServer((req, res) => {
  if (req.method !== 'GET') {
    res.writeHead(405);
    res.end();
    return;
  }
  let urlPath = (req.url || '/').split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\))+/, '');
  const filePath = path.join(ROOT, safePath);
  if (!filePath.startsWith(ROOT)) {
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
    const ext = path.extname(filePath);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  });
});

const SERVERS = [
  { name: 'Hub', dir: null, port: HUB_PORT },
  { name: 'Causal map', dir: '01-getting-organized/structured-analytic-causal-map', port: 8765 },
  { name: 'Timeline', dir: '01-getting-organized/structured-analytic-timeline', port: 8080 },
  { name: 'Circleboarding', dir: '02-exploration/structured-analytic-circleboarding', port: 8082 },
  { name: 'Multiple Hypothesis Generation', dir: '03-diagnostics/structured-analytic-multiple-hypothesis-generation', port: 8083 },
  { name: 'Competing Hypothesis', dir: '03-diagnostics/structured-analysis-of-competing-hypothesis', port: 8084 },
];

function run(entry) {
  if (!entry.dir) return null;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(ROOT, entry.dir),
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  child.on('error', (err) => console.error(`[${entry.name}] error:`, err));
  child.on('exit', (code) => {
    if (code !== null && code !== 0) console.error(`[${entry.name}] exited with ${code}`);
  });
  return child;
}

hubServer.listen(HUB_PORT, () => {
  SERVERS.forEach((s) => console.log(`${s.name} server: http://localhost:${s.port}`));
  console.log('Press Ctrl+C to stop all.\n');
});

const children = SERVERS.filter((s) => s.dir).map((entry) => run(entry));

process.on('SIGINT', () => {
  children.forEach((c) => c && c.kill());
  hubServer.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  children.forEach((c) => c && c.kill());
  hubServer.close();
  process.exit(0);
});
