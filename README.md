# 🍯 HoneyChain: Blockchain-Based Honey Traceability & Smart Beekeeping System

> **Integrated IoT Hive Telemetry, AI Brood Diagnostics, and Cryptographic Batch Verification for KVIC Honey Mission**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Blockchain](https://img.shields.io/badge/Blockchain-SHA--256%20Ledger-blue.svg)]()
[![KVIC](https://img.shields.io/badge/Initiative-KVIC%20Honey%20Mission-orange.svg)]()
[![Institution](https://img.shields.io/badge/Kongu%20Engineering%20College-Batch%2009-red.svg)]()

---

## 📌 Project Overview

**HoneyChain** is an integrated Web3, IoT, and AI platform built to ensure end-to-end transparency, purity, and fair trade in the honey supply chain under the **KVIC Honey Mission (Khadi and Village Industries Commission)**.

By pairing **cryptographic blockchain batch records**, **smart IoT hive telemetry**, and **AI computer-vision brood diagnostics**, HoneyChain connects rural/tribal beekeepers directly to consumers while giving government quality officers a tamper-proof laboratory verification and certification gateway.

---

## ✨ Key Features

### 👤 1. Customer Honey Shop & Authenticity Verification
- **Pure Single-Origin Catalog**: Browse lab-tested honey varieties (Nilgiris Wildflower, Coorg Jamun & Coffee Blossom).
- **Interactive Shopping Bag**: Real-time quantity adjustments (+, −, 🗑️ Remove) and instant subtotal recalculations.
- **Dynamic QR Code Scanner**: Scan retail jar QR codes to view full chemical purity reports (NMR score, moisture content, HMF level) and harvest geolocation.
- **Traceability Timeline**: Visual farm-to-table journey from apiary box to retail shelf in under 2 seconds.

### 🐝 2. Beekeeper Portal (Kisan Smart Apiary)
- **IoT Smart Hive Telemetry**: Live sensor dashboards tracking brood temperature, internal humidity, comb weight, and acoustic frequency.
- **AI Colony Health Diagnostics**: Deep learning computer-vision model screening for *Varroa destructor* mites and American Foulbrood pathogens.
- **Harvest Batch Registration**: Digital logging of honey yield, floral nectar source, hive ID, and GPS coordinates.
- **Direct Market Access**: Eliminates predatory intermediaries, securing fair MSP settlements for rural apiculturists.

### 🏛️ 3. KVIC Quality Officer Console
- **Apiary & Cluster Monitoring**: Government oversight of regional beekeeping clusters.
- **Laboratory NMR Certification**: Enter and verify laboratory test parameters (moisture < 18%, C3/C4 sugar assay, NMR spectrum).
- **Digital Quality Sign-off**: Cryptographically sign and approve or reject honey batches before packaging.

### 👨‍💻 4. Blockchain & System Administration
- **SHA-256 Ledger Mining**: Cryptographic hash chaining and Merkle tree transaction proofs.
- **Tamper-Proof Audit Trail**: Immutably preserves harvest timestamps, tester signatures, and batch provenance.
- **Zero-Friction Consumer Access**: Operates seamlessly in standard web browsers without requiring cryptocurrency wallets or gas fees.

---

## 🏛️ System Architecture

`
┌─────────────────────────────────────────────────────────┐
│                 TIER 1: FARM & SENSORS                  │
│  • ESP32 Edge Controller     • DHT22 Temp & Humidity    │
│  • HX711 Weight Load Cell    • INMP441 Acoustic Sensor  │
│  • AI Brood CNN Model        • Beekeeper Harvest Portal │
└────────────────────────────┬────────────────────────────┘
                             │ (Harvest Geo-Tag & Batch ID)
                             ▼
┌─────────────────────────────────────────────────────────┐
│               TIER 2: QUALITY VERIFICATION              │
│  • KVIC Officer Console      • Field Inspection Audit   │
│  • Moisture Testing (< 18%)  • NMR Spectroscopy Assay   │
│  • Quality Score Calculation • Officer Digital Sign-off │
└────────────────────────────┬────────────────────────────┘
                             │ (Cryptographic Approval)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                TIER 3: BLOCKCHAIN CORE                  │
│  • Solidity Smart Contracts  • SHA-256 Hashing Engine   │
│  • Merkle Tree Cryptography  • Immutable State Ledger   │
│  • Decentralized Consensus   • Dynamic QR Passport Gen  │
└────────────────────────────┬────────────────────────────┘
                             │ (Tamper-Proof QR Code)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                TIER 4: CONSUMER PORTAL                  │
│  • Pure Honey Storefront     • Interactive Shopping Bag │
│  • Stepper Quantity Controls • Mobile Camera QR Scan    │
│  • Instant Provenance Audit  • Full Farm-to-Jar Journey │
└─────────────────────────────────────────────────────────┘
`

---

## 🛠️ Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Modern Responsive Flexbox/Grid), Vanilla JavaScript (ES6+), FontAwesome |
| **Backend** | Node.js (Zero-dependency HTTP server), Express.js RESTful architecture |
| **Blockchain** | SHA-256 Cryptographic Hash Engine, Merkle Tree Proofs, Solidity Smart Contracts |
| **AI / Diagnostics** | Python 3, TensorFlow / PyTorch (CNN models for bee disease diagnostics) |
| **IoT Telemetry** | ESP32 Microcontroller, DHT22 (Temp/Humidity), HX711 (Weight), INMP441 (Audio) |
| **Tools** | Visual Studio Code, Git/GitHub, Postman, Google Chrome / Microsoft Edge |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- Web Browser (Chrome, Edge, Firefox, or Safari)

### Installation & Launch

1. **Clone the Repository**:
   `ash
   git clone https://github.com/udishkrishna447/honeychain.git
   cd honeychain
   `

2. **Start the Server**:
   `ash
   node server.js
   `
   *(Or double-click start.bat on Windows)*
   
   For Razorpay test checkout, put `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the local `.env` file. The server loads them automatically when you run `npm start`.

3. **Open in Browser**:
   Open your browser and navigate to:
   `
   http://localhost:3000
   `

---

## 📂 Repository Structure

`
honeychain/
├── index.html                         # Unified web app (Customer, Beekeeper, KVIC Officer, Admin)
├── app.js                             # Interactive client logic, reactive cart stepper & QR scanner
├── style.css                          # Clean, modern, responsive stylesheet
├── blockchain.js                      # SHA-256 cryptographic batch registry & ledger simulation
├── server.js                          # Lightweight Node.js server with REST API & download routes
├── iot-telemetry.js                   # ESP32 smart hive telemetry simulator
├── ai-diagnostics.js                  # CNN brood disease diagnostic engine
├── HoneyChain_Presentation_KEC.pdf    # Full 11-slide KEC Review 1 Presentation (Vector PDF)
├── HoneyChain_Presentation_KEC.pptx   # Editable PowerPoint presentation matching KEC template
├── nilgiris-honey.jpg                 # High-resolution Nilgiris Wildflower honey image
├── coorg-honey.jpg                    # High-resolution Coorg Jamun & Coffee Blossom honey image
├── KVIC_DEPLOYMENT_FRAMEWORK.md       # Detailed KVIC deployment framework & rollout guide
├── package.json                       # Project metadata & npm scripts
├── start.bat                          # One-click Windows startup batch script
└── .gitignore                         # Git exclusion rules
`

---

## 🌍 UN Sustainable Development Goals (SDGs)

- **SDG 8 (Decent Work & Economic Growth)**: Provides rural and tribal beekeepers with direct market access, fair MSP pricing, and apiculture livelihoods.
- **SDG 9 (Industry, Innovation & Infrastructure)**: Bridges traditional agriculture and modern technology via IoT sensors, AI vision, and blockchain ledgers.
- **SDG 12 (Responsible Consumption & Production)**: Eliminates synthetic syrup adulteration through verifiable NMR lab purity records.
- **SDG 15 (Life on Land)**: Protects honeybee populations from colony collapse through early disease detection, vital for ecological pollination.

---

## 👥 Project Team & Academic Details

* **Institution**: Kongu Engineering College (KEC), Perundurai, Erode
* **Department**: Department of Information Technology
* **Project ID**: Batch 09 (25IT-MP-09)
* **Team Members**:
  1. **Sakeena Nivas S** — 25ITR122
  2. **Srinivasan S** — 25ITR141
  3. **Swetha S** — 25ITR152
  4. **Udishkrishna V** — 25ITR165
* **Project Guide**: Department of Information Technology, KEC

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
