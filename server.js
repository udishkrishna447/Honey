/**
 * HoneyChain - Lightweight Node.js Server & REST API
 * Zero-dependency server using built-in Node.js HTTP, FS, and Path modules.
 * Serves static web assets and provides REST API endpoints for HoneyChain.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { HoneyBlockchain } = require('./blockchain');

const PORT = process.env.PORT || 3000;
const blockchain = new HoneyBlockchain();
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TeKms0E782V0u2';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'ZHUA7f53tVs9TxAnyKXYcgnD';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const HONEY_PRICES = { 1: 680, 2: 820, 3: 740, 4: 650 };
let geminiModels = [];
let geminiModelIndex = 0;

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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Invalid JSON request body'));
      }
    });
    req.on('error', reject);
  });
}

function requestJson(options, payload = null) {
  return new Promise((resolve, reject) => {
    const request = https.request(options, response => {
      let responseBody = '';
      response.on('data', chunk => { responseBody += chunk; });
      response.on('end', () => {
        let result;
        try { result = JSON.parse(responseBody); } catch { result = {}; }
        if (response.statusCode >= 200 && response.statusCode < 300) resolve(result);
        else reject(new Error(result.error?.message || 'Gemini request failed'));
      });
    });
    request.on('error', reject);
    if (payload) request.write(JSON.stringify(payload));
    request.end();
  });
}

async function getGeminiModel() {
  if (geminiModels.length) return geminiModels[geminiModelIndex].name;
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured in .env');

  const result = await requestJson({
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    method: 'GET'
  });
  const availableModels = (result.models || []).filter(model =>
    model.supportedGenerationMethods?.includes('generateContent')
  );
  const preferredModels = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-3.1-flash',
    'gemini-3.0-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];
  geminiModels = preferredModels
    .map(preferred => availableModels.find(model => model.name.endsWith(`/${preferred}`)))
    .filter(Boolean);
  geminiModels.push(...availableModels.filter(model => !geminiModels.includes(model)));
  if (!geminiModels.length) throw new Error('No Gemini model supports generateContent for this API key');
  console.log(`Gemini chatbot model: ${geminiModels[0].name}`);
  return geminiModels[0].name;
}

async function answerWebsiteQuestion(message, history = []) {
  const model = await getGeminiModel();
  const contents = history
    .filter(item => ['user', 'model'].includes(item.role) && typeof item.text === 'string')
    .slice(-10)
    .map(item => ({ role: item.role, parts: [{ text: item.text.slice(0, 2000) }] }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    const model = await getGeminiModel();
    try {
      const result = await requestJson({
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        systemInstruction: {
          parts: [{ text: 'You are HoneyChain website assistant. Answer questions about this website, its honey products, KVIC traceability, blockchain, beekeeper tools, ordering, and payment flow. Use concise, helpful language. If a question is unrelated, say you can only help with HoneyChain website topics. Do not invent product prices, certifications, or order status.' }]
        },
        contents
      });
      const text = result.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('')
        .trim();
      if (!text) throw new Error('Gemini returned an empty response');
      return { text, model };
    } catch (error) {
      lastError = error;
      geminiModelIndex++;
      if (geminiModelIndex >= geminiModels.length) break;
    }
  }
  throw lastError || new Error('Gemini did not return a response');
}

function createRazorpayOrder(amount) {
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'api.razorpay.com',
      path: '/v1/orders',
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    }, response => {
      let responseBody = '';
      response.on('data', chunk => { responseBody += chunk; });
      response.on('end', () => {
        let result;
        try { result = JSON.parse(responseBody); } catch { result = {}; }
        if (response.statusCode >= 200 && response.statusCode < 300) resolve(result);
        else reject(new Error(result.error?.description || 'Razorpay order creation failed'));
      });
    });
    request.on('error', reject);
    request.write(JSON.stringify({ amount, currency: 'INR', receipt: `honeychain_${Date.now()}` }));
    request.end();
  });
}

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

  if (pathname === '/api/chat' && req.method === 'POST') {
    readJsonBody(req).then(async ({ message, history }) => {
      if (typeof message !== 'string' || !message.trim()) throw new Error('Please enter a question');
      if (message.length > 2000) throw new Error('Question is too long');
      const answer = await answerWebsiteQuestion(message.trim(), Array.isArray(history) ? history : []);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(answer));
    }).catch(error => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    });
    return;
  }

  if (pathname === '/api/create-order' && req.method === 'POST') {
    if (!RAZORPAY_KEY_SECRET) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'RAZORPAY_KEY_SECRET is not configured on the server' }));
      return;
    }

    readJsonBody(req).then(async ({ items }) => {
      if (!Array.isArray(items) || !items.length) throw new Error('Your bag is empty');
      const amount = items.reduce((total, item) => {
        const price = HONEY_PRICES[item.id];
        const quantity = Number(item.quantity);
        if (!price || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
          throw new Error('Invalid item in bag');
        }
        return total + price * quantity * 100;
      }, 0);
      const razorpayOrder = await createRazorpayOrder(amount);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: razorpayOrder.id, amount, currency: 'INR', keyId: RAZORPAY_KEY_ID }));
    }).catch(error => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    });
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
