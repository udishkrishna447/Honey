/**
 * HoneyChain - Lightweight Node.js Server & REST API
 * Zero-dependency server using built-in Node.js HTTP, FS, and Path modules.
 * Serves static web assets and provides REST API endpoints for HoneyChain.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const {
  initializeDatabase,
  getProducts,
  getProductsByIds,
  createProduct,
  updateProduct,
  deleteProduct,
  getCart,
  saveCart,
  getOrders,
  saveOrder,
  getDashboardStats,
  getBeekeepers,
  addBeekeeper,
  getCustomers,
  addCustomer,
  getKvicOfficers,
  addKvicOfficer,
  getAdminOfficers,
  addAdminOfficer,
  getHoneyBatches,
  addHoneyBatch,
  getFullDashboardData,
  registerUser,
  authenticateUser,
  getMe
} = require('./database');
const { HoneyBlockchain } = require('./blockchain');

const PORT = process.env.PORT || 3000;
const blockchain = new HoneyBlockchain();
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

function getGeminiApiKey() {
  if (!process.env.GEMINI_API_KEY) {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
  }
  return process.env.GEMINI_API_KEY || '';
}

const GEMINI_API_KEY = getGeminiApiKey();
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
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured in .env');

  const result = await requestJson({
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${encodeURIComponent(apiKey)}`,
    method: 'GET'
  });
  const availableModels = (result.models || []).filter(model =>
    model.supportedGenerationMethods?.includes('generateContent')
  );
  const preferredModels = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.1-flash',
    'gemini-3.0-flash',
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
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured in .env');

  const model = await getGeminiModel();
  const contents = history
    .filter(item => ['user', 'model'].includes(item.role) && typeof item.text === 'string')
    .slice(-10)
    .map(item => ({ role: item.role, parts: [{ text: item.text.slice(0, 2000) }] }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    const activeModel = await getGeminiModel();
    try {
      const result = await requestJson({
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/${activeModel}:generateContent?key=${encodeURIComponent(apiKey)}`,
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
      return { text, model: activeModel };
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

  // REAL-TIME DATABASE DASHBOARD ENDPOINTS
  if (pathname === '/api/dashboard/all' && req.method === 'GET') {
    getFullDashboardData().then(data => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    }).catch(error => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    });
    return;
  }

  if (pathname === '/api/dashboard/stats' && req.method === 'GET') {
    getDashboardStats().then(stats => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
    }).catch(error => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    });
    return;
  }

  if (pathname === '/api/dashboard/beekeepers') {
    if (req.method === 'GET') {
      getBeekeepers().then(data => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      }).catch(error => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      return;
    }
    if (req.method === 'POST') {
      readJsonBody(req).then(body => addBeekeeper(body)).then(rec => {
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, beekeeper: rec }));
      }).catch(error => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      return;
    }
  }

  if (pathname === '/api/dashboard/customers') {
    if (req.method === 'GET') {
      getCustomers(150).then(data => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      }).catch(error => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      return;
    }
    if (req.method === 'POST') {
      readJsonBody(req).then(body => addCustomer(body)).then(rec => {
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, customer: rec }));
      }).catch(error => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      return;
    }
  }

  if (pathname === '/api/dashboard/officers' && req.method === 'GET') {
    Promise.all([getKvicOfficers(), getAdminOfficers()]).then(([kvic, admin]) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ kvicOfficers: kvic, adminOfficers: admin }));
    }).catch(error => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    });
    return;
  }

  if (pathname === '/api/dashboard/kvic' && req.method === 'POST') {
    readJsonBody(req).then(body => addKvicOfficer(body)).then(rec => {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, officer: rec }));
    }).catch(error => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    });
    return;
  }

  if (pathname === '/api/dashboard/admins' && req.method === 'POST') {
    readJsonBody(req).then(body => addAdminOfficer(body)).then(rec => {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, admin: rec }));
    }).catch(error => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    });
    return;
  }

  // AUTHENTICATION API ROUTES (MongoDB Backed)
  if (pathname === '/api/auth/signup' && req.method === 'POST') {
    readJsonBody(req).then(body => {
      const { role, ...userData } = body;
      return registerUser(role, userData);
    }).then(user => {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user }));
    }).catch(error => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    });
    return;
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    readJsonBody(req).then(body => {
      const { role, email, password } = body;
      return authenticateUser(role, email, password);
    }).then(user => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user }));
    }).catch(error => {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    });
    return;
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const role = parsedUrl.searchParams.get('role');
    const id = parsedUrl.searchParams.get('id');
    getMe(role, id).then(user => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user }));
    }).catch(error => {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    });
    return;
  }

  if (pathname === '/api/dashboard/batches') {
    if (req.method === 'GET') {
      getHoneyBatches().then(data => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      }).catch(error => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      return;
    }
    if (req.method === 'POST') {
      readJsonBody(req).then(body => addHoneyBatch(body)).then(rec => {
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, batch: rec }));
      }).catch(error => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      return;
    }
  }

  if (pathname === '/api/products') {
    if (req.method === 'GET') {
      getProducts().then(products => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(products));
      }).catch(error => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      return;
    }
    if (req.method === 'POST') {
      readJsonBody(req).then(body => {
        if (body.role !== 'admin') throw new Error('Admin access required');
        return createProduct(body);
      }).then(product => {
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, product }));
      }).catch(error => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      return;
    }
  }

  if (pathname.startsWith('/api/products/') && ['PUT', 'DELETE'].includes(req.method)) {
    const productId = pathname.replace('/api/products/', '').trim();
    readJsonBody(req).then(body => {
      if (body.role !== 'admin') throw new Error('Admin access required');
      return req.method === 'DELETE' ? deleteProduct(productId) : updateProduct(productId, body);
    }).then(product => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, product: product || null }));
    }).catch(error => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    });
    return;
  }

  if (pathname === '/api/cart') {
    if (req.method === 'GET') {
      const userKey = parsedUrl.searchParams.get('userKey');
      getCart(userKey).then(items => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ items }));
      }).catch(error => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      return;
    }
    if (req.method === 'PUT') {
      readJsonBody(req).then(({ userKey, items }) => saveCart(userKey, Array.isArray(items) ? items : []))
        .then(savedItems => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ items: savedItems }));
        }).catch(error => {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        });
      return;
    }
  }

  if (pathname === '/api/orders') {
    if (req.method === 'GET') {
      const userKey = parsedUrl.searchParams.get('userKey');
      getOrders(userKey).then(orders => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ orders }));
      }).catch(error => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      return;
    }
    if (req.method === 'POST') {
      readJsonBody(req).then(async body => {
        if (!body.userKey || !Array.isArray(body.items) || !body.items.length) throw new Error('Order details are required');
        const productIds = [...new Set(body.items.map(item => Number(item.id)))];
        const products = await getProductsByIds(productIds);
        const productMap = new Map(products.map(product => [product.id, product]));
        if (products.length !== productIds.length) throw new Error('Invalid product in order');
        const items = body.items.map(item => {
          const product = productMap.get(Number(item.id));
          const quantity = Number(item.quantity);
          if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error('Invalid product quantity');
          return { ...product, quantity, subtotal: product.price * quantity };
        });
        const order = {
          orderId: body.orderId || `HC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          userKey: body.userKey,
          paymentId: body.paymentId || '',
          razorpayOrderId: body.razorpayOrderId || '',
          timestamp: body.timestamp || new Date().toISOString(),
          date: body.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Confirmed',
          statusClass: 'badge-confirmed',
          statusNote: 'Payment Verified · Direct allocation to KVIC tribal cooperative',
          totalAmount: items.reduce((sum, item) => sum + item.subtotal, 0),
          customerName: body.customerName || 'Customer',
          customerEmail: body.customerEmail || '',
          customerPhone: body.customerPhone || '',
          shippingAddress: body.shippingAddress || '',
          items
        };
        await saveOrder(order);
        return order;
      }).then(order => {
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, order }));
      }).catch(error => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      return;
    }
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
      const productIds = [...new Set(items.map(item => Number(item.id)))];
      const products = await getProductsByIds(productIds);
      if (products.length !== productIds.length) throw new Error('Invalid item in bag');
      const prices = new Map(products.map(product => [product.id, product.price]));
      const amount = items.reduce((total, item) => {
        const price = prices.get(Number(item.id));
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

initializeDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🍯 HoneyChain Server running at http://localhost:${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   - Products:    http://localhost:${PORT}/api/products`);
    console.log(`   - Blockchain:  http://localhost:${PORT}/api/blockchain`);
    console.log(`   - Batches:     http://localhost:${PORT}/api/batches`);
    console.log(`   - Telemetry:   http://localhost:${PORT}/api/telemetry`);
    console.log(`====================================================`);
  });
}).catch(error => {
  console.error(`MongoDB connection failed: ${error.message}`);
  process.exitCode = 1;
});
