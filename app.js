/**
 * HoneyChain - Master Application Controller
 * Orchestrates 4 Role-Based Stakeholder Portals:
 * 1. 👤 Customer (Shop, Verify, Traceability, Orders, Profile)
 * 2. 🐝 Beekeeper (Kisan Dashboard, Bee Boxes, IoT Telemetry, AI Lab, Harvest, Payouts)
 * 3. 🏢 KVIC Officer (Cluster Monitoring, Batch Approval, NMR Cert, Blockchain, Alerts, Reports)
 * 4. 🔐 Admin (User Management, Batches, Products, IoT Grid, AI Lab, KVIC Org, Blockchain, Settings)
 */

// Simple robust client-side SVG QR Code generator
function generateQRCodeSVG(text, size = 180) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  
  const modules = 25;
  const cellSize = size / modules;
  let rects = '';

  // Standard 3 Finder Patterns
  function drawFinderPattern(startX, startY) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          const x = (startX + c) * cellSize;
          const y = (startY + r) * cellSize;
          rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#1c1917" />`;
        }
      }
    }
  }

  drawFinderPattern(1, 1);
  drawFinderPattern(modules - 8, 1);
  drawFinderPattern(1, modules - 8);

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if ((r < 9 && c < 9) || (r < 9 && c > modules - 10) || (r > modules - 10 && c < 9)) continue;
      
      const charCode = text.charCodeAt((r * modules + c) % text.length);
      const isBlack = ((r * 7 + c * 11 + hash + charCode) % 3 === 0);
      if (isBlack) {
        const x = c * cellSize;
        const y = r * cellSize;
        rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#1c1917" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
    <rect width="${size}" height="${size}" fill="#ffffff" rx="8" />
    ${rects}
  </svg>`;
}

// Definition of the 4 Roles
const AUTH_ROLES = {
  customer: {
    id: 'HC-USER-4412',
    name: 'Ananya Sharma',
    role: 'customer',
    roleTitle: 'Verified Honey Consumer',
    email: 'ananya.s@gmail.com',
    location: 'Bengaluru, Karnataka',
    avatar: '👤',
    portalId: 'portal-customer',
    defaultSubView: 'cust-home',
    navTabs: [
      { id: 'cust-home', label: '🏠 Home' },
      { id: 'cust-shop', label: '🍯 Honey Shop' },
      { id: 'cust-verify', label: '🔍 Verify Honey / Scan QR' },
      { id: 'cust-trace', label: '📜 Traceability' },
      { id: 'cust-orders', label: '📦 My Orders' },
      { id: 'cust-cart', label: '🛒 Cart' },
      { id: 'cust-profile', label: '👤 My Profile' }
    ]
  },
  beekeeper: {
    id: 'KVIC-BEE-TN-9810',
    name: 'Ramaswamy K.',
    role: 'beekeeper',
    roleTitle: 'Registered KVIC Beekeeper',
    email: 'ramaswamy.k@kvic-honey.org',
    cluster: 'Nilgiris Adivasi Beekeeping Society',
    location: 'Kotagiri, Nilgiris',
    avatar: '🐝',
    portalId: 'portal-beekeeper',
    defaultSubView: 'bk-dash',
    navTabs: [
      { id: 'bk-dash', label: '🏠 Beekeeper Dashboard' },
      { id: 'bk-boxes', label: '🐝 My Bee Boxes' },
      { id: 'bk-iot', label: '📡 IoT Hive Telemetry' },
      { id: 'bk-ai', label: '🧠 AI Disease Diagnostics' },
      { id: 'bk-yield', label: '📊 Honey Yield Forecast' },
      { id: 'bk-harvest', label: '🍯 Register Harvest' },
      { id: 'bk-batches', label: '📦 My Honey Batches' },
      { id: 'bk-qr', label: '📱 Generate QR' },
      { id: 'bk-payout', label: '💰 Payment / Procurement Status' },
      { id: 'bk-profile', label: '👤 Profile' }
    ]
  },
  kvic_officer: {
    id: 'KVIC-OFFICER-DIR-01',
    name: 'Dr. A. Sharma',
    role: 'kvic_officer',
    roleTitle: 'KVIC Quality Director & Lab Head',
    email: 'director.sharma@kvic.gov.in',
    cluster: 'Central Honey Quality Testing Laboratory',
    location: 'Pune, Maharashtra',
    avatar: '🏢',
    portalId: 'portal-kvic',
    defaultSubView: 'kvic-dash',
    navTabs: [
      { id: 'kvic-dash', label: '🏠 KVIC Dashboard' },
      { id: 'kvic-clusters', label: '🐝 Beekeeper/Cluster Monitoring' },
      { id: 'kvic-approval', label: '🍯 Honey Batch Approval' },
      { id: 'kvic-nmr', label: '🧪 Lab/NMR Certification' },
      { id: 'kvic-quality', label: '✅ Quality Certification' },
      { id: 'kvic-national', label: '📊 National Honey Quality Monitoring' },
      { id: 'kvic-blockchain', label: '⛓️ Blockchain Records' },
      { id: 'kvic-qr', label: '📱 QR Passport Verification' },
      { id: 'kvic-alerts', label: '🚨 Alerts' },
      { id: 'kvic-reports', label: '📈 Reports' }
    ]
  },
  admin: {
    id: 'ADMIN-ROOT-001',
    name: 'System Administrator',
    role: 'admin',
    roleTitle: 'Root System Admin',
    email: 'admin@honeychain.kvic.in',
    location: 'KVIC HQ, New Delhi',
    avatar: '🔐',
    portalId: 'portal-admin',
    defaultSubView: 'admin-dash',
    navTabs: [
      { id: 'admin-dash', label: '🏠 Dashboard' },
      { id: 'admin-users', label: '👥 User Management' },
      { id: 'admin-batches', label: '📦 Batch Management' },
      { id: 'admin-products', label: '🍯 Honey Products' },
      { id: 'admin-iot', label: '📡 IoT Monitoring' },
      { id: 'admin-ai', label: '🧠 AI Diagnostics' },
      { id: 'admin-kvic', label: '🏛️ KVIC Management' },
      { id: 'admin-blockchain', label: '⛓️ Blockchain' },
      { id: 'admin-reports', label: '📈 Reports' },
      { id: 'admin-settings', label: '⚙️ System Settings' }
    ]
  }
};

class HoneyChainApp {
  constructor() {
    this.blockchain = new HoneyBlockchain();
    this.iotSimulator = new HiveTelemetrySimulator('KVIC-TB-NIL-4082');
    this.products = [];
    this.cart = JSON.parse(localStorage.getItem('honeychain_cart') || '[]');
    
    this.initDOM();
    this.initAuthModule();
    this.initIoTModule();
    this.initAIModule();
    this.initTraceModule();
    this.initKisanModule();
    this.initKvicModule();
    this.initBlockchainExplorer();
    this.initOrders();
    this.renderCustomerOrders();
    this.initCartListeners();
    this.initChatbot();
    this.renderBeekeeperBatches();
    this.renderBeekeeperQR();

    // Check initial auth state: if user is logged in, enter portal; otherwise show Auth Gateway
    this.checkInitialAuthState();
    this.verifyBatch('HC-KVIC-2026-NIL01');
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
      if (!response.ok) throw new Error(products.error || 'Unable to load products');
      this.products = products;
      this.renderProducts();
      this.renderAdminProducts();
      this.renderCart();
    } catch (error) {
      this.toast(error.message);
    }
  }

  initDOM() {
    this.$ = (sel) => document.querySelector(sel);
    this.$$ = (sel) => [...document.querySelectorAll(sel)];
  }

  toast(message) {
    const toastEl = this.$('#toast');
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }

  initChatbot() {
    this.chatHistory = [];
    const toggle = this.$('#chatbot-toggle');
    const panel = this.$('#chatbot-panel');
    const close = this.$('#chatbot-close');
    const form = this.$('#chatbot-form');
    const input = this.$('#chatbot-input');

    const setOpen = (open) => {
      if (!panel || !toggle) return;
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) input?.focus();
    };

    toggle?.addEventListener('click', () => setOpen(panel.hidden));
    close?.addEventListener('click', () => setOpen(false));
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      this.askChatbot(input);
    });
  }

  appendChatMessage(text, type) {
    const messages = this.$('#chatbot-messages');
    if (!messages) return;
    const message = document.createElement('div');
    message.className = `chatbot-message chatbot-message-${type}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  async askChatbot(input) {
    const message = input?.value.trim();
    if (!message || input.disabled) return;
    input.value = '';
    input.disabled = true;
    this.appendChatMessage(message, 'user');
    this.appendChatMessage('Thinking...', 'bot chatbot-message-loading');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: this.chatHistory })
      });
      const result = await response.json();
      const loading = this.$('.chatbot-message-loading');
      loading?.remove();
      if (!response.ok) throw new Error(result.error || 'Assistant is unavailable');
      this.chatHistory.push({ role: 'user', text: message }, { role: 'model', text: result.text });
      this.appendChatMessage(result.text, 'bot');
    } catch (error) {
      this.$('.chatbot-message-loading')?.remove();
      this.appendChatMessage(error.message, 'bot');
    } finally {
      input.disabled = false;
      input.focus();
    }
  }

  // ==========================================
  // 4-ROLE AUTHENTICATION & PORTAL SWITCHING
  // ==========================================
  initAuthModule() {
    this.currentUser = JSON.parse(localStorage.getItem('honeychain_auth_user') || 'null');

    // Toggle Dropdown
    const authBtn = this.$('#open-login-btn');
    const dropdown = this.$('#auth-dropdown');
    const modal = this.$('#login-modal');

    authBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown?.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#user-auth-wrap')) {
        dropdown?.classList.remove('open');
      }
    });

    this.$('#drop-switch-role-btn')?.addEventListener('click', () => {
      dropdown?.classList.remove('open');
      this.openLoginModal();
    });

    this.$('#drop-logout-btn')?.addEventListener('click', () => {
      dropdown?.classList.remove('open');
      this.logout();
    });

    this.$('#close-login-btn')?.addEventListener('click', () => {
      this.closeLoginModal();
    });

    modal?.addEventListener('click', (e) => {
      if (e.target.id === 'login-modal') this.closeLoginModal();
    });

    // 4 Quick Login Buttons inside switch role modal
    this.$$('[data-login-as]').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.loginAs;
        this.quickDemoLogin(role);
      });
    });

    // Custom form login in switch modal
    this.$('#custom-login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = this.$('#custom-role-select').value;
      const email = this.$('#custom-email').value.trim();
      const password = this.$('#custom-password')?.value || 'password123';

      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          this.loginSuccess(data.user, true);
        } else {
          this.toast(data.error || 'Login failed');
        }
      })
      .catch(err => this.toast(err.message));
    });

    // Cart Handlers
    this.$$('[data-open-cart]').forEach(el => el.addEventListener('click', () => this.toggleCart(true)));
    this.$$('[data-close-cart]').forEach(el => el.addEventListener('click', () => this.toggleCart(false)));
    this.$('#cart-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'cart-modal') this.toggleCart(false);
    });
  }

  checkInitialAuthState() {
    this.showAuthGateway();
  }

  showAuthGateway() {
    const gateway = this.$('#auth-gateway-screen');
    if (gateway) gateway.style.display = 'flex';
    this.$$('.role-portal-view').forEach(p => p.style.display = 'none');
    const headerLogout = this.$('#header-direct-logout');
    if (headerLogout) headerLogout.style.display = 'none';
    const navContainer = this.$('#role-nav-tabs');
    if (navContainer) navContainer.innerHTML = '';
    this.showGatewayView('welcome');
  }

  showGatewayView(view) {
    const stepWelcome = this.$('#gateway-step-welcome');
    const stepLogin = this.$('#gateway-step-login');
    const stepSignup = this.$('#gateway-step-signup');

    if (stepWelcome) stepWelcome.style.display = (view === 'welcome') ? 'block' : 'none';
    if (stepLogin) stepLogin.style.display = (view === 'login') ? 'block' : 'none';
    if (stepSignup) stepSignup.style.display = (view === 'signup') ? 'block' : 'none';

    if (view === 'login') {
      this.selectLoginRole('customer');
    } else if (view === 'signup') {
      this.selectSignupRole('customer');
    }
  }

  async enterModuleDirect(role) {
    return this.quickDemoLogin(role);
  }

  switchAuthMode(mode) {
    this.showGatewayView(mode);
  }

  selectLoginRole(role) {
    this.$$('[data-login-role]').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.loginRole === role);
    });
    const hiddenInput = this.$('#login-role-hidden');
    if (hiddenInput) hiddenInput.value = role;

    const label = this.$('#login-email-label');
    const input = this.$('#login-email-input');

    if (role === 'customer') {
      if (label) label.textContent = 'Customer Name';
      if (input) {
        input.placeholder = 'e.g. Priya Sundaram or CUST001';
        input.value = 'Priya Sundaram';
      }
    } else if (role === 'beekeeper') {
      if (label) label.textContent = 'Beekeeper Name';
      if (input) {
        input.placeholder = 'e.g. Kumar or BK001 or Muthusamy';
        input.value = 'Kumar';
      }
    } else if (role === 'kvic_officer') {
      if (label) label.textContent = 'Officer Name';
      if (input) {
        input.placeholder = 'e.g. Dr. S. K. Narayanan or KVIC-OFFICER-01';
        input.value = 'Dr. S. K. Narayanan';
      }
    } else if (role === 'admin') {
      if (label) label.textContent = 'Admin Name';
      if (input) {
        input.placeholder = 'e.g. Administrator or ADMIN-001';
        input.value = 'Administrator';
      }
    }

    const passInput = this.$('#login-password-input');
    if (passInput && !passInput.value) {
      passInput.value = 'password123';
    }
  }

  quickEnterRole(role) {
    this.showGatewayView('login');
    this.selectLoginRole(role);
  }

  selectSignupRole(role) {
    const tabs = ['cust', 'bk', 'kvic', 'admin'];
    const tabMap = {
      customer: 'cust',
      beekeeper: 'bk',
      kvic_officer: 'kvic',
      admin: 'admin'
    };

    tabs.forEach(t => {
      this.$('#signup-tab-' + t)?.classList.toggle('active', tabMap[role] === t);
    });

    const forms = {
      customer: this.$('#form-signup-customer'),
      beekeeper: this.$('#form-signup-beekeeper'),
      kvic_officer: this.$('#form-signup-kvic'),
      admin: this.$('#form-signup-admin')
    };

    Object.keys(forms).forEach(r => {
      if (forms[r]) forms[r].style.display = (r === role) ? 'block' : 'none';
    });
  }

  switchCustSignupOption(opt) {
    const btnQuick = this.$('#btn-cust-opt-quick');
    const btnFull = this.$('#btn-cust-opt-full');
    const deliveryWrap = this.$('#cust-delivery-details-wrap');
    const hint = this.$('#cust-quick-hint');
    const submitBtn = this.$('#su-cust-submit-btn');

    if (opt === 'quick') {
      btnQuick?.classList.add('active');
      btnFull?.classList.remove('active');
      if (deliveryWrap) deliveryWrap.style.display = 'none';
      if (hint) {
        hint.innerHTML = '<span>ℹ️</span> <span>Quick Sign Up: Enter just your Name &amp; Password to instantly access the store.</span>';
      }
      if (submitBtn) {
        submitBtn.innerHTML = 'Register Customer with Name &amp; Password <span>&rarr;</span>';
      }
      const address = this.$('#su-cust-address');
      const location = this.$('#su-cust-location');
      const pincode = this.$('#su-cust-pincode');
      if (address) address.required = false;
      if (location) location.required = false;
      if (pincode) pincode.required = false;
    } else {
      btnFull?.classList.add('active');
      btnQuick?.classList.remove('active');
      if (deliveryWrap) deliveryWrap.style.display = 'block';
      if (hint) {
        hint.innerHTML = '<span>📦</span> <span>Full Sign Up: Your address will be saved to your profile for automatic honey delivery.</span>';
      }
      if (submitBtn) {
        submitBtn.innerHTML = 'Register Customer &amp; Go to Customer Portal <span>&rarr;</span>';
      }
      const address = this.$('#su-cust-address');
      const location = this.$('#su-cust-location');
      const pincode = this.$('#su-cust-pincode');
      if (address) address.required = true;
      if (location) location.required = true;
      if (pincode) pincode.required = true;
    }
  }

  async quickDemoLogin(role) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email: role, password: 'password123' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');
      this.loginSuccess(data.user, true);
    } catch (err) {
      this.toast('Login error: ' + err.message);
    }
  }

  async handleGatewayLogin(e) {
    e.preventDefault();
    const role = this.$('#login-role-hidden')?.value || 'customer';
    const email = this.$('#login-email-input')?.value?.trim();
    const password = this.$('#login-password-input')?.value;

    if (!email) {
      this.toast('Please enter your email or ID');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');

      this.loginSuccess(data.user, true);
    } catch (err) {
      this.toast('Login failed: ' + err.message);
    }
  }

  async handleGatewaySignup(e, role) {
    e.preventDefault();
    let payload = { role };

    if (role === 'customer') {
      payload.name = this.$('#su-cust-name')?.value?.trim();
      payload.password = this.$('#su-cust-password')?.value;
    } else if (role === 'beekeeper') {
      payload.name = this.$('#su-bk-name')?.value?.trim();
      payload.password = this.$('#su-bk-password')?.value;
    } else if (role === 'kvic_officer') {
      payload.name = this.$('#su-kvic-name')?.value?.trim();
      payload.password = this.$('#su-kvic-password')?.value;
    } else if (role === 'admin') {
      payload.name = this.$('#su-admin-name')?.value?.trim();
      payload.password = this.$('#su-admin-password')?.value;
    }

    if (!payload.name) {
      this.toast('Please enter your name');
      return;
    }
    if (!payload.password) {
      this.toast('Please create a password');
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      this.toast(`✓ Successfully registered ${data.user.name} to MongoDB!`);
      this.loginSuccess(data.user, true);
    } catch (err) {
      this.toast('Signup failed: ' + err.message);
    }
  }

  loginSuccess(user, showToast = true) {
    this.currentUser = user;
    localStorage.setItem('honeychain_auth_user', JSON.stringify(user));

    const gateway = this.$('#auth-gateway-screen');
    if (gateway) gateway.style.display = 'none';

    const headerLogout = this.$('#header-direct-logout');
    if (headerLogout) headerLogout.style.display = 'inline-flex';

    this.switchRole(user.role, user);

    if (showToast) {
      this.toast(`Welcome, ${user.name}! Connected to MongoDB.`);
    }
  }

  openLoginModal() {
    this.$('#login-modal')?.classList.add('open');
  }

  closeLoginModal() {
    this.$('#login-modal')?.classList.remove('open');
  }

  switchRole(roleKey, customInfo = null) {
    const baseProfile = AUTH_ROLES[roleKey] || AUTH_ROLES.customer;
    this.currentUser = {
      ...baseProfile,
      ...(customInfo || {})
    };

    localStorage.setItem('honeychain_auth_user', JSON.stringify(this.currentUser));
    this.closeLoginModal();
    this.updateAuthUI();

    const gateway = this.$('#auth-gateway-screen');
    if (gateway) gateway.style.display = 'none';

    // Hide all portal views and display active role's portal
    this.$$('.role-portal-view').forEach(p => p.style.display = 'none');
    const activePortal = this.$('#' + (this.currentUser.portalId || baseProfile.portalId));
    if (activePortal) activePortal.style.display = 'block';

    // Render navigation tabs for this role
    this.renderRoleNavigation();

    // Activate default subview for this role
    this.switchSubView(this.currentUser.defaultSubView || baseProfile.defaultSubView);

    // Cart button visibility (Customer & Admin only)
    const cartBtn = this.$('#header-cart-btn');
    if (cartBtn) {
      cartBtn.style.display = (this.currentUser.role === 'customer' || this.currentUser.role === 'admin') ? 'flex' : 'none';
    }

    if (!customInfo) {
      this.toast(`Logged in as ${this.currentUser.name} (${this.currentUser.roleTitle})`);
    }
  }

  logout() {
    localStorage.removeItem('honeychain_auth_user');
    this.currentUser = null;
    this.showAuthGateway();
    this.toast('Signed out successfully.');
  }

  renderRoleNavigation() {
    const navContainer = this.$('#role-nav-tabs');
    if (!navContainer || !this.currentUser) return;

    const tabs = this.currentUser.navTabs || [];
    navContainer.innerHTML = tabs.map((tab, idx) => `
      <button class="module-tab-btn ${idx === 0 ? 'active' : ''}" data-subview="${tab.id}">
        ${tab.label}
      </button>
    `).join('');

    navContainer.querySelectorAll('.module-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchSubView(btn.dataset.subview);
      });
    });
  }

  switchSubView(subviewId) {
    // Update active state on navigation buttons
    this.$$('.module-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.subview === subviewId);
    });

    // Hide all subviews within active portal, then show target
    const currentPortal = this.$('#' + this.currentUser.portalId);
    if (currentPortal) {
      currentPortal.querySelectorAll('.subview-content').forEach(view => {
        view.classList.toggle('active', view.id === subviewId);
      });
    }

    // Trigger charts / dynamic elements on tab activation
    if (subviewId === 'bk-iot' || subviewId === 'admin-iot') {
      setTimeout(() => {
        if (this.tempChart) this.tempChart.render(this.iotSimulator.history.temperature, this.iotSimulator.history.labels);
        if (this.weightChart) this.weightChart.render(this.iotSimulator.history.weightKg, this.iotSimulator.history.labels);
      }, 50);
    }
    if (subviewId === 'admin-blockchain' || subviewId === 'kvic-blockchain') {
      this.renderBlockchainExplorer();
    }
    if (subviewId === 'bk-ai') {
      if (this.visionDetector) this.visionDetector.renderDiagnosticCanvas();
    }
    if (subviewId === 'bk-qr') {
      const selectVal = this.$('#bk-qr-select')?.value || 'HC-KVIC-2026-NIL01';
      this.renderBeekeeperQR(selectVal);
    }
    if (subviewId === 'cust-cart') {
      this.renderCart();
    }
    if (subviewId === 'cust-orders') {
      this.renderCustomerOrders();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateAuthUI() {
    if (!this.currentUser) return;

    const nameEl = this.$('#auth-user-name');
    const avatarEl = this.$('#auth-user-avatar');
    const tagEl = this.$('#auth-role-tag');

    if (nameEl) nameEl.textContent = this.currentUser.name;
    if (avatarEl) avatarEl.textContent = this.currentUser.avatar;

    if (tagEl) {
      tagEl.textContent = this.currentUser.role.replace('_', ' ').toUpperCase();
      tagEl.className = `auth-role-tag tag-${this.currentUser.role}`;
    }

    const dropAvatar = this.$('#drop-user-avatar');
    const dropName = this.$('#drop-user-name');
    const dropRole = this.$('#drop-user-role');

    if (dropAvatar) dropAvatar.textContent = this.currentUser.avatar;
    if (dropName) dropName.textContent = this.currentUser.name;
    if (dropRole) dropRole.textContent = `${this.currentUser.roleTitle} · ${this.currentUser.location || ''}`;

    this.$$('.auth-role-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.authRole === this.currentUser.role);
    });
  }

  // ==========================================
  // 1. CONSUMER SHOP & QR TRACEABILITY PASSPORT
  // ==========================================
  renderProducts() {
    const cardHtml = this.products.map(p => `
      <article class="product-card">
        <div class="product-image">
          <img src="${p.image}" alt="${p.name} honey jar" loading="lazy">
          <span class="product-tag">${p.type.toUpperCase()}</span>
        </div>
        <div class="product-info">
          <h3>${p.name}</h3>
          <div class="product-meta">
            <span>📍 ${p.origin}</span>
            <span>🏛️ ${p.cluster}</span>
            <small style="color: var(--color-amber-700); font-family: var(--font-mono);">${p.batchId}</small>
          </div>
          <div class="product-bottom">
            <span class="product-price">₹${p.price} <small style="font-size:0.75rem; font-weight:500;">/ ${p.size}</small></span>
            <div class="product-actions">
              <button class="view-batch-btn" data-batch="${p.batchId}">Passport ↗</button>
              <button class="add-button" data-add="${p.id}">Add +</button>
            </div>
          </div>
        </div>
      </article>
    `).join('');

    const grid = this.$('#product-grid');
    const featuredGrid = this.$('#product-grid-featured');
    if (grid) grid.innerHTML = cardHtml;
    if (featuredGrid) featuredGrid.innerHTML = cardHtml;

    const handleProductClicks = (e) => {
      const addBtn = e.target.closest('[data-add]');
      const batchBtn = e.target.closest('[data-batch]');
      if (addBtn) this.addToCart(Number(addBtn.dataset.add));
      if (batchBtn) {
        this.verifyBatch(batchBtn.dataset.batch);
        this.switchSubView('cust-trace');
      }
    };

    if (grid) grid.addEventListener('click', handleProductClicks);
    if (featuredGrid) featuredGrid.addEventListener('click', handleProductClicks);
  }

  renderAdminProducts() {
    const tableBody = this.$('#admin-products-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = this.products.map(product => `
      <tr>
        <td><strong>${product.name}</strong></td>
        <td>${product.cluster}</td>
        <td>₹${product.price}</td>
        <td>${product.size}</td>
        <td>${product.batchId}</td>
        <td><span class="status-pill-active">In Stock</span></td>
      </tr>
    `).join('');
  }

  initTraceModule() {
    const input = this.$('#batch-input');
    const btn = this.$('#verify-button');

    if (btn && input) {
      btn.addEventListener('click', () => {
        this.verifyBatch(input.value);
        this.switchSubView('cust-trace');
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.verifyBatch(input.value);
          this.switchSubView('cust-trace');
        }
      });
    }

    this.$$('[data-demo-batch]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (input) input.value = btn.dataset.demoBatch;
        this.verifyBatch(btn.dataset.demoBatch);
      });
    });

    this.$('#show-qr-btn')?.addEventListener('click', () => {
      const curBatch = this.$('#batch-input')?.value || 'HC-KVIC-2026-NIL01';
      this.openQRModal(curBatch);
    });
  }

  verifyBatch(batchId) {
    const resultContainer = this.$('#trace-result');
    const quickResult = this.$('#verify-quick-result');
    const data = this.blockchain.findBatch(batchId);

    if (!data) {
      const notFoundHtml = `
        <div class="passport-container" style="border-color: #fecaca; background: #fff5f5;">
          <h4 style="color: #991b1b; margin-bottom: 8px;">❌ NO BLOCKCHAIN RECORD FOUND</h4>
          <p style="font-size: 0.9rem; color: #7f1d1d;">Batch ID "<strong>${batchId}</strong>" is not registered on the KVIC Honey Mission ledger. Beware of unverified or counterfeit jars.</p>
        </div>
      `;
      if (resultContainer) resultContainer.innerHTML = notFoundHtml;
      if (quickResult) quickResult.innerHTML = notFoundHtml;
      return;
    }

    const qrSvg = generateQRCodeSVG(data.batchId, 120);
    const validCheck = this.blockchain.isChainValid();
    const isTampered = !validCheck.isValid && (validCheck.faultyBlockIndex === data.blockIndex || data.harvest?.adulterated);

    if (quickResult) {
      quickResult.innerHTML = `
        <div style="padding: 18px 22px; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 16px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="passport-batch-id" style="font-size: 0.85rem;">${data.batchId}</span>
              <h4 style="font-size: 1.15rem; font-weight: 800; margin-top: 4px;">${data.harvest ? data.harvest.floraSource : 'Pure Honey'}</h4>
              <small style="color: #78716c;">Mined on Block #${data.blockIndex} · ${data.harvest?.cluster}</small>
            </div>
            <div>
              ${isTampered ? `
                <span class="passport-tag tampered">⚠️ INTEGRITY TAMPERED!</span>
              ` : `
                <span class="passport-tag">🛡️ BLOCKCHAIN VERIFIED</span>
              `}
            </div>
          </div>
          <div style="display: flex; gap: 14px; align-items: center; background: #fdfbf7; padding: 12px; border-radius: 12px; border: 1px solid #f3efe6;">
            <div>${generateQRCodeSVG(data.batchId, 72)}</div>
            <div style="font-size: 0.82rem; color: #57534e; display: flex; flex-direction: column; gap: 2px;">
              <span><strong>Beekeeper:</strong> ${data.harvest?.keeper || 'Registered Producer'}</span>
              <span><strong>NMR Test:</strong> <span style="color: #059669; font-weight: 700;">${data.labTest?.nmrProfile || 'Passed'}</span></span>
              <span><strong>Moisture:</strong> ${data.harvest?.rawMoisture} · <strong>Grade:</strong> ${data.labTest?.agmarkGrade}</span>
            </div>
          </div>
          <button class="button button-amber" style="width: 100%; justify-content: center; font-size: 0.85rem;" onclick="honeyApp.switchSubView('cust-trace')">
            📜 View Full Detailed Traceability Passport ↗
          </button>
        </div>
      `;
    }

    if (resultContainer) {
      resultContainer.innerHTML = `
        <div class="passport-container">
          <div class="passport-header">
            <div class="passport-batch-title">
              <span class="passport-batch-id">${data.batchId}</span>
              <h3>${data.harvest ? data.harvest.floraSource : 'Pure Indian Honey'}</h3>
              <small style="color: #78716c;">Mined on Block #${data.blockIndex} · ${new Date(data.timestamp).toLocaleDateString('en-IN')}</small>
            </div>
            <div>
              ${isTampered ? `
                <span class="passport-tag tampered">⚠️ INTEGRITY TAMPERED!</span>
              ` : `
                <span class="passport-tag">🛡️ BLOCKCHAIN VERIFIED</span>
              `}
            </div>
          </div>

          <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px; background: #ffffff; padding: 16px; border-radius: 14px; border: 1px solid #eee8df;">
            <div>${qrSvg}</div>
            <div>
              <h4 style="font-size: 1rem; margin-bottom: 4px;">KVIC Digital Honey Passport</h4>
              <p style="font-size: 0.8rem; color: #57534e;">Scan QR code with any smartphone camera to verify this batch directly on the decentralized ledger.</p>
              <button class="inline-pill" id="dl-cert-btn" style="margin-top: 8px;">📄 Download Certificate</button>
            </div>
          </div>

          <div class="passport-grid">
            <div class="passport-tile">
              <div class="passport-tile-label">Beekeeper / Producer</div>
              <div class="passport-tile-value">${data.harvest?.keeper || 'Registered Producer'}</div>
              <div class="passport-tile-sub">${data.harvest?.cooperative}</div>
              <div class="passport-tile-sub" style="font-family: var(--font-mono); color: var(--color-amber-800);">Box: ${data.harvest?.boxSerial}</div>
            </div>

            <div class="passport-tile">
              <div class="passport-tile-label">Flora & Geo-Location</div>
              <div class="passport-tile-value">${data.harvest?.cluster}</div>
              <div class="passport-tile-sub">GPS: ${data.harvest?.geoCoords}</div>
              <div class="passport-tile-sub">Floral: ${data.harvest?.floraSource}</div>
            </div>

            <div class="passport-tile">
              <div class="passport-tile-label">KVIC Lab NMR Sugar Test</div>
              <div class="passport-tile-value" style="color: #059669;">${data.labTest?.nmrProfile || 'Passed NMR'}</div>
              <div class="passport-tile-sub">Moisture: <strong>${data.harvest?.rawMoisture}</strong> (FSSAI Limit &lt; 20%)</div>
              <div class="passport-tile-sub">HMF Level: <strong>${data.labTest?.hmfLevel}</strong></div>
            </div>

            <div class="passport-tile">
              <div class="passport-tile-label">Agmark & Safety Stamp</div>
              <div class="passport-tile-value">${data.labTest?.agmarkGrade}</div>
              <div class="passport-tile-sub">Cert: ${data.labTest?.fssaiCertNo}</div>
              <div class="passport-tile-sub">Pollen: ${data.labTest?.pollenAuthenticity}</div>
            </div>
          </div>

          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 12px;">Immutable Chain-of-Custody</h4>
          <div class="journey-timeline">
            <div class="timeline-step">
              <div class="timeline-dot"></div>
              <div class="timeline-title">1. Hive Extraction at Source Apiary</div>
              <div class="timeline-meta">Date: ${data.harvest?.harvestDate} · Box ${data.harvest?.boxSerial} · ${data.harvest?.quantityKg} kg raw honey harvested</div>
            </div>
            <div class="timeline-step">
              <div class="timeline-dot"></div>
              <div class="timeline-title">2. KVIC Regional Lab Testing (Pune / Srinagar / Anand)</div>
              <div class="timeline-meta">Moisture ${data.labTest?.moisture} · ${data.labTest?.nmrProfile} · 0% Foreign Syrups</div>
            </div>
            <div class="timeline-step">
              <div class="timeline-dot"></div>
              <div class="timeline-title">3. Gentle Cold Extraction & Tamper-Evident Sealing</div>
              <div class="timeline-meta">Facility: ${data.packaging?.facility} · Seal: ${data.packaging?.tamperSealNumber}</div>
            </div>
          </div>

          <div class="crypto-proof-box">
            <div class="crypto-proof-row"><span class="crypto-proof-label">BLOCK HASH: </span>${data.blockHash}</div>
            <div class="crypto-proof-row"><span class="crypto-proof-label">PREV HASH:  </span>${data.previousHash}</div>
            <div class="crypto-proof-row"><span class="crypto-proof-label">MERKLE ROOT:</span>${data.merkleRoot}</div>
            <div class="crypto-proof-row"><span class="crypto-proof-label">CONSENSUS:  </span>PoA (Proof-of-Authority) · Nonce: ${data.nonce}</div>
          </div>
        </div>
      `;

      this.$('#dl-cert-btn')?.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // ==========================================
  // 2. IOT HIVE TELEMETRY MODULE
  // ==========================================
  initIoTModule() {
    const specCanvas = this.$('#spectrogram-canvas');
    if (specCanvas) {
      this.acousticVisualizer = new HiveAcousticVisualizer(specCanvas);
    }

    const tempCanvas = this.$('#temp-chart');
    if (tempCanvas) {
      this.tempChart = new SimpleTelemetryChart(tempCanvas, 'Internal Brood Temp', '#f59e0b', '°C');
    }

    const weightCanvas = this.$('#weight-chart');
    if (weightCanvas) {
      this.weightChart = new SimpleTelemetryChart(weightCanvas, 'Gross Hive Weight', '#10b981', 'kg');
    }

    this.iotSimulator.subscribe((state, history) => {
      this.updateIoTDashboardUI(state, history);
    });

    this.$$('.sim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.$$('.sim-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        this.iotSimulator.setMode(mode);
        this.toast(`Simulating hive condition: ${btn.textContent}`);
      });
    });
  }

  updateIoTDashboardUI(state, history) {
    const setVal = (id, val) => {
      const el = this.$(id);
      if (el) el.textContent = val;
    };

    setVal('#iot-temp-val', `${state.temperature}°C`);
    setVal('#iot-hum-val', `${state.humidity}%`);
    setVal('#iot-weight-val', `${state.weightKg} kg`);
    setVal('#iot-freq-val', `${state.acousticHz} Hz`);
    setVal('#iot-co2-val', `${state.co2Ppm} ppm`);
    setVal('#iot-battery-val', `${state.solarBattery}%`);
    setVal('#iot-queen-status', state.queenStatus);
    setVal('#iot-swarm-risk', `${state.swarmRiskScore}%`);

    const tempStatus = this.$('#iot-temp-status');
    if (tempStatus) {
      if (state.temperature > 37) {
        tempStatus.textContent = 'High Heat Stress';
        tempStatus.className = 'metric-status warning';
      } else if (state.temperature < 32) {
        tempStatus.textContent = 'Cooling Alert';
        tempStatus.className = 'metric-status warning';
      } else {
        tempStatus.textContent = 'Optimal Brood Range (32-35°C)';
        tempStatus.className = 'metric-status';
      }
    }

    if (this.acousticVisualizer) {
      this.acousticVisualizer.setFrequency(state.acousticHz);
    }
    if (this.tempChart) {
      this.tempChart.render(history.temperature, history.labels);
    }
    if (this.weightChart) {
      this.weightChart.render(history.weightKg, history.labels);
    }
  }

  // ==========================================
  // 3. AI DIAGNOSTICS & COMPUTER VISION LAB
  // ==========================================
  initAIModule() {
    const visionCanvas = this.$('#vision-canvas');
    if (visionCanvas) {
      this.visionDetector = new BeeVisionDetector(visionCanvas);
      this.selectAiSample('varroa');
    }

    this.$$('.ai-sample-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.$$('.ai-sample-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.selectAiSample(pill.dataset.sample);
      });
    });

    const fileInput = this.$('#ai-custom-file');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const diag = this.visionDetector.analyzeCustomImage(img);
              this.renderAiReportUI(diag);
              this.toast('Custom hive inspection image analyzed with AI');
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    this.$('#calc-yield-btn')?.addEventListener('click', () => {
      const boxCount = Number(this.$('#pred-box-count')?.value || 10);
      const floraType = this.$('#pred-flora')?.value || 'multiflora';
      const weightVel = Number(this.$('#pred-weight-vel')?.value || 0.6);

      const prediction = BeekeepingPredictiveEngine.estimateYield({
        boxCount,
        floraType,
        weightVelocityKgPerDay: weightVel
      });

      this.$('#pred-result-kg').textContent = `${prediction.estimatedYieldKg} kg`;
      this.$('#pred-result-date').textContent = prediction.optimalHarvestDate;
      this.$('#pred-result-val').textContent = prediction.estimatedFairPriceKvic;
      this.toast('ML Honey Harvest Forecast calculated');
    });
  }

  selectAiSample(typeKey) {
    if (!this.visionDetector) return;
    const diag = this.visionDetector.analyzeSample(typeKey);
    this.renderAiReportUI(diag);
  }

  renderAiReportUI(diag) {
    const repCard = this.$('#ai-report-content');
    if (!repCard) return;

    let threatClass = 'threat-moderate';
    if (diag.threatLevel.includes('CRITICAL') || diag.threatLevel.includes('HIGH')) threatClass = 'threat-high';
    if (diag.threatLevel.includes('THRIVING')) threatClass = 'threat-thriving';

    repCard.innerHTML = `
      <span class="diagnosis-pill ${threatClass}">${diag.threatLevel} · ${diag.confidence}% CONFIDENCE</span>
      <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 4px; color: #ffffff;">${diag.name}</h3>
      <p style="font-size: 0.85rem; color: #94a3b8; font-style: italic; margin-bottom: 16px;">${diag.scientificName}</p>

      <div style="margin-bottom: 16px;">
        <h5 style="color: #cbd5e1; font-size: 0.82rem; text-transform: uppercase; margin-bottom: 6px;">Identified Symptoms</h5>
        <ul style="padding-left: 18px; font-size: 0.85rem; color: #94a3b8;">
          ${diag.symptoms.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      <div class="remedy-box">
        <h5>KVIC Scientific Advisory & Treatment Protocol:</h5>
        <ul>
          ${diag.kvicRemedy.map(r => `<li>${r}</li>`).join('')}
        </ul>
        <div style="margin-top: 10px; font-size: 0.78rem; color: #fbbf24; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px;">
          ⚖️ <strong>Purity & Compliance Note:</strong> ${diag.fssaiImpact}
        </div>
      </div>
    `;
  }

  // ==========================================
  // 4. BEEKEEPER HARVEST LOGGING
  // ==========================================
  initKisanModule() {
    this.$('#kisan-harvest-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const keeper = this.$('#kisan-keeper-name').value;
      const box = this.$('#kisan-box-id').value;
      const flora = this.$('#kisan-flora').value;
      const weight = Number(this.$('#kisan-weight').value);
      const moisture = this.$('#kisan-moisture').value;
      const cluster = this.$('#kisan-cluster').value;

      const newBatchId = `HC-KVIC-2026-FARM${Math.floor(100 + Math.random() * 900)}`;

      const harvestData = {
        keeper,
        cooperative: cluster,
        cluster,
        boxSerial: box,
        geoCoords: '11.5120° N, 76.9040° E',
        floraSource: flora,
        harvestDate: new Date().toISOString().split('T')[0],
        quantityKg: weight,
        rawMoisture: `${moisture}%`
      };

      const defaultLab = {
        testingLab: 'KVIC Regional Honey Quality Testing Center',
        testedDate: new Date().toISOString().split('T')[0],
        nmrProfile: 'C4 Sugars: 0.5% (Passed), C3: 0.2% (Passed)',
        moisture: `${moisture}%`,
        hmfLevel: '10.5 mg/kg',
        pollenAuthenticity: '98.5% Authentic Natural Pollen',
        antibioticResidue: 'ND',
        fssaiCertNo: `FSSAI-${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
        agmarkGrade: 'Special Grade Pure Honey'
      };

      const defaultPack = {
        facility: 'KVIC Cooperative Cluster Bottling Facility',
        packagedDate: new Date().toISOString().split('T')[0],
        tamperSealNumber: `SEAL-${Math.floor(10000 + Math.random() * 90000)}`,
        temperatureControlled: true,
        coldExtracted: true
      };

      const txs = [
        new Transaction('HIVE_HARVEST', harvestData, 'BEEKEEPER-' + box),
        new Transaction('KVIC_LAB_TEST', defaultLab, 'OFFICER-KVIC-LAB'),
        new Transaction('PROCESSING_SEAL', defaultPack, 'SEAL-SUPERVISOR')
      ];

      const newBlock = this.blockchain.addBlock(newBatchId, txs);
      this.toast(`New batch ${newBatchId} registered on Blockchain (Block #${newBlock.index})!`);

      this.renderBeekeeperBatches();
      this.renderBeekeeperQR(newBatchId);
      // Switch to my batches
      this.switchSubView('bk-batches');
    });

    this.$$('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.$$('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.toast(`Language switched to: ${btn.textContent}`);
      });
    });
  }

  // ==========================================
  // 5. KVIC COOPERATIVE & LAB APPROVAL
  // ==========================================
  initKvicModule() {
    this.$('#kvic-lab-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const targetBatchId = this.$('#kvic-target-batch').value;
      const c4Sugar = this.$('#kvic-c4-val').value;
      const hmf = this.$('#kvic-hmf-val').value;
      const moisture = this.$('#kvic-moisture-val').value;

      const batch = this.blockchain.findBatch(targetBatchId);
      if (!batch) {
        this.toast('Batch not found to certify');
        return;
      }

      this.toast(`Lab parameters approved for ${targetBatchId}. Digital signature applied.`);
      this.switchSubView('kvic-blockchain');
    });
  }

  // ==========================================
  // 6. BLOCKCHAIN EXPLORER & TAMPER SANDBOX
  // ==========================================
  initBlockchainExplorer() {
    this.$('#tamper-btn')?.addEventListener('click', () => {
      const success = this.blockchain.tamperBlockData(1, '28.4% (Adulterated with C4 Sugar Syrup)');
      if (success) {
        this.renderBlockchainExplorer();
        this.toast('⚠️ Block #1 data was deliberately tampered with!');
      }
    });

    this.$('#restore-chain-btn')?.addEventListener('click', () => {
      this.blockchain.restoreChain();
      this.renderBlockchainExplorer();
      this.toast('🛡️ Blockchain restored to authentic genesis state.');
    });
  }

  renderBlockchainExplorer() {
    const list = this.$('#blockchain-block-list');
    const integrityBanner = this.$('#chain-integrity-banner');
    const listKvic = this.$('#blockchain-block-list-kvic');
    const integrityBannerKvic = this.$('#chain-integrity-banner-kvic');

    const integrity = this.blockchain.isChainValid();

    const bannerHtml = integrity.isValid ? `
      <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #10b981; padding: 14px 20px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.2rem;">🛡️</span>
          <div>
            <strong>DECENTRALIZED LEDGER INTEGRITY 100% VALID</strong>
            <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 2px;">All SHA-256 block hashes, previous block links, and Merkle tree roots match perfectly.</p>
          </div>
        </div>
        <span style="font-family: var(--font-mono); font-size: 0.8rem; background: #10b981; color: #0f172a; padding: 4px 10px; border-radius: 6px; font-weight: 700;">${this.blockchain.chain.length} BLOCKS MINED</span>
      </div>
    ` : `
      <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #ef4444; padding: 14px 20px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.4rem;">🚨</span>
          <div>
            <strong>TAMPER DETECTED! CHAIN INTEGRITY BREACHED</strong>
            <p style="font-size: 0.8rem; color: #fca5a5; margin-top: 2px;">${integrity.error}</p>
          </div>
        </div>
        <button class="inline-pill" id="restore-chain-inline" style="background: #ef4444; color: #ffffff; border: none;">Restore Chain</button>
      </div>
    `;

    if (integrityBanner) integrityBanner.innerHTML = bannerHtml;
    if (integrityBannerKvic) integrityBannerKvic.innerHTML = bannerHtml;

    this.$('#restore-chain-inline')?.addEventListener('click', () => {
      this.blockchain.restoreChain();
      this.renderBlockchainExplorer();
    });

    const blocksHtml = this.blockchain.chain.map(block => {
      const isFaulty = !integrity.isValid && integrity.faultyBlockIndex === block.index;

      return `
        <div class="block-card ${isFaulty ? 'tampered-block' : ''}">
          <div class="block-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="block-badge">BLOCK #${block.index}</span>
              <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--color-amber-400);">${block.batchId}</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--color-dark-muted); font-family: var(--font-mono);">
              ${new Date(block.timestamp).toLocaleString()} · Nonce: ${block.nonce}
            </div>
          </div>

          <div class="block-hashes">
            <div class="hash-line"><span>PREVIOUS HASH:</span><br><strong>${block.previousHash}</strong></div>
            <div class="hash-line"><span>BLOCK HASH (SHA-256):</span><br><strong>${block.hash}</strong></div>
            <div class="hash-line"><span>MERKLE ROOT:</span><br><strong>${block.merkleRoot}</strong></div>
            <div class="hash-line"><span>TRANSACTIONS:</span><br><strong style="color: #10b981;">${block.transactions.length} Verified Events</strong></div>
          </div>

          <div style="margin-top: 14px;">
            <h5 style="font-size: 0.75rem; color: var(--color-dark-muted); text-transform: uppercase; margin-bottom: 8px;">Block Transactions</h5>
            ${block.transactions.map(tx => `
              <div class="tx-item">
                <div class="tx-header">
                  <span>EVENT: ${tx.type}</span>
                  <span style="font-size: 0.7rem; color: var(--color-dark-muted);">Signer: ${tx.signer}</span>
                </div>
                <pre style="font-family: var(--font-mono); font-size: 0.75rem; color: #e2e8f0; overflow-x: auto; white-space: pre-wrap;">${JSON.stringify(tx.data, null, 2)}</pre>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    if (list) list.innerHTML = blocksHtml;
    if (listKvic) listKvic.innerHTML = blocksHtml;
  }

  // Cart operations
  addToCart(productId, qty = 1) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    const existing = this.cart.find(item => item.id === productId);
    if (existing) existing.quantity += qty;
    else this.cart.push({ id: productId, quantity: qty });
    
    this.saveCart();
    this.renderCart();
    this.toast(`Added ${product.name} to your bag`);
  }

  updateCartQuantity(productId, delta) {
    const itemIndex = this.cart.findIndex(i => i.id === productId);
    if (itemIndex === -1) return;

    this.cart[itemIndex].quantity += delta;
    const product = this.products.find(p => p.id === productId);

    if (this.cart[itemIndex].quantity <= 0) {
      this.cart.splice(itemIndex, 1);
      this.toast(`Removed ${product?.name || 'item'} from your bag`);
    } else {
      this.toast(`Updated quantity for ${product?.name || 'item'}`);
    }

    this.saveCart();
    this.renderCart();
  }

  removeFromCart(productId) {
    const itemIndex = this.cart.findIndex(i => i.id === productId);
    if (itemIndex === -1) return;
    const product = this.products.find(p => p.id === productId);
    this.cart.splice(itemIndex, 1);
    this.saveCart();
    this.renderCart();
    this.toast(`Removed ${product?.name || 'item'} from your bag`);
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.renderCart();
    this.toast('All items removed from your bag');
  }

  saveCart() {
    localStorage.setItem('honeychain_cart', JSON.stringify(this.cart));
  }

  initCartListeners() {
    const handleCartAction = (e) => {
      const addBtn = e.target.closest('[data-cart-add]');
      const minusBtn = e.target.closest('[data-cart-minus]');
      const removeBtn = e.target.closest('[data-cart-remove]');
      const clearBtn = e.target.closest('[data-cart-clear]');

      if (addBtn) {
        e.stopPropagation();
        this.updateCartQuantity(Number(addBtn.dataset.cartAdd), 1);
      } else if (minusBtn) {
        e.stopPropagation();
        this.updateCartQuantity(Number(minusBtn.dataset.cartMinus), -1);
      } else if (removeBtn) {
        e.stopPropagation();
        this.removeFromCart(Number(removeBtn.dataset.cartRemove));
      } else if (clearBtn) {
        e.stopPropagation();
        if (confirm('Clear all honey items from your bag?')) {
          this.clearCart();
        }
      }
    };

    const container = this.$('#cart-items');
    const pageItems = this.$('#cart-page-items');
    if (container) container.addEventListener('click', handleCartAction);
    if (pageItems) pageItems.addEventListener('click', handleCartAction);
  }

  async startCheckout() {
    if (!this.cart.length) {
      this.toast('Add at least one honey jar before checkout');
      return;
    }

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: this.cart })
      });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || 'Unable to start checkout');

      if (!window.Razorpay) throw new Error('Razorpay Checkout could not be loaded');

      const razorpay = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'HoneyChain',
        description: 'Verified KVIC honey order',
        order_id: order.id,
        prefill: {
          name: this.currentUser.name,
          email: this.currentUser.email
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        },
        theme: { color: '#d97706' },
        handler: (payment) => this.completeOrder(payment)
      });

      razorpay.on('payment.failed', (details) => {
        this.toast(details.error?.description || 'Payment failed. Please try again.');
      });
      razorpay.open();
    } catch (error) {
      this.toast(error.message);
    }
  }

  initOrders() {
    const saved = localStorage.getItem('honeychain_customer_orders');
    if (saved) {
      try {
        this.orders = JSON.parse(saved);
      } catch (e) {
        this.orders = [];
      }
    }
    if (!this.orders || !this.orders.length) {
      this.orders = [
        {
          orderId: 'HC-2026-8812',
          paymentId: 'pay_NILGIRI_8812',
          razorpayOrderId: 'order_NIL8812',
          date: '02 Sep 2026',
          timestamp: '2026-09-02T10:30:00.000Z',
          status: 'Delivered',
          statusClass: 'badge-delivered',
          statusNote: 'Delivered · Shipped via BlueDart Express',
          totalAmount: 680,
          customerName: 'Ananya Sharma',
          customerEmail: 'ananya@honeychain.kvic.in',
          items: [
            {
              id: 1,
              name: 'Nilgiri Wild Forest Multiflora',
              size: '500g',
              price: 680,
              quantity: 1,
              subtotal: 680,
              batchId: 'HC-KVIC-2026-NIL01',
              image: 'nilgiris-honey.jpg'
            }
          ]
        },
        {
          orderId: 'HC-2026-9041',
          paymentId: 'pay_KASHMIR_9041',
          razorpayOrderId: 'order_KSH9041',
          date: '10 Sep 2026',
          timestamp: '2026-09-10T14:15:00.000Z',
          status: 'In Transit',
          statusClass: 'badge-in_transit',
          statusNote: 'Dispatched from Srinagar Khadi Hub · Expected 14 Sep 2026',
          totalAmount: 820,
          customerName: 'Ananya Sharma',
          customerEmail: 'ananya@honeychain.kvic.in',
          items: [
            {
              id: 2,
              name: 'Kashmir White Acacia',
              size: '350g',
              price: 820,
              quantity: 1,
              subtotal: 820,
              batchId: 'HC-KVIC-2026-KSH02',
              image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=700&q=80'
            }
          ]
        }
      ];
      this.saveOrders();
    }
  }

  saveOrders() {
    try {
      localStorage.setItem('honeychain_customer_orders', JSON.stringify(this.orders));
    } catch (e) {
      console.warn('Could not save orders to localStorage', e);
    }
  }

  completeOrder(payment) {
    // 1. Capture ordered items snapshot before clearing cart
    const orderedItems = this.cart.map(item => {
      const p = (this.products || []).find(x => x.id === item.id) || {};
      return {
        id: item.id,
        name: p.name || 'Pure Indian Honey',
        size: p.size || '500g',
        price: p.price || 0,
        quantity: item.quantity,
        subtotal: (p.price || 0) * item.quantity,
        batchId: p.batchId || 'HC-KVIC-2026-NIL01',
        image: p.image || 'nilgiris-honey.jpg'
      };
    });

    const totalAmount = orderedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const now = new Date();
    const orderId = `HC-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      orderId,
      paymentId: payment.razorpay_payment_id || `pay_${Date.now()}`,
      razorpayOrderId: payment.razorpay_order_id || '',
      date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: now.toISOString(),
      status: 'Confirmed',
      statusClass: 'badge-confirmed',
      statusNote: 'Payment Verified · Direct allocation to KVIC tribal cooperative',
      totalAmount,
      customerName: this.currentUser?.name || 'Customer',
      customerEmail: this.currentUser?.email || 'customer@honeychain.kvic.in',
      customerPhone: this.currentUser?.phone || '+91 98401 23456',
      shippingAddress: this.currentUser?.deliveryAddress
        ? `${this.currentUser.deliveryAddress}, ${this.currentUser.location || ''} - ${this.currentUser.pincode || ''}`
        : (this.currentUser?.location || 'Registered Delivery Address'),
      items: orderedItems
    };

    // 2. Prepend order to user's order history
    if (!this.orders) this.orders = [];
    this.orders.unshift(newOrder);
    this.saveOrders();

    // 3. Clear cart and reset cart UI
    this.cart = [];
    this.saveCart();
    this.renderCart();
    this.toggleCart(false);

    // 4. Update the My Orders list and switch directly to Customer "My Orders" subview
    this.renderCustomerOrders();
    this.switchSubView('cust-orders');

    // 5. Success notification
    this.toast(`🎉 Payment successful! Order #${orderId} added to My Orders.`);
  }

  renderCustomerOrders() {
    const list = this.$('#cust-orders-list');
    if (!list) return;

    if (!this.orders || !this.orders.length) {
      list.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; color: #78716c; background: #fafaf9; border-radius: 16px; border: 1px dashed #e7e5e4;">
          <div style="font-size: 2.4rem; margin-bottom: 8px;">📦</div>
          <p style="font-weight: 800; color: #1c1917; font-size: 1.1rem; margin-bottom: 4px;">No Orders Yet</p>
          <p style="font-size: 0.85rem; color: #78716c; margin-bottom: 18px;">Orders placed in the Honey Shop will appear here with cryptographic batch tracking.</p>
          <button class="button button-amber" onclick="honeyApp.switchSubView('cust-shop')">Browse Honey Shop ↗</button>
        </div>
      `;
      return;
    }

    list.innerHTML = this.orders.map(order => {
      const statusClass = order.statusClass || (order.status === 'Delivered' ? 'badge-delivered' : order.status === 'In Transit' ? 'badge-in_transit' : 'badge-confirmed');
      const firstBatch = order.items?.[0]?.batchId || 'HC-KVIC-2026-NIL01';

      const itemsListHtml = (order.items || []).map(it => `
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #44403c; padding: 4px 0;">
          <div>
            <strong>${it.quantity}x</strong> ${it.name} (${it.size}) · 
            <span style="font-family: var(--font-mono); color: var(--color-amber-800); font-weight: 600;">${it.batchId}</span>
          </div>
          <div style="font-weight: 700; color: #1c1917;">₹${(it.subtotal || it.price * it.quantity || 0).toLocaleString('en-IN')}</div>
        </div>
      `).join('');

      return `
        <div class="order-card" style="margin-bottom: 18px;">
          <div class="order-info" style="flex: 1;">
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <strong style="font-size: 1.05rem;">Order #${order.orderId}</strong>
              <span class="order-badge ${statusClass}">● ${order.status}</span>
              <span style="font-size: 0.82rem; font-weight: 700; color: var(--color-amber-800); margin-left: auto;">Total: ₹${(order.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div style="margin: 8px 0; padding: 8px 12px; background: #fafaf9; border-radius: 8px; border: 1px solid #f5f5f4;">
              ${itemsListHtml}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 0.78rem; color: #78716c;">
              <span>${order.statusNote || 'Order verified via Razorpay'} · ${order.date}</span>
              ${order.paymentId ? `<span>Payment Ref: <code style="font-family: var(--font-mono); color: #0284c7;">${order.paymentId}</code></span>` : ''}
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-direction: column; justify-content: center; min-width: 170px;">
            <button class="inline-pill" onclick="honeyApp.verifyBatch('${firstBatch}'); honeyApp.switchSubView('cust-trace');" style="text-align: center; justify-content: center;">
              View Passport ↗
            </button>
            <button class="inline-pill" onclick="honeyApp.printOrderReceipt('${order.orderId}')" style="text-align: center; justify-content: center;">
              📄 Invoice & Cert
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  printOrderReceipt(orderId) {
    const order = (this.orders || []).find(o => o.orderId === orderId);
    if (!order) {
      window.print();
      return;
    }
    const modal = this.$('#qr-modal');
    const container = this.$('#qr-modal-content');
    if (modal && container) {
      container.innerHTML = `
        <div style="text-align: left; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f59e0b; padding-bottom: 12px; margin-bottom: 14px;">
            <div>
              <span class="kvic-badge-pill" style="font-size: 0.65rem;">🇮🇳 KVIC HONEY MISSION</span>
              <h3 style="margin-top: 6px; font-size: 1.2rem;">Authenticity Certificate & Invoice</h3>
            </div>
            <strong style="font-family: var(--font-mono); color: var(--color-amber-800);">${order.orderId}</strong>
          </div>
          <div style="font-size: 0.82rem; color: #57534e; margin-bottom: 12px; line-height: 1.5;">
            <div><strong>Customer:</strong> ${order.customerName} (${order.customerEmail})</div>
            <div><strong>Payment Ref:</strong> <code style="font-family: var(--font-mono); color: #0284c7;">${order.paymentId}</code></div>
            <div><strong>Date:</strong> ${order.date}</div>
            <div><strong>Status:</strong> <span class="order-badge ${order.statusClass || 'badge-confirmed'}">● ${order.status}</span></div>
          </div>
          <div style="border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px; margin-bottom: 14px; background: #fafaf9;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #78716c; margin-bottom: 6px;">PURCHASED BATCHES</div>
            ${(order.items || []).map(it => `
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; padding: 4px 0; border-bottom: 1px dashed #e7e5e4;">
                <span><strong>${it.quantity}x</strong> ${it.name} (${it.size})<br><small style="color: #78716c;">Batch: ${it.batchId}</small></span>
                <span style="font-weight: 700;">₹${(it.subtotal || it.price * it.quantity || 0).toLocaleString('en-IN')}</span>
              </div>
            `).join('')}
            <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 0.95rem; margin-top: 8px;">
              <span>Total Paid</span>
              <span style="color: var(--color-amber-800);">₹${(order.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div style="text-align: center; font-size: 0.75rem; color: #78716c; margin-bottom: 14px;">
            🛡️ Cryptographically signed & verified on HoneyChain Distributed Ledger.
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button class="button button-outline" style="padding: 8px 14px; font-size: 0.82rem;" onclick="window.print()">🖨️ Print</button>
            <button class="button button-dark" style="padding: 8px 14px; font-size: 0.82rem;" onclick="document.querySelector('#qr-modal').classList.remove('open')">Close</button>
          </div>
        </div>
      `;
      modal.classList.add('open');
      return;
    }
    window.print();
  }

  renderCart() {
    const count = this.cart.reduce((s, i) => s + i.quantity, 0);
    this.$$('.cart-count').forEach(el => el.textContent = count);

    const container = this.$('#cart-items');
    const pageItems = this.$('#cart-page-items');
    const pageTotal = this.$('#cart-page-total');

    if (!this.cart.length) {
      const emptyHtml = `
        <div style="text-align: center; padding: 40px 16px; color: #78716c;">
          <div style="font-size: 2.4rem; margin-bottom: 8px;">🍯</div>
          <p style="font-weight: 800; color: #1c1917; font-size: 1.1rem; margin-bottom: 4px;">Your Honey Bag is Empty</p>
          <p style="font-size: 0.85rem; color: #78716c; margin-bottom: 18px;">Explore pure single-origin Indian honey jars directly from rural beekeepers.</p>
          <button class="button button-amber" style="padding: 8px 18px; font-size: 0.85rem;" onclick="honeyApp.switchSubView('cust-shop'); honeyApp.toggleCart(false);">
            Browse Honey Shop ↗
          </button>
        </div>
      `;
      if (container) container.innerHTML = emptyHtml;
      this.$('#cart-total').textContent = '₹0';
      if (pageItems) pageItems.innerHTML = emptyHtml;
      if (pageTotal) pageTotal.textContent = '₹0';
      return;
    }

    let total = 0;
    const itemsHtml = this.cart.map(item => {
      const p = this.products.find(x => x.id === item.id);
      if (!p) return '';
      const subtotal = p.price * item.quantity;
      total += subtotal;
      return `
        <div class="cart-item-row">
          <img src="${p.image}" class="cart-item-img" alt="${p.name}">
          <div class="cart-item-details">
            <strong class="cart-item-title">${p.name}</strong>
            <span class="cart-item-meta">${p.size} · ₹${p.price} each · <span style="font-family: var(--font-mono); color: var(--color-amber-700);">${p.batchId}</span></span>
            <div class="cart-qty-stepper">
              <button class="cart-qty-btn" data-cart-minus="${item.id}" title="Decrease quantity">−</button>
              <span class="cart-qty-num">${item.quantity}</span>
              <button class="cart-qty-btn" data-cart-add="${item.id}" title="Increase quantity">+</button>
            </div>
          </div>
          <div class="cart-item-right">
            <span class="cart-item-price">₹${subtotal.toLocaleString('en-IN')}</span>
            <button class="cart-remove-btn" data-cart-remove="${item.id}" title="Remove item from bag">
              <span>🗑️</span> Remove
            </button>
          </div>
        </div>
      `;
    }).join('');

    const clearButtonHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0 12px; border-bottom: 1px dashed #e7e5e4; margin-bottom: 8px;">
        <span style="font-size: 0.8rem; color: #78716c;">${count} items in bag</span>
        <button class="cart-clear-btn" data-cart-clear>🗑️ Empty Bag</button>
      </div>
    `;

    if (container) container.innerHTML = clearButtonHtml + itemsHtml;
    this.$('#cart-total').textContent = `₹${total.toLocaleString('en-IN')}`;

    if (pageItems) pageItems.innerHTML = clearButtonHtml + itemsHtml;
    if (pageTotal) pageTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
  }

  toggleCart(open) {
    const modal = this.$('#cart-modal');
    if (!modal) return;
    modal.classList.toggle('open', open);
  }

  openQRModal(batchId) {
    const modal = this.$('#qr-modal');
    const container = this.$('#qr-modal-content');
    if (!modal || !container) return;
    container.innerHTML = `
      <div style="text-align: center;">
        <h3 style="margin-bottom: 8px;">Scan Batch QR Code</h3>
        <p style="font-size: 0.85rem; color: #57534e; margin-bottom: 18px;">Batch: <strong>${batchId}</strong></p>
        <div style="display: inline-block; padding: 16px; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 16px;">
          ${generateQRCodeSVG(batchId, 220)}
        </div>
        <p style="margin-top: 14px; font-size: 0.78rem; color: #78716c;">Verified on KVIC Honey Mission Blockchain Ledger</p>
        <button class="button button-dark" style="margin-top: 20px;" onclick="document.querySelector('#qr-modal').classList.remove('open')">Close</button>
      </div>
    `;
    modal.classList.add('open');
  }

  renderBeekeeperBatches() {
    const list = this.$('#bk-batches-list');
    if (!list || !this.blockchain) return;

    const batches = this.blockchain.chain
      .filter(b => b.batchId)
      .map(b => {
        const harvestTx = b.transactions.find(t => t.type === 'HIVE_HARVEST')?.data;
        const labTx = b.transactions.find(t => t.type === 'KVIC_LAB_TEST')?.data;
        return {
          batchId: b.batchId,
          index: b.index,
          flora: harvestTx?.floraSource || 'Pure Indian Honey',
          weight: harvestTx?.quantityKg || 120,
          moisture: harvestTx?.rawMoisture || '18.0%',
          box: harvestTx?.boxSerial || 'KVIC-BOX-4082',
          labStatus: labTx?.agmarkGrade || 'Agmark Special Grade'
        };
      });

    list.innerHTML = batches.map(b => `
      <div class="order-card" style="margin-bottom: 16px;">
        <div class="order-info">
          <strong style="font-size: 1.1rem; color: var(--color-amber-800);">Batch #${b.batchId}</strong>
          <p style="font-size: 0.85rem; color: #57534e;">${b.flora} · ${b.weight} kg · Moisture: ${b.moisture} · Box: ${b.box}</p>
          <small style="color: #059669; font-weight: 700;">✅ Certified on Block #${b.index} · ${b.labStatus}</small>
        </div>
        <button class="button button-dark" onclick="honeyApp.openQRModal('${b.batchId}')">📱 Generate QR</button>
      </div>
    `).join('');
  }

  renderBeekeeperQR(batchId = 'HC-KVIC-2026-NIL01') {
    const display = this.$('#bk-qr-display');
    const select = this.$('#bk-qr-select');

    if (select && this.blockchain) {
      const allBatches = this.blockchain.chain.filter(b => b.batchId).map(b => b.batchId);
      const uniqueBatches = [...new Set(['HC-KVIC-2026-NIL01', 'HC-KVIC-2026-KSH02', 'HC-KVIC-2026-SUN03', 'HC-KVIC-2026-CRG04', ...allBatches])];
      const prevVal = select.value || batchId;
      select.innerHTML = uniqueBatches.map(b => `<option value="${b}" ${b === prevVal ? 'selected' : ''}>${b}</option>`).join('');
      batchId = select.value || batchId;
    }

    if (!display) return;
    const batch = this.blockchain.findBatch(batchId);
    const flora = batch?.harvest?.floraSource || 'KVIC Pure Honey';

    display.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <span style="font-size: 0.75rem; font-weight: 800; color: #78350f; letter-spacing: 0.05em;">KVIC HONEY MISSION PASSPORT</span>
        ${generateQRCodeSVG(batchId, 180)}
        <strong style="font-family: var(--font-mono); font-size: 0.95rem; color: #1c1917;">${batchId}</strong>
        <span style="font-size: 0.8rem; color: #78716c;">${flora}</span>
        <span class="passport-tag" style="font-size: 0.7rem;">🛡️ SHA-256 VERIFIED</span>
      </div>
    `;
  }

}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.honeyApp = new HoneyChainApp();
});
