const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/honeychain';
let client;
let dbInstance;

let productsCollection;
let customersCollection;
let beekeepersCollection;
let kvicOfficersCollection;
let adminOfficersCollection;
let honeyBatchesCollection;

if (mongoUri) {
  try {
    client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 3000 });
  } catch (err) {
    console.warn('⚠️ Invalid MONGODB_URI format, using catalog fallback:', err.message);
  }
}

// ----------------------------------------------------
// 1. PRODUCTS SEED
// ----------------------------------------------------
const seedProducts = [
  {
    id: 1,
    name: 'Nilgiri Wild Mountain Honey',
    origin: 'Mudumalai Forest, Nilgiris, Tamil Nadu',
    cluster: 'Nilgiris Adivasi Beekeeping Society',
    type: 'forest',
    note: 'Rare · Real · Raw · Limited Forest Harvest',
    price: 680,
    size: '500g',
    image: 'nilgiris-honey.jpg',
    batchId: 'HC-KVIC-2026-NIL01'
  },
  {
    id: 2,
    name: 'Kashmir White Acacia',
    origin: 'Pampore, Pulwama, Jammu & Kashmir',
    cluster: 'Kashmir Apicultural Federation',
    type: 'floral',
    note: 'Light Gold · Subtle Vanilla · Silky Clean',
    price: 820,
    size: '350g',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=700&q=80',
    batchId: 'HC-KVIC-2026-KSH02'
  },
  {
    id: 3,
    name: 'Sundarbans Wild Mangrove',
    origin: 'Gosaba, Sundarbans, West Bengal',
    cluster: 'Sundarbans Forest Beekeepers Union',
    type: 'forest',
    note: 'Rich Molasses · Khalsi Nectar · Pungent',
    price: 740,
    size: '350g',
    image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=700&q=80',
    batchId: 'HC-KVIC-2026-SUN03'
  },
  {
    id: 4,
    name: 'Coorg Jamun & Coffee Blossom',
    origin: 'Madikeri, Coorg, Karnataka',
    cluster: 'Kodagu District Beekeeping Cooperative',
    type: 'floral',
    note: 'Tart Berry · Coffee Flower · 100% Pure & Raw',
    price: 650,
    size: '500g',
    image: 'coorg-honey.jpg',
    batchId: 'HC-KVIC-2026-CRG04'
  }
];

// ----------------------------------------------------
// 2. BEEKEEPERS SEED (Total: 48 | Verified: 42, Pending: 6)
// ----------------------------------------------------
function generateSeedBeekeepers() {
  const primary = [
    {
      beekeeperId: 'BK001',
      name: 'Kumar',
      phone: '+91 98421 11001',
      email: 'kumar@erodehoney.in',
      location: 'Erode',
      farmName: 'Kumar Honey Farm',
      honeyType: 'Natural Forest Honey',
      batchId: 'HC2026-001',
      harvestDate: '05-09-2026',
      verificationStatus: 'Verified',
      hiveCount: 25,
      rawMoisture: '17.5%',
      createdAt: '2026-08-10T10:00:00.000Z'
    },
    {
      beekeeperId: 'BK002',
      name: 'Raj',
      phone: '+91 94432 22002',
      email: 'raj@nilgiribees.org',
      location: 'Kotagiri, Nilgiris',
      farmName: 'Raj Bee Farm',
      honeyType: 'Nilgiri Wild Mountain Honey',
      batchId: 'HC2026-002',
      harvestDate: '12-09-2026',
      verificationStatus: 'Verified',
      hiveCount: 30,
      rawMoisture: '17.8%',
      createdAt: '2026-08-12T11:30:00.000Z'
    },
    {
      beekeeperId: 'BK003',
      name: 'Birendra Mondal',
      phone: '+91 97331 33003',
      email: 'birendra@mouley.org',
      location: 'Gosaba, Sundarbans',
      farmName: 'Natural Honey Farm',
      honeyType: 'Sundarbans Wild Mangrove Honey',
      batchId: 'HC2026-003',
      harvestDate: '18-09-2026',
      verificationStatus: 'Verified',
      hiveCount: 18,
      rawMoisture: '18.2%',
      createdAt: '2026-08-15T09:15:00.000Z'
    },
    {
      beekeeperId: 'BK004',
      name: 'Ghulam Mohammad Bhat',
      phone: '+91 94190 44004',
      email: 'ghulam@kashmirapiary.com',
      location: 'Pampore, Pulwama',
      farmName: 'Himalayan Pure Apiaries',
      honeyType: 'Kashmir White Acacia Honey',
      batchId: 'HC2026-004',
      harvestDate: '24-09-2026',
      verificationStatus: 'Verified',
      hiveCount: 40,
      rawMoisture: '16.9%',
      createdAt: '2026-08-18T14:20:00.000Z'
    },
    {
      beekeeperId: 'BK005',
      name: 'Muthuswamy V.',
      phone: '+91 98840 55005',
      email: 'muthu@coorgcoop.org',
      location: 'Madikeri, Coorg',
      farmName: 'Coorg Hill Blossom Farm',
      honeyType: 'Jamun & Coffee Blossom Honey',
      batchId: 'HC2026-005',
      harvestDate: '28-09-2026',
      verificationStatus: 'Verified',
      hiveCount: 22,
      rawMoisture: '17.4%',
      createdAt: '2026-08-20T16:00:00.000Z'
    },
    {
      beekeeperId: 'BK006',
      name: 'Ramesh Patel',
      phone: '+91 98250 66006',
      email: 'ramesh@girforesthoney.in',
      location: 'Junagadh, Gujarat',
      farmName: 'Gir Girnar Bee Sanstha',
      honeyType: 'Organic Sesame & Mustard Honey',
      batchId: 'HC2026-006',
      harvestDate: '02-10-2026',
      verificationStatus: 'Pending',
      hiveCount: 15,
      rawMoisture: '18.9%',
      createdAt: '2026-09-25T10:00:00.000Z'
    },
    {
      beekeeperId: 'BK007',
      name: 'Anand Singh',
      phone: '+91 94560 77007',
      email: 'anand@kumaonhoney.org',
      location: 'Nainital, Uttarakhand',
      farmName: 'Kumaon Valley Hives',
      honeyType: 'Himalayan Multiflora Honey',
      batchId: 'HC2026-007',
      harvestDate: '04-10-2026',
      verificationStatus: 'Pending',
      hiveCount: 12,
      rawMoisture: '19.1%',
      createdAt: '2026-09-28T12:00:00.000Z'
    }
  ];

  const locations = ['Salem', 'Dindigul', 'Wayanad', 'Shimoga', 'Solan', 'Kangra', 'Ranchi', 'Guntur', 'Kurnool', 'Hassan'];
  const types = ['Raw Multi-flora Honey', 'Eucalyptus Blossom Honey', 'Tulsi & Herbal Nectar', 'Neem Flower Honey', 'Mustard Blossom Honey'];
  
  const list = [...primary];
  for (let i = 8; i <= 48; i++) {
    const id = `BK${String(i).padStart(3, '0')}`;
    const loc = locations[(i - 8) % locations.length];
    const isPending = [14, 21, 29, 36].includes(i); // Total pending: 2 from primary + 4 here = 6
    list.push({
      beekeeperId: id,
      name: `Kisan Saathi ${i}`,
      phone: `+91 98${i}00 ${1000 + i}`,
      email: `beekeeper${i}@kvichoney.in`,
      location: loc,
      farmName: `${loc} Kisan Cooperative #${i}`,
      honeyType: types[(i - 8) % types.length],
      batchId: `HC2026-${String(i).padStart(3, '0')}`,
      harvestDate: `2026-09-${String((i % 25) + 1).padStart(2, '0')}`,
      verificationStatus: isPending ? 'Pending' : 'Verified',
      hiveCount: 10 + (i % 20),
      rawMoisture: `${(17.0 + (i % 25) * 0.1).toFixed(1)}%`,
      createdAt: `2026-08-${String((i % 28) + 1).padStart(2, '0')}T08:00:00.000Z`
    });
  }
  return list;
}

// ----------------------------------------------------
// 3. CUSTOMERS SEED (Total: 125 | Verified: 110, Pending: 15)
// ----------------------------------------------------
function generateSeedCustomers() {
  const primary = [
    {
      customerId: 'CUST001',
      name: 'Ananya Sharma',
      phone: '+91 98101 23456',
      email: 'ananya.sharma@gmail.com',
      location: 'Bengaluru, Karnataka',
      verificationStatus: 'Verified',
      totalOrders: 4,
      totalSpent: 2840,
      createdAt: '2026-07-15T10:00:00.000Z'
    },
    {
      customerId: 'CUST002',
      name: 'Dr. Arvind Menon',
      phone: '+91 98202 34567',
      email: 'arvind.menon@aiims.edu',
      location: 'Chennai, Tamil Nadu',
      verificationStatus: 'Verified',
      totalOrders: 6,
      totalSpent: 4920,
      createdAt: '2026-07-20T12:00:00.000Z'
    },
    {
      customerId: 'CUST003',
      name: 'Priya Nambiar',
      phone: '+91 98303 45678',
      email: 'priya.nambiar@outlook.com',
      location: 'Kochi, Kerala',
      verificationStatus: 'Verified',
      totalOrders: 2,
      totalSpent: 1420,
      createdAt: '2026-08-01T14:30:00.000Z'
    },
    {
      customerId: 'CUST004',
      name: 'Vikram Rathore',
      phone: '+91 98404 56789',
      email: 'vikram.rathore@tcs.com',
      location: 'Mumbai, Maharashtra',
      verificationStatus: 'Pending',
      totalOrders: 1,
      totalSpent: 680,
      createdAt: '2026-09-10T16:00:00.000Z'
    }
  ];

  const cities = ['Hyderabad', 'Pune', 'New Delhi', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Coimbatore', 'Mysuru', 'Chandigarh', 'Indore'];
  const list = [...primary];
  for (let i = 5; i <= 125; i++) {
    const id = `CUST${String(i).padStart(3, '0')}`;
    const city = cities[i % cities.length];
    // We want 15 pending total. Primary has 1, so 14 more in the loop:
    const isPending = [10, 18, 26, 35, 44, 53, 62, 71, 80, 89, 98, 107, 116, 123].includes(i);
    list.push({
      customerId: id,
      name: `Honey Club Consumer ${i}`,
      phone: `+91 99${String(i).padStart(3, '0')} ${1234 + i}`,
      email: `customer${i}@honeychain.kvic.in`,
      location: `${city}`,
      verificationStatus: isPending ? 'Pending' : 'Verified',
      totalOrders: (i % 5) + 1,
      totalSpent: ((i % 5) + 1) * 720,
      createdAt: `2026-08-${String((i % 28) + 1).padStart(2, '0')}T09:00:00.000Z`
    });
  }
  return list;
}

// ----------------------------------------------------
// 4. KVIC OFFICERS SEED (Total: 8 | Active: 7, Inactive: 1)
// ----------------------------------------------------
const seedKvicOfficers = [
  {
    officerId: 'KVIC001',
    name: 'Dr. S. K. Narayanan',
    designation: 'Director of Quality & NMR Testing',
    location: 'KVIC Central Testing Lab, Pune',
    email: 'sk.narayanan@kvic.gov.in',
    status: 'Active',
    certifiedBatches: 214,
    phone: '+91 20 2567 8901',
    createdAt: '2026-01-10T10:00:00.000Z'
  },
  {
    officerId: 'KVIC002',
    name: 'Meenakshi Sundaram',
    designation: 'State Apiculture Supervisor',
    location: 'KVIC State Office, Madurai, Tamil Nadu',
    email: 'meenakshi.s@kvic.gov.in',
    status: 'Active',
    certifiedBatches: 148,
    phone: '+91 452 245 6789',
    createdAt: '2026-02-15T11:00:00.000Z'
  },
  {
    officerId: 'KVIC003',
    name: 'Tariq Ahmad Mir',
    designation: 'Regional Quality Auditor',
    location: 'Srinagar Khadi Centre, J&K',
    email: 'tariq.mir@kvic.gov.in',
    status: 'Active',
    certifiedBatches: 96,
    phone: '+91 194 249 1234',
    createdAt: '2026-03-01T12:00:00.000Z'
  },
  {
    officerId: 'KVIC004',
    name: 'Dr. Tapas Sengupta',
    designation: 'Sundarbans Tribal Cluster Lead',
    location: 'KVIC Regional Office, Kolkata',
    email: 't.sengupta@kvic.gov.in',
    status: 'Active',
    certifiedBatches: 112,
    phone: '+91 33 2287 4567',
    createdAt: '2026-03-20T10:30:00.000Z'
  },
  {
    officerId: 'KVIC005',
    name: 'Rajeshree Jadhav',
    designation: 'Senior Analytical Chemist',
    location: 'KVIC Regional Quality Lab, Mumbai',
    email: 'r.jadhav@kvic.gov.in',
    status: 'Active',
    certifiedBatches: 87,
    phone: '+91 22 2671 9988',
    createdAt: '2026-04-10T14:00:00.000Z'
  },
  {
    officerId: 'KVIC006',
    name: 'Harishankar Sharma',
    designation: 'Field Training Coordinator',
    location: 'Dehradun Bee Research Centre',
    email: 'hs.sharma@kvic.gov.in',
    status: 'Active',
    certifiedBatches: 64,
    phone: '+91 135 274 5544',
    createdAt: '2026-05-12T09:30:00.000Z'
  },
  {
    officerId: 'KVIC007',
    name: 'Dr. C. R. Patil',
    designation: 'National Honey Mission Lead',
    location: 'KVIC Headquarters, New Delhi',
    email: 'cr.patil@kvic.gov.in',
    status: 'Active',
    certifiedBatches: 175,
    phone: '+91 11 2341 5566',
    createdAt: '2026-01-05T08:00:00.000Z'
  },
  {
    officerId: 'KVIC008',
    name: 'Vineet Saxena',
    designation: 'Cluster Field Inspector (On Leave)',
    location: 'KVIC Bhopal Regional Unit, MP',
    email: 'vineet.s@kvic.gov.in',
    status: 'Inactive',
    certifiedBatches: 38,
    phone: '+91 755 255 1212',
    createdAt: '2026-06-01T10:00:00.000Z'
  }
];

// ----------------------------------------------------
// 5. ADMIN OFFICERS SEED (Total: 3 | Active: 3)
// ----------------------------------------------------
const seedAdminOfficers = [
  {
    adminId: 'ADM001',
    name: 'National Mission Administrator',
    role: 'Super Administrator',
    designation: 'Chief Information Officer (CIO)',
    email: 'admin@honeychain.kvic.in',
    status: 'Active',
    lastLogin: 'Just now',
    permissions: 'Full Root Access · Blockchain Config · Node Management',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    adminId: 'ADM002',
    name: 'Apiculture Security Lead',
    role: 'Security Officer',
    designation: 'Cryptographic Ledger Auditor',
    email: 'security@honeychain.kvic.in',
    status: 'Active',
    lastLogin: '1 hour ago',
    permissions: 'Smart Contract Audit · Merkle Root Validator',
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    adminId: 'ADM003',
    name: 'National Database Controller',
    role: 'Database Administrator',
    designation: 'MongoDB Grid Master',
    email: 'dbadmin@honeychain.kvic.in',
    status: 'Active',
    lastLogin: '3 hours ago',
    permissions: 'NoSQL Collection Management · Real-time Socket Sync',
    createdAt: '2026-02-01T00:00:00.000Z'
  }
];

// ----------------------------------------------------
// 6. HONEY BATCHES SEED
// ----------------------------------------------------
const seedHoneyBatches = [
  {
    batchId: 'HC2026-001',
    farmName: 'Kumar Honey Farm',
    beekeeperName: 'Kumar',
    location: 'Erode',
    honeyType: 'Natural Forest Honey',
    quantityKg: 150,
    moisturePercent: '17.5%',
    status: 'Verified',
    certifiedLab: 'KVIC Central Testing Lab, Pune',
    labReportNo: 'NMR-KVIC-ERD-2026-8812',
    harvestDate: '05-09-2026',
    createdAt: '2026-09-06T10:00:00.000Z'
  },
  {
    batchId: 'HC2026-002',
    farmName: 'Raj Bee Farm',
    beekeeperName: 'Raj',
    location: 'Kotagiri, Nilgiris',
    honeyType: 'Nilgiri Wild Mountain Honey',
    quantityKg: 120,
    moisturePercent: '17.8%',
    status: 'Verified',
    certifiedLab: 'KVIC Central Honey Testing Lab, Pune',
    labReportNo: 'NMR-KVIC-NIL-2026-9041',
    harvestDate: '12-09-2026',
    createdAt: '2026-09-13T12:00:00.000Z'
  },
  {
    batchId: 'HC2026-003',
    farmName: 'Natural Honey Farm',
    beekeeperName: 'Birendra Mondal',
    location: 'Gosaba, Sundarbans',
    honeyType: 'Sundarbans Wild Mangrove Honey',
    quantityKg: 95,
    moisturePercent: '18.2%',
    status: 'Verified',
    certifiedLab: 'KVIC Regional Office Lab, Kolkata',
    labReportNo: 'NMR-KVIC-SUN-2026-4411',
    harvestDate: '18-09-2026',
    createdAt: '2026-09-19T09:00:00.000Z'
  },
  {
    batchId: 'HC2026-004',
    farmName: 'Himalayan Pure Apiaries',
    beekeeperName: 'Ghulam Mohammad Bhat',
    location: 'Pampore, Pulwama',
    honeyType: 'Kashmir White Acacia Honey',
    quantityKg: 85,
    moisturePercent: '16.9%',
    status: 'Verified',
    certifiedLab: 'KVIC Regional Quality Lab, Srinagar',
    labReportNo: 'NMR-KVIC-KSH-2026-5522',
    harvestDate: '24-09-2026',
    createdAt: '2026-09-25T14:00:00.000Z'
  },
  {
    batchId: 'HC2026-005',
    farmName: 'Coorg Hill Blossom Farm',
    beekeeperName: 'Muthuswamy V.',
    location: 'Madikeri, Coorg',
    honeyType: 'Jamun & Coffee Blossom Honey',
    quantityKg: 110,
    moisturePercent: '17.4%',
    status: 'Verified',
    certifiedLab: 'KVIC Regional Testing Centre, Mysuru',
    labReportNo: 'NMR-KVIC-CRG-2026-7733',
    harvestDate: '28-09-2026',
    createdAt: '2026-09-29T11:00:00.000Z'
  },
  {
    batchId: 'HC2026-006',
    farmName: 'Gir Girnar Bee Sanstha',
    beekeeperName: 'Ramesh Patel',
    location: 'Junagadh, Gujarat',
    honeyType: 'Organic Sesame & Mustard Honey',
    quantityKg: 80,
    moisturePercent: '18.9%',
    status: 'Pending',
    certifiedLab: 'Awaiting Final NMR Spectrometry',
    labReportNo: 'PENDING-QC-6601',
    harvestDate: '02-10-2026',
    createdAt: '2026-10-02T16:00:00.000Z'
  }
];

// Fallback in-memory copies for zero-crash guarantee
let inMemoryBeekeepers = generateSeedBeekeepers();
let inMemoryCustomers = generateSeedCustomers();
let inMemoryKvicOfficers = [...seedKvicOfficers];
let inMemoryAdminOfficers = [...seedAdminOfficers];
let inMemoryHoneyBatches = [...seedHoneyBatches];

// ----------------------------------------------------
// DATABASE INITIALIZATION & AUTO-SEEDING
// ----------------------------------------------------
async function initializeDatabase() {
  if (!client || !mongoUri) {
    console.log('🍃 MongoDB: Running in In-Memory/Fallback Mode (MONGODB_URI not set)');
    return;
  }
  try {
    await client.connect();
    const parsedPath = new URL(mongoUri.startsWith('mongodb') ? mongoUri : `mongodb://${mongoUri}`).pathname.replace(/^\//, '');
    const databaseName = parsedPath || 'honeychain';
    dbInstance = client.db(databaseName);

    // Initialize all 6 collections
    productsCollection = dbInstance.collection('products');
    customersCollection = dbInstance.collection('customers');
    beekeepersCollection = dbInstance.collection('beekeepers');
    kvicOfficersCollection = dbInstance.collection('kvic_officers');
    adminOfficersCollection = dbInstance.collection('admin_officers');
    honeyBatchesCollection = dbInstance.collection('honey_batches');

    // Indexing
    await productsCollection.createIndex({ id: 1 }, { unique: true });
    await beekeepersCollection.createIndex({ beekeeperId: 1 }, { unique: true });
    await customersCollection.createIndex({ customerId: 1 }, { unique: true });
    await kvicOfficersCollection.createIndex({ officerId: 1 }, { unique: true });
    await adminOfficersCollection.createIndex({ adminId: 1 }, { unique: true });
    await honeyBatchesCollection.createIndex({ batchId: 1 }, { unique: true });

    // Seed Products
    if (await productsCollection.countDocuments() === 0) {
      await productsCollection.insertMany(seedProducts);
      console.log(`🍃 MongoDB: Seeded ${seedProducts.length} products`);
    }

    // Seed Beekeepers (Kumar, Raj, Sundar, etc.)
    if (await beekeepersCollection.countDocuments() === 0) {
      await beekeepersCollection.insertMany(inMemoryBeekeepers);
      console.log(`🍃 MongoDB: Seeded ${inMemoryBeekeepers.length} beekeepers (Kumar, Raj, etc.)`);
    }

    // Seed Customers (125 total)
    if (await customersCollection.countDocuments() === 0) {
      await customersCollection.insertMany(inMemoryCustomers);
      console.log(`🍃 MongoDB: Seeded ${inMemoryCustomers.length} customers`);
    }

    // Seed KVIC Officers (8 total)
    if (await kvicOfficersCollection.countDocuments() === 0) {
      await kvicOfficersCollection.insertMany(seedKvicOfficers);
      console.log(`🍃 MongoDB: Seeded ${seedKvicOfficers.length} KVIC officers`);
    }

    // Seed Admin Officers (3 total)
    if (await adminOfficersCollection.countDocuments() === 0) {
      await adminOfficersCollection.insertMany(seedAdminOfficers);
      console.log(`🍃 MongoDB: Seeded ${seedAdminOfficers.length} Admin officers`);
    }

    // Seed Honey Batches
    if (await honeyBatchesCollection.countDocuments() === 0) {
      await honeyBatchesCollection.insertMany(seedHoneyBatches);
      console.log(`🍃 MongoDB: Seeded ${seedHoneyBatches.length} honey batches`);
    }

    console.log(`🍃 MongoDB: Real-time collections ready in database [${databaseName}]`);
  } catch (err) {
    console.warn(`⚠️ MongoDB connection attempt failed (${err.message}). Using resilient in-memory fallback.`);
    productsCollection = null;
    customersCollection = null;
    beekeepersCollection = null;
    kvicOfficersCollection = null;
    adminOfficersCollection = null;
    honeyBatchesCollection = null;
  }
}

// ----------------------------------------------------
// QUERY HELPERS
// ----------------------------------------------------

async function getProducts() {
  if (productsCollection) {
    try {
      return await productsCollection.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray();
    } catch (e) {
      console.warn('MongoDB query failed, using fallback:', e.message);
    }
  }
  return seedProducts;
}

async function getProductsByIds(ids) {
  if (productsCollection) {
    try {
      return await productsCollection.find({ id: { $in: ids } }, { projection: { _id: 0 } }).toArray();
    } catch (e) {
      console.warn('MongoDB query failed, using fallback:', e.message);
    }
  }
  return seedProducts.filter(product => ids.includes(product.id));
}

// DASHBOARD KPI STATS
async function getDashboardStats() {
  if (customersCollection && beekeepersCollection && kvicOfficersCollection && adminOfficersCollection && honeyBatchesCollection) {
    try {
      const [
        totalCustomers,
        verifiedCustomers,
        totalBeekeepers,
        verifiedBeekeepers,
        totalOfficers,
        activeOfficers,
        totalAdmins,
        activeAdmins,
        totalBatches
      ] = await Promise.all([
        customersCollection.countDocuments(),
        customersCollection.countDocuments({ verificationStatus: 'Verified' }),
        beekeepersCollection.countDocuments(),
        beekeepersCollection.countDocuments({ verificationStatus: 'Verified' }),
        kvicOfficersCollection.countDocuments(),
        kvicOfficersCollection.countDocuments({ status: 'Active' }),
        adminOfficersCollection.countDocuments(),
        adminOfficersCollection.countDocuments({ status: 'Active' }),
        honeyBatchesCollection.countDocuments()
      ]);

      return {
        database: 'mongodb',
        connected: true,
        customers: {
          total: totalCustomers,
          verified: verifiedCustomers,
          pending: totalCustomers - verifiedCustomers
        },
        beekeepers: {
          total: totalBeekeepers,
          verified: verifiedBeekeepers,
          pending: totalBeekeepers - verifiedBeekeepers
        },
        kvicOfficers: {
          total: totalOfficers,
          active: activeOfficers,
          inactive: totalOfficers - activeOfficers
        },
        adminOfficers: {
          total: totalAdmins,
          active: activeAdmins,
          inactive: totalAdmins - activeAdmins
        },
        honeyBatches: {
          total: totalBatches
        }
      };
    } catch (e) {
      console.warn('MongoDB stats count error:', e.message);
    }
  }

  // Fallback calculations
  const totalCust = inMemoryCustomers.length;
  const verCust = inMemoryCustomers.filter(c => c.verificationStatus === 'Verified').length;
  const totalBk = inMemoryBeekeepers.length;
  const verBk = inMemoryBeekeepers.filter(b => b.verificationStatus === 'Verified').length;
  const totalOff = inMemoryKvicOfficers.length;
  const actOff = inMemoryKvicOfficers.filter(o => o.status === 'Active').length;
  const totalAdm = inMemoryAdminOfficers.length;
  const actAdm = inMemoryAdminOfficers.filter(a => a.status === 'Active').length;

  return {
    database: 'in-memory-fallback',
    connected: false,
    customers: {
      total: totalCust,
      verified: verCust,
      pending: totalCust - verCust
    },
    beekeepers: {
      total: totalBk,
      verified: verBk,
      pending: totalBk - verBk
    },
    kvicOfficers: {
      total: totalOff,
      active: actOff,
      inactive: totalOff - actOff
    },
    adminOfficers: {
      total: totalAdm,
      active: actAdm,
      inactive: totalAdm - actAdm
    },
    honeyBatches: {
      total: inMemoryHoneyBatches.length
    }
  };
}

// BEEKEEPERS
async function getBeekeepers(query = {}) {
  if (beekeepersCollection) {
    try {
      return await beekeepersCollection.find(query, { projection: { _id: 0 } }).sort({ beekeeperId: 1 }).toArray();
    } catch (e) {
      console.warn('MongoDB beekeepers query error:', e.message);
    }
  }
  return inMemoryBeekeepers;
}

async function addBeekeeper(data) {
  const beekeeperId = data.beekeeperId || `BK${String(Date.now()).slice(-4)}`;
  const record = {
    beekeeperId,
    name: data.name || 'Unnamed Beekeeper',
    phone: data.phone || '+91 98000 00000',
    email: data.email || 'beekeeper@kvichoney.in',
    location: data.location || 'Tamil Nadu',
    farmName: data.farmName || `${data.name || 'Local'} Honey Farm`,
    honeyType: data.honeyType || 'Natural Forest Honey',
    batchId: data.batchId || `HC2026-${String(Math.floor(100 + Math.random() * 900))}`,
    harvestDate: data.harvestDate || new Date().toISOString().split('T')[0],
    verificationStatus: data.verificationStatus || 'Verified',
    hiveCount: Number(data.hiveCount) || 10,
    rawMoisture: data.rawMoisture || '18.0%',
    createdAt: new Date().toISOString()
  };

  inMemoryBeekeepers.unshift(record);
  if (beekeepersCollection) {
    try {
      await beekeepersCollection.insertOne({ ...record });
    } catch (e) {
      console.warn('MongoDB insert beekeeper error:', e.message);
    }
  }
  return record;
}

// CUSTOMERS
async function getCustomers(limit = 100) {
  if (customersCollection) {
    try {
      return await customersCollection.find({}, { projection: { _id: 0 } }).sort({ customerId: 1 }).limit(limit).toArray();
    } catch (e) {
      console.warn('MongoDB customers query error:', e.message);
    }
  }
  return inMemoryCustomers.slice(0, limit);
}

async function addCustomer(data) {
  const customerId = data.customerId || `CUST${String(Date.now()).slice(-4)}`;
  const record = {
    customerId,
    name: data.name || 'Customer',
    phone: data.phone || '+91 99000 00000',
    email: data.email || 'customer@honeychain.kvic.in',
    location: data.location || 'India',
    verificationStatus: data.verificationStatus || 'Verified',
    totalOrders: Number(data.totalOrders) || 1,
    totalSpent: Number(data.totalSpent) || 680,
    createdAt: new Date().toISOString()
  };

  inMemoryCustomers.unshift(record);
  if (customersCollection) {
    try {
      await customersCollection.insertOne({ ...record });
    } catch (e) {
      console.warn('MongoDB insert customer error:', e.message);
    }
  }
  return record;
}

// OFFICERS
async function getKvicOfficers() {
  if (kvicOfficersCollection) {
    try {
      return await kvicOfficersCollection.find({}, { projection: { _id: 0 } }).sort({ officerId: 1 }).toArray();
    } catch (e) {
      console.warn('MongoDB officers query error:', e.message);
    }
  }
  return inMemoryKvicOfficers;
}

async function getAdminOfficers() {
  if (adminOfficersCollection) {
    try {
      return await adminOfficersCollection.find({}, { projection: { _id: 0 } }).sort({ adminId: 1 }).toArray();
    } catch (e) {
      console.warn('MongoDB admin officers query error:', e.message);
    }
  }
  return inMemoryAdminOfficers;
}

// HONEY BATCHES
async function getHoneyBatches() {
  if (honeyBatchesCollection) {
    try {
      return await honeyBatchesCollection.find({}, { projection: { _id: 0 } }).sort({ batchId: 1 }).toArray();
    } catch (e) {
      console.warn('MongoDB batches query error:', e.message);
    }
  }
  return inMemoryHoneyBatches;
}

async function addHoneyBatch(data) {
  const batchId = data.batchId || `HC2026-${String(Math.floor(100 + Math.random() * 900))}`;
  const record = {
    batchId,
    farmName: data.farmName || 'KVIC Cooperative Farm',
    beekeeperName: data.beekeeperName || 'Registered Beekeeper',
    location: data.location || 'India',
    honeyType: data.honeyType || 'Raw Forest Honey',
    quantityKg: Number(data.quantityKg) || 100,
    moisturePercent: data.moisturePercent || '17.8%',
    status: data.status || 'Verified',
    certifiedLab: data.certifiedLab || 'KVIC Central Testing Lab',
    labReportNo: data.labReportNo || `QC-${Date.now()}`,
    harvestDate: data.harvestDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  inMemoryHoneyBatches.unshift(record);
  if (honeyBatchesCollection) {
    try {
      await honeyBatchesCollection.insertOne({ ...record });
    } catch (e) {
      console.warn('MongoDB insert batch error:', e.message);
    }
  }
  return record;
}

// ADD KVIC OFFICER
async function addKvicOfficer(data) {
  const count = inMemoryKvicOfficers.length + 1;
  const officerId = data.officerId || `KVIC-OFFICER-${String(count).padStart(2, '0')}`;
  const record = {
    officerId,
    name: data.name || 'KVIC Quality Officer',
    designation: data.designation || 'Apiculture Quality Chemist',
    location: data.location || 'Central Honey Testing Lab',
    email: data.email || `${officerId.toLowerCase()}@kvic.gov.in`,
    phone: data.phone || '+91 94220 00000',
    govtBadgeId: data.govtBadgeId || `KVIC-IND-${Math.floor(1000 + Math.random() * 9000)}`,
    status: data.status || 'Active',
    certifiedBatches: Number(data.certifiedBatches) || 0,
    password: data.password || 'password123',
    createdAt: new Date().toISOString()
  };
  inMemoryKvicOfficers.unshift(record);
  if (kvicOfficersCollection) {
    try {
      await kvicOfficersCollection.insertOne({ ...record });
    } catch (e) {
      console.warn('MongoDB insert KVIC error:', e.message);
    }
  }
  return record;
}

// ADD ADMIN OFFICER
async function addAdminOfficer(data) {
  const count = inMemoryAdminOfficers.length + 1;
  const adminId = data.adminId || `ADMIN-00${count}`;
  const record = {
    adminId,
    name: data.name || 'System Administrator',
    role: data.role || 'Admin Officer',
    designation: data.designation || 'HoneyChain Root Admin',
    email: data.email || `admin${count}@honeychain.kvic.in`,
    permissions: Array.isArray(data.permissions) ? data.permissions : ['Full Access', 'User Management', 'Blockchain Audit'],
    status: data.status || 'Active',
    password: data.password || 'password123',
    createdAt: new Date().toISOString()
  };
  inMemoryAdminOfficers.unshift(record);
  if (adminOfficersCollection) {
    try {
      await adminOfficersCollection.insertOne({ ...record });
    } catch (e) {
      console.warn('MongoDB insert Admin error:', e.message);
    }
  }
  return record;
}

// ----------------------------------------------------
// AUTHENTICATION MODULE (MongoDB Backed)
// Customer | Beekeeper | KVIC Officer | Admin Officer
// ----------------------------------------------------

async function registerUser(role, userData) {
  if (!role || !userData.name) {
    throw new Error('Role and Name are required for registration');
  }

  const normalizedRole = role.toLowerCase().replace(/[\s-]/g, '_');
  let userRecord;

  if (normalizedRole === 'customer') {
    userRecord = await addCustomer({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      location: userData.location || 'India',
      preferredHoney: userData.preferredHoney || 'Natural Forest Honey',
      password: userData.password || 'password123',
      verificationStatus: 'Verified'
    });
    userRecord.role = 'customer';
    userRecord.roleTitle = 'Verified Honey Consumer';
    userRecord.portalId = 'portal-customer';
  } else if (normalizedRole === 'beekeeper') {
    userRecord = await addBeekeeper({
      name: userData.name,
      farmName: userData.farmName || `${userData.name} Honey Farm`,
      location: userData.location || 'Tamil Nadu',
      honeyType: userData.honeyType || 'Natural Forest Honey',
      phone: userData.phone,
      email: userData.email,
      batchId: userData.batchId || `HC2026-${Math.floor(100 + Math.random() * 900)}`,
      harvestDate: userData.harvestDate || new Date().toISOString().split('T')[0],
      hiveCount: Number(userData.hiveCount) || 15,
      password: userData.password || 'password123',
      verificationStatus: 'Verified'
    });
    userRecord.role = 'beekeeper';
    userRecord.roleTitle = 'Registered KVIC Beekeeper';
    userRecord.portalId = 'portal-beekeeper';
  } else if (normalizedRole === 'kvic_officer' || normalizedRole === 'kvic') {
    userRecord = await addKvicOfficer({
      name: userData.name,
      designation: userData.designation || 'KVIC Quality Officer',
      location: userData.location || 'Regional Honey Quality Lab',
      email: userData.email,
      phone: userData.phone,
      govtBadgeId: userData.govtBadgeId || `KVIC-IND-${Math.floor(1000 + Math.random() * 9000)}`,
      password: userData.password || 'password123',
      status: 'Active'
    });
    userRecord.role = 'kvic_officer';
    userRecord.roleTitle = 'KVIC Quality Director & Lab Head';
    userRecord.portalId = 'portal-kvic';
  } else if (normalizedRole === 'admin') {
    userRecord = await addAdminOfficer({
      name: userData.name,
      role: 'System Admin',
      designation: userData.designation || 'HoneyChain Root Admin',
      email: userData.email,
      password: userData.password || 'password123',
      permissions: ['Full Access', 'User Management', 'Blockchain Audit', 'Catalog Control'],
      status: 'Active'
    });
    userRecord.role = 'admin';
    userRecord.roleTitle = 'Root System Admin';
    userRecord.portalId = 'portal-admin';
  } else {
    throw new Error(`Unsupported role: ${role}. Supported roles: customer, beekeeper, kvic_officer, admin`);
  }

  const safe = { ...userRecord };
  delete safe.password;
  delete safe._id;
  return safe;
}

async function authenticateUser(role, emailOrId, password) {
  if (!emailOrId) {
    throw new Error('Email or Member ID is required');
  }

  const normalizedRole = (role || 'customer').toLowerCase().replace(/[\s-]/g, '_');
  const queryTerm = emailOrId.trim().toLowerCase();

  let matchedUser = null;

  if (normalizedRole === 'customer') {
    if (customersCollection) {
      matchedUser = await customersCollection.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${queryTerm}$`, 'i') } },
          { customerId: { $regex: new RegExp(`^${queryTerm}$`, 'i') } },
          { name: { $regex: new RegExp(`^${queryTerm}$`, 'i') } }
        ]
      });
    }
    if (!matchedUser) {
      matchedUser = inMemoryCustomers.find(c => 
        (c.email && c.email.toLowerCase() === queryTerm) ||
        (c.customerId && c.customerId.toLowerCase() === queryTerm) ||
        (c.name && c.name.toLowerCase() === queryTerm)
      );
    }
    if (matchedUser) {
      matchedUser = { ...matchedUser, role: 'customer', roleTitle: 'Verified Honey Consumer', portalId: 'portal-customer' };
    }
  } else if (normalizedRole === 'beekeeper') {
    if (beekeepersCollection) {
      matchedUser = await beekeepersCollection.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${queryTerm}$`, 'i') } },
          { beekeeperId: { $regex: new RegExp(`^${queryTerm}$`, 'i') } },
          { name: { $regex: new RegExp(`^${queryTerm}$`, 'i') } }
        ]
      });
    }
    if (!matchedUser) {
      matchedUser = inMemoryBeekeepers.find(b => 
        (b.email && b.email.toLowerCase() === queryTerm) ||
        (b.beekeeperId && b.beekeeperId.toLowerCase() === queryTerm) ||
        (b.name && b.name.toLowerCase() === queryTerm)
      );
    }
    if (matchedUser) {
      matchedUser = { ...matchedUser, role: 'beekeeper', roleTitle: 'Registered KVIC Beekeeper', portalId: 'portal-beekeeper' };
    }
  } else if (normalizedRole === 'kvic_officer' || normalizedRole === 'kvic') {
    if (kvicOfficersCollection) {
      matchedUser = await kvicOfficersCollection.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${queryTerm}$`, 'i') } },
          { officerId: { $regex: new RegExp(`^${queryTerm}$`, 'i') } },
          { name: { $regex: new RegExp(`^${queryTerm}$`, 'i') } }
        ]
      });
    }
    if (!matchedUser) {
      matchedUser = inMemoryKvicOfficers.find(o => 
        (o.email && o.email.toLowerCase() === queryTerm) ||
        (o.officerId && o.officerId.toLowerCase() === queryTerm) ||
        (o.name && o.name.toLowerCase() === queryTerm)
      );
    }
    if (matchedUser) {
      matchedUser = { ...matchedUser, role: 'kvic_officer', roleTitle: 'KVIC Quality Director & Lab Head', portalId: 'portal-kvic' };
    }
  } else if (normalizedRole === 'admin') {
    if (adminOfficersCollection) {
      matchedUser = await adminOfficersCollection.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${queryTerm}$`, 'i') } },
          { adminId: { $regex: new RegExp(`^${queryTerm}$`, 'i') } },
          { name: { $regex: new RegExp(`^${queryTerm}$`, 'i') } }
        ]
      });
    }
    if (!matchedUser) {
      matchedUser = inMemoryAdminOfficers.find(a => 
        (a.email && a.email.toLowerCase() === queryTerm) ||
        (a.adminId && a.adminId.toLowerCase() === queryTerm) ||
        (a.name && a.name.toLowerCase() === queryTerm)
      );
    }
    if (matchedUser) {
      matchedUser = { ...matchedUser, role: 'admin', roleTitle: 'Root System Admin', portalId: 'portal-admin' };
    }
  }

  // Fallback to top seed user if login matches role name, demo, or placeholder names
  const isGenericLogin = 
    queryTerm === normalizedRole ||
    queryTerm === 'demo' ||
    queryTerm.includes('admin') ||
    queryTerm.includes('kvic') ||
    queryTerm.includes('officer') ||
    queryTerm.includes('beekeeper') ||
    queryTerm.includes('kisan') ||
    queryTerm.includes('customer') ||
    queryTerm === 'kumar' ||
    queryTerm.includes('muthu') ||
    queryTerm.includes('venkat') ||
    queryTerm.includes('suresh') ||
    queryTerm.includes('priya') ||
    queryTerm.includes('narayan');

  if (!matchedUser && isGenericLogin) {
    if (normalizedRole === 'beekeeper') {
      matchedUser = inMemoryBeekeepers[0];
      matchedUser = { ...matchedUser, role: 'beekeeper', roleTitle: 'Registered KVIC Beekeeper', portalId: 'portal-beekeeper' };
    } else if (normalizedRole === 'customer') {
      matchedUser = inMemoryCustomers[0];
      matchedUser = { ...matchedUser, role: 'customer', roleTitle: 'Verified Honey Consumer', portalId: 'portal-customer' };
    } else if (normalizedRole === 'kvic_officer' || normalizedRole === 'kvic') {
      matchedUser = inMemoryKvicOfficers[0];
      matchedUser = { ...matchedUser, role: 'kvic_officer', roleTitle: 'KVIC Quality Director & Lab Head', portalId: 'portal-kvic' };
    } else if (normalizedRole === 'admin') {
      matchedUser = inMemoryAdminOfficers[0];
      matchedUser = { ...matchedUser, role: 'admin', roleTitle: 'Root System Admin', portalId: 'portal-admin' };
    }
  }

  // Auto-provision if user enters a custom name not yet in DB
  if (!matchedUser) {
    try {
      matchedUser = await registerUser(normalizedRole, {
        name: emailOrId,
        password: password || 'password123'
      });
    } catch (e) {
      if (normalizedRole === 'beekeeper') {
        matchedUser = { ...inMemoryBeekeepers[0], role: 'beekeeper', roleTitle: 'Registered KVIC Beekeeper', portalId: 'portal-beekeeper' };
      } else if (normalizedRole === 'kvic_officer' || normalizedRole === 'kvic') {
        matchedUser = { ...inMemoryKvicOfficers[0], role: 'kvic_officer', roleTitle: 'KVIC Quality Director & Lab Head', portalId: 'portal-kvic' };
      } else if (normalizedRole === 'admin') {
        matchedUser = { ...inMemoryAdminOfficers[0], role: 'admin', roleTitle: 'Root System Admin', portalId: 'portal-admin' };
      } else {
        matchedUser = { ...inMemoryCustomers[0], role: 'customer', roleTitle: 'Verified Honey Consumer', portalId: 'portal-customer' };
      }
    }
  }

  // Validate password if user record has password (allow password123 as universal demo password)
  if (matchedUser.password && password && matchedUser.password !== password && password !== 'password123') {
    throw new Error('Incorrect password entered');
  }

  const safeUser = { ...matchedUser };
  delete safeUser._id;
  delete safeUser.password;
  return safeUser;
}

async function getMe(role, id) {
  return authenticateUser(role, id);
}

// FULL DASHBOARD DATA (SINGLE CALL)
async function getFullDashboardData() {
  const [stats, beekeepers, customers, kvicOfficers, adminOfficers, honeyBatches] = await Promise.all([
    getDashboardStats(),
    getBeekeepers(),
    getCustomers(50),
    getKvicOfficers(),
    getAdminOfficers(),
    getHoneyBatches()
  ]);

  return {
    timestamp: new Date().toISOString(),
    stats,
    beekeepers,
    customers,
    kvicOfficers,
    adminOfficers,
    honeyBatches
  };
}

module.exports = {
  initializeDatabase,
  getProducts,
  getProductsByIds,
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
};
