/**
 * Start hub (port 3000), Causal Map (8765), Timeline (8080), Circleboarding (8082), and Multiple Hypothesis (8083) from one terminal.
 * Run from repo root: node start-all.js
 * Then open http://localhost:3000 for the hub.
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

hubServer.listen(HUB_PORT, () => {
  console.log(`Hub:    http://localhost:${HUB_PORT}`);
});

function run(name, dir, script) {
  const child = spawn('node', [script], {
    cwd: path.join(ROOT, dir),
    stdio: 'inherit',
    shell: true,
  });
  child.on('error', (err) => console.error(`[${name}] error:`, err));
  child.on('exit', (code) => {
    if (code !== null && code !== 0) console.error(`[${name}] exited with ${code}`);
  });
  return child;
}

const causalMap = run('Causal Map', 'structured-analytic-causal-map', 'server.js');
const timeline = run('Timeline', 'structured-analytic-timeline', 'server.js');
const circleboarding = run('Circleboarding', 'structured-analytic-circleboarding', 'server.js');
const multipleHypothesis = run('Multiple Hypothesis', 'structured-analytic-multiple-hypothesis-generation', 'server.js');

process.on('SIGINT', () => {
  causalMap.kill();
  timeline.kill();
  circleboarding.kill();
  multipleHypothesis.kill();
  hubServer.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  causalMap.kill();
  timeline.kill();
  circleboarding.kill();
  multipleHypothesis.kill();
  hubServer.close();
  process.exit(0);
});

console.log('Causal Map, Timeline, Circleboarding, and Multiple Hypothesis started. Press Ctrl+C to stop all.\n');
