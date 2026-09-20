/**
 * HoneyChain - Lightweight Node.js Server & REST API
 * Zero-dependency server using built-in Node.js HTTP, FS, and Path modules.
 * Serves static web assets and provides REST API endpoints for HoneyChain.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { HoneyBlockchain } = require('./blockchain');

const PORT = process.env.PORT || 3000;
const blockchain = new HoneyBlockchain();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.zip': 'application/zip',
  '.pdf': 'application/pdf',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Direct PPTX download route
  if (pathname === '/download-pptx' || pathname === '/presentation-pptx') {
    const pptxPath = path.join(__dirname, 'HoneyChain_Presentation_KEC.pptx');
    if (fs.existsSync(pptxPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': 'attachment; filename="HoneyChain_Presentation_KEC.pptx"',
        'Content-Length': fs.statSync(pptxPath).size
      });
      fs.createReadStream(pptxPath).pipe(res);
      return;
    }
  }

  // Direct PDF download route
  if (pathname === '/download-pdf' || pathname === '/presentation-pdf') {
    const pdfPath = path.join(__dirname, 'HoneyChain_Presentation_KEC.pdf');
    if (fs.existsSync(pdfPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="HoneyChain_Presentation_KEC.pdf"',
        'Content-Length': fs.statSync(pdfPath).size
      });
      fs.createReadStream(pdfPath).pipe(res);
      return;
    }
  }

  // Direct ZIP download route
  if (pathname === '/download' || pathname === '/Honeychain.zip') {
    const zipPath = path.join(__dirname, 'Honeychain.zip');
    if (fs.existsSync(zipPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="Honeychain.zip"',
        'Content-Length': fs.statSync(zipPath).size
      });
      fs.createReadStream(zipPath).pipe(res);
      return;
    }
  }

  // REST API Endpoints
  if (pathname === '/api/blockchain') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      chainLength: blockchain.chain.length,
      isChainValid: blockchain.isChainValid(),
      chain: blockchain.chain
    }, null, 2));
    return;
  }

  if (pathname === '/api/batches') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(blockchain.getAllBatches(), null, 2));
    return;
  }

  if (pathname.startsWith('/api/batches/')) {
    const batchId = pathname.replace('/api/batches/', '').trim();
    const batch = blockchain.findBatch(batchId);
    if (!batch) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Batch ${batchId} not found` }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(batch, null, 2));
    return;
  }

  if (pathname === '/api/telemetry') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      hiveId: 'KVIC-BOX-NIL-4082',
      cluster: 'Kotagiri, Nilgiris',
      temperature: 34.2,
      humidity: 58.4,
      grossWeightKg: 32.4,
      acousticHz: 215,
      co2Ppm: 580,
      solarBatteryPercent: 94,
      queenHealth: 'Active & Optimal',
      swarmRiskScore: 12
    }));
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found: ' + pathname);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error: ' + err.code);
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🍯 HoneyChain Server running at http://localhost:${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   - Blockchain:  http://localhost:${PORT}/api/blockchain`);
  console.log(`   - Batches:     http://localhost:${PORT}/api/batches`);
  console.log(`   - Telemetry:   http://localhost:${PORT}/api/telemetry`);
  console.log(`====================================================`);
});
