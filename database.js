const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error('MONGODB_URI is not configured in .env');

const client = new MongoClient(mongoUri);
let productsCollection;

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

async function initializeDatabase() {
  await client.connect();
  const databaseName = new URL(mongoUri).pathname.replace(/^\//, '') || 'honeychain';
  productsCollection = client.db(databaseName).collection('products');
  await productsCollection.createIndex({ id: 1 }, { unique: true });

  if (await productsCollection.countDocuments() === 0) {
    await productsCollection.insertMany(seedProducts);
    console.log(`Seeded ${seedProducts.length} products into MongoDB`);
  }
}

async function getProducts() {
  return productsCollection.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray();
}

async function getProductsByIds(ids) {
  return productsCollection.find({ id: { $in: ids } }, { projection: { _id: 0 } }).toArray();
}

module.exports = { initializeDatabase, getProducts, getProductsByIds };
