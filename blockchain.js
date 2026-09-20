/**
 * HoneyChain - Core Blockchain Engine
 * Cryptographic batch tracking for KVIC Honey Mission.
 * Implements SHA-256 block hashing, Merkle root computation, digital signatures,
 * and tamper-detection demonstration.
 */

class CryptoUtils {
  // Pure JavaScript SHA-256 implementation to guarantee synchronous or asynchronous execution in any environment
  static sha256Sync(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;
    var result = '';

    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;
    
    var hash = CryptoUtils._hash = CryptoUtils._hash || [];
    var k = CryptoUtils._k = CryptoUtils._k || [];
    var primeCounter = k[lengthProperty];

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 300; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return;
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength | 0);
    
    for (j = 0; j < words[lengthProperty];) {
      var w = words.slice(j, j += 16);
      var oldHash = hash;
      hash = hash.slice(0, 8);
      
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        var s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

        var s1_maj = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
        var maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        var t2 = (s1_maj + maj) | 0;
        
        var s1_ch = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
        var ch = (hash[4] & hash[5]) ^ ((~hash[4]) & hash[6]);
        var t1 = (hash[7] + s1_ch + ch + k[i] + w[i]) | 0;
        
        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }
      
      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }
    
    for (i = 0; i < 8; i++) {
      for (j = 3; j >= 0; j--) {
        var b = (hash[i] >> (8 * j)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }

  static computeMerkleRoot(transactions) {
    if (!transactions || transactions.length === 0) return CryptoUtils.sha256Sync('EMPTY');
    let hashes = transactions.map(tx => CryptoUtils.sha256Sync(JSON.stringify(tx)));
    while (hashes.length > 1) {
      if (hashes.length % 2 !== 0) hashes.push(hashes[hashes.length - 1]);
      const nextLevel = [];
      for (let i = 0; i < hashes.length; i += 2) {
        nextLevel.push(CryptoUtils.sha256Sync(hashes[i] + hashes[i + 1]));
      }
      hashes = nextLevel;
    }
    return hashes[0];
  }
}

class Transaction {
  constructor(type, data, signer = 'KVIC-OFFICER-DIGITAL-KEY') {
    this.type = type; // 'HIVE_HARVEST', 'KVIC_LAB_TEST', 'PROCESSING_SEAL', 'RETAIL_DISPATCH'
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.signer = signer;
    this.signature = CryptoUtils.sha256Sync(signer + this.timestamp + JSON.stringify(data)).substring(0, 32);
  }
}

class Block {
  constructor(index, timestamp, transactions, previousHash = '', batchId = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.batchId = batchId;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.merkleRoot = CryptoUtils.computeMerkleRoot(transactions);
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return CryptoUtils.sha256Sync(
      this.index +
      this.previousHash +
      this.timestamp +
      this.batchId +
      this.merkleRoot +
      this.nonce
    );
  }

  mineBlock(difficulty = 2) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    return this.hash;
  }
}

class HoneyBlockchain {
  constructor() {
    this.difficulty = 2;
    this.chain = [];
    this.init();
  }

  init() {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('honeychain_ledger') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.chain = parsed.map(b => {
          const block = new Block(b.index, b.timestamp, b.transactions, b.previousHash, b.batchId);
          block.nonce = b.nonce;
          block.hash = b.hash;
          block.merkleRoot = b.merkleRoot;
          return block;
        });
        return;
      } catch (e) {
        console.warn('Failed to parse cached ledger, resetting to genesis', e);
      }
    }
    this.createGenesisBlock();
    this.seedKvicBatches();
    this.save();
  }

  createGenesisBlock() {
    const genesisTx = [new Transaction('GENESIS', {
      network: 'KVIC Honey Mission Blockchain Ledger',
      missionId: 'KVIC-HM-2026-NAT',
      authority: 'Khadi & Village Industries Commission (Govt. of India)',
      standard: 'FSSAI 2.8.4 & AGMARK Honey Standard'
    }, 'KVIC-CENTRAL-NODE')];
    
    const genesisBlock = new Block(0, '2026-01-01T00:00:00.000Z', genesisTx, '0'.repeat(64), 'GENESIS');
    genesisBlock.mineBlock(this.difficulty);
    this.chain = [genesisBlock];
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(batchId, transactions) {
    const prevBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      transactions,
      prevBlock.hash,
      batchId
    );
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    this.save();
    return newBlock;
  }

  seedKvicBatches() {
    const initialBatches = [
      {
        batchId: 'HC-KVIC-2026-NIL01',
        name: 'Nilgiri Wild Mountain Honey',
        type: 'forest',
        harvest: {
          keeper: 'Ramaswamy K.',
          cooperative: 'Nilgiris Adivasi Beekeeping Society',
          cluster: 'Kotagiri, Nilgiris, Tamil Nadu',
          boxSerial: 'KVIC-TB-NIL-4082',
          geoCoords: '11.4283° N, 76.8659° E',
          floraSource: 'Kurunji, Jamun & Wild Mountain Flora',
          harvestDate: '2026-08-14',
          quantityKg: 120,
          rawMoisture: '18.1%'
        },
        labTest: {
          testingLab: 'KVIC Central Honey Testing Lab, Pune',
          testedDate: '2026-08-18',
          nmrProfile: 'C4 Sugars: 0.8% (Passed < 5%), C3 Sugars: 0.2% (Passed)',
          moisture: '17.8%',
          hmfLevel: '12.4 mg/kg (Limit: < 40)',
          pollenAuthenticity: '98.6% Native Nilgiri Flora',
          antibioticResidue: 'ND (Not Detected)',
          fssaiCertNo: 'FSSAI-10022026001432',
          agmarkGrade: 'Special Grade Pure Honey'
        },
        packaging: {
          facility: 'KVIC Organic Bottling Center, Coimbatore',
          packagedDate: '2026-08-22',
          tamperSealNumber: 'SEAL-NIL-99812',
          temperatureControlled: true,
          coldExtracted: true
        }
      },
      {
        batchId: 'HC-KVIC-2026-KSH02',
        name: 'Kashmir White Acacia Honey',
        type: 'floral',
        harvest: {
          keeper: 'Ghulam Mohammad Bhat',
          cooperative: 'Kashmir Apicultural Federation',
          cluster: 'Pampore, Pulwama, Jammu & Kashmir',
          boxSerial: 'KVIC-TB-KSH-8821',
          geoCoords: '33.9984° N, 74.9272° E',
          floraSource: 'Robinia Pseudoacacia (White Acacia)',
          harvestDate: '2026-08-10',
          quantityKg: 85,
          rawMoisture: '17.4%'
        },
        labTest: {
          testingLab: 'KVIC Regional Quality Control Lab, Srinagar',
          testedDate: '2026-08-15',
          nmrProfile: 'C4 Sugars: 0.3% (Passed), C3 Sugars: 0.1% (Passed)',
          moisture: '16.9%',
          hmfLevel: '8.2 mg/kg (Limit: < 40)',
          pollenAuthenticity: '99.1% Robinia Acacia',
          antibioticResidue: 'ND',
          fssaiCertNo: 'FSSAI-10022026001890',
          agmarkGrade: 'Special Grade Pure Honey'
        },
        packaging: {
          facility: 'Srinagar Khadi Packaging Hub',
          packagedDate: '2026-08-19',
          tamperSealNumber: 'SEAL-KSH-44211',
          temperatureControlled: true,
          coldExtracted: true
        }
      },
      {
        batchId: 'HC-KVIC-2026-SUN03',
        name: 'Sundarbans Wild Mangrove Honey',
        type: 'forest',
        harvest: {
          keeper: 'Birendra Mondal (Mouley Honey Hunter)',
          cooperative: 'Sundarbans Forest Beekeepers Union',
          cluster: 'Gosaba, Sundarbans, West Bengal',
          boxSerial: 'KVIC-TB-SUN-1194',
          geoCoords: '22.1642° N, 88.8070° E',
          floraSource: 'Khalsi, Bain & Sundari Mangrove Blooms',
          harvestDate: '2026-08-04',
          quantityKg: 140,
          rawMoisture: '18.9%'
        },
        labTest: {
          testingLab: 'National Dairy Development Board (NDDB) Honey Lab, Anand',
          testedDate: '2026-08-09',
          nmrProfile: 'C4 Sugars: 1.1% (Passed), C3 Sugars: 0.4% (Passed)',
          moisture: '18.2%',
          hmfLevel: '15.1 mg/kg',
          pollenAuthenticity: '97.4% Mangrove Pollen',
          antibioticResidue: 'ND',
          fssaiCertNo: 'FSSAI-10022026002931',
          agmarkGrade: 'Standard Grade Raw Honey'
        },
        packaging: {
          facility: 'Kolkata Khadi Bhavan Bottling Center',
          packagedDate: '2026-08-12',
          tamperSealNumber: 'SEAL-SUN-66710',
          temperatureControlled: true,
          coldExtracted: true
        }
      },
      {
        batchId: 'HC-KVIC-2026-CRG04',
        name: 'Coorg Jamun & Coffee Blossom Honey',
        type: 'floral',
        harvest: {
          keeper: 'Meera & Bopanna Somanna',
          cooperative: 'Kodagu District Beekeeping Cooperative',
          cluster: 'Madikeri, Coorg, Karnataka',
          boxSerial: 'KVIC-TB-CRG-5519',
          geoCoords: '12.4244° N, 75.7382° E',
          floraSource: 'Syzygium cumini (Jamun) & Arabica Coffee',
          harvestDate: '2026-08-20',
          quantityKg: 95,
          rawMoisture: '17.9%'
        },
        labTest: {
          testingLab: 'CFTRI (Central Food Technological Research Institute), Mysuru',
          testedDate: '2026-08-24',
          nmrProfile: 'C4 Sugars: 0.6% (Passed), C3 Sugars: 0.3% (Passed)',
          moisture: '17.3%',
          hmfLevel: '9.8 mg/kg',
          pollenAuthenticity: '98.9% Jamun-Coffee Complex',
          antibioticResidue: 'ND',
          fssaiCertNo: 'FSSAI-10022026003204',
          agmarkGrade: 'Special Grade Pure Honey'
        },
        packaging: {
          facility: 'Mysuru Agro-Khadi Processing Facility',
          packagedDate: '2026-08-28',
          tamperSealNumber: 'SEAL-CRG-77319',
          temperatureControlled: true,
          coldExtracted: true
        }
      }
    ];

    initialBatches.forEach(batch => {
      const txs = [
        new Transaction('HIVE_HARVEST', batch.harvest, 'BEEKEEPER-' + batch.harvest.boxSerial),
        new Transaction('KVIC_LAB_TEST', batch.labTest, 'OFFICER-' + batch.labTest.fssaiCertNo),
        new Transaction('PROCESSING_SEAL', batch.packaging, 'SUPERVISOR-' + batch.packaging.tamperSealNumber)
      ];
      this.addBlock(batch.batchId, txs);
    });
  }

  findBatch(batchId) {
    if (!batchId) return null;
    const cleanId = batchId.trim().toUpperCase();
    const block = this.chain.find(b => b.batchId && b.batchId.toUpperCase() === cleanId);
    if (!block) return null;

    const harvestTx = block.transactions.find(t => t.type === 'HIVE_HARVEST');
    const labTx = block.transactions.find(t => t.type === 'KVIC_LAB_TEST');
    const packTx = block.transactions.find(t => t.type === 'PROCESSING_SEAL');

    return {
      batchId: block.batchId,
      blockIndex: block.index,
      blockHash: block.hash,
      previousHash: block.previousHash,
      merkleRoot: block.merkleRoot,
      nonce: block.nonce,
      timestamp: block.timestamp,
      isChainValid: this.isChainValid().isValid,
      harvest: harvestTx ? harvestTx.data : null,
      labTest: labTx ? labTx.data : null,
      packaging: packTx ? packTx.data : null
    };
  }

  getAllBatches() {
    return this.chain
      .filter(b => b.batchId && b.batchId !== 'GENESIS')
      .map(b => this.findBatch(b.batchId));
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check current hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return {
          isValid: false,
          error: `Block #${currentBlock.index} hash mismatch. Computed: ${currentBlock.calculateHash().substring(0, 10)}... Actual: ${currentBlock.hash.substring(0, 10)}... (Tamper Detected!)`,
          faultyBlockIndex: i
        };
      }

      // Check link to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          isValid: false,
          error: `Block #${currentBlock.index} previousHash mismatch. Broken chain link!`,
          faultyBlockIndex: i
        };
      }

      // Check Merkle root
      const computedMerkle = CryptoUtils.computeMerkleRoot(currentBlock.transactions);
      if (currentBlock.merkleRoot !== computedMerkle) {
        return {
          isValid: false,
          error: `Block #${currentBlock.index} Merkle Root is corrupted! Transactions have been tampered with.`,
          faultyBlockIndex: i
        };
      }
    }
    return { isValid: true, message: 'All cryptographic hashes and Merkle proofs are 100% verified.' };
  }

  tamperBlockData(blockIndex, newHarvestMoisture = '26.5% (High Water/Syrup Adulteration)') {
    if (blockIndex <= 0 || blockIndex >= this.chain.length) return false;
    const block = this.chain[blockIndex];
    const harvestTx = block.transactions.find(t => t.type === 'HIVE_HARVEST');
    if (harvestTx) {
      harvestTx.data.rawMoisture = newHarvestMoisture;
      harvestTx.data.adulterated = true;
      this.save();
      return true;
    }
    return false;
  }

  restoreChain() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('honeychain_ledger');
    }
    this.createGenesisBlock();
    this.seedKvicBatches();
    this.save();
  }

  save() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('honeychain_ledger', JSON.stringify(this.chain));
    }
  }
}

// Attach to window or module
if (typeof window !== 'undefined') {
  window.HoneyBlockchain = HoneyBlockchain;
  window.CryptoUtils = CryptoUtils;
  window.Block = Block;
  window.Transaction = Transaction;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HoneyBlockchain, Block, Transaction, CryptoUtils };
}
