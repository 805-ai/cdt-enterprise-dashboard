/**
 * CDT Enterprise Demo Seed Script
 * Generates 1000 realistic receipts with proper chain linkage
 */

const crypto = require('crypto');

const HMAC_SECRET = process.env.HMAC_SECRET || 'demo-hmac-secret-32-characters!';

// Simulated subject IDs (patient identifiers)
const subjects = Array.from({ length: 50 }, (_, i) => `patient_${1000 + i}`);

// Simulated actions
const actions = ['read', 'write', 'share', 'export', 'print', 'fax', 'email', 'delete'];

// Simulated resources
const resources = [
  'medical_record',
  'lab_results',
  'imaging',
  'prescription',
  'visit_notes',
  'billing',
  'insurance_claim',
  'referral',
];

// Simulated actors (healthcare workers)
const actors = [
  { id: 'dr_smith', role: 'physician' },
  { id: 'nurse_jones', role: 'nurse' },
  { id: 'admin_wilson', role: 'admin' },
  { id: 'tech_brown', role: 'lab_tech' },
  { id: 'pharm_davis', role: 'pharmacist' },
];

function generateHMAC(data) {
  return crypto.createHmac('sha256', HMAC_SECRET).update(JSON.stringify(data)).digest('hex');
}

function generatePermit(subjectId, actor) {
  const permitId = `permit_${crypto.randomBytes(8).toString('hex')}`;
  const createdAt = new Date(
    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000 // Within last 30 days
  ).toISOString();

  const permitData = {
    permitId,
    subjectId,
    actor: actor.id,
    actorRole: actor.role,
    allowedActions: actions.slice(0, Math.floor(Math.random() * 5) + 1),
    allowedResources: resources.slice(0, Math.floor(Math.random() * 4) + 1),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt,
  };

  return {
    ...permitData,
    signature: generateHMAC(permitData),
  };
}

function generateReceipt(permit, prevHash, epochId) {
  const receiptId = `receipt_${crypto.randomBytes(8).toString('hex')}`;
  const action = permit.allowedActions[Math.floor(Math.random() * permit.allowedActions.length)];
  const resource =
    permit.allowedResources[Math.floor(Math.random() * permit.allowedResources.length)];
  const timestamp = new Date(
    Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 // Within last 7 days
  ).toISOString();

  const receiptData = {
    receiptId,
    permitId: permit.permitId,
    subjectId: permit.subjectId,
    actor: permit.actor,
    action,
    resource,
    timestamp,
    prevHash,
    epochId,
  };

  const signature = generateHMAC(receiptData);
  const hash = crypto.createHash('sha256').update(JSON.stringify(receiptData) + signature).digest('hex');

  return {
    ...receiptData,
    signature,
    hash,
    status: Math.random() > 0.05 ? 'valid' : 'revoked', // 5% revoked
  };
}

function generateDemoData() {
  const permits = [];
  const receipts = [];
  const chains = {};
  const epochId = '2024-001';

  // Generate permits for each subject
  for (const subjectId of subjects) {
    const numPermits = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numPermits; i++) {
      const actor = actors[Math.floor(Math.random() * actors.length)];
      permits.push(generatePermit(subjectId, actor));
    }
  }

  // Generate receipts with proper chaining per subject
  for (const permit of permits) {
    const subjectId = permit.subjectId;
    if (!chains[subjectId]) {
      chains[subjectId] = { prevHash: 'genesis', receipts: [] };
    }

    const numReceipts = Math.floor(Math.random() * 20) + 5; // 5-25 receipts per permit
    for (let i = 0; i < numReceipts && receipts.length < 1000; i++) {
      const receipt = generateReceipt(permit, chains[subjectId].prevHash, epochId);
      chains[subjectId].prevHash = receipt.hash;
      chains[subjectId].receipts.push(receipt);
      receipts.push(receipt);
    }

    if (receipts.length >= 1000) break;
  }

  // Generate benchmark data
  const benchmark = {
    id: 'bench_demo_001',
    name: 'Demo Baseline Benchmark',
    timestamp: new Date().toISOString(),
    receiptsCount: receipts.length,
    permitThroughput: 25000 + Math.floor(Math.random() * 5000),
    receiptThroughput: 12000 + Math.floor(Math.random() * 3000),
    p50: 8 + Math.floor(Math.random() * 4),
    p95: 22 + Math.floor(Math.random() * 8),
    p99: 40 + Math.floor(Math.random() * 15),
    chainVerifyMs: 2 + Math.random(),
    signatureVerifyMs: 0.5 + Math.random() * 0.5,
  };

  // Generate epoch data
  const epochs = [
    {
      id: '2024-001',
      startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      receiptsCount: receipts.length,
    },
    {
      id: '2023-012',
      startedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      endedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'closed',
      receiptsCount: 38500,
    },
  ];

  // Generate users
  const users = [
    {
      id: 'user_admin',
      email: 'admin@hospital.org',
      name: 'System Administrator',
      role: 'admin',
      passwordHash: crypto.createHash('sha256').update('admin123').digest('hex'),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_compliance',
      email: 'compliance@hospital.org',
      name: 'Compliance Officer',
      role: 'auditor',
      passwordHash: crypto.createHash('sha256').update('compliance123').digest('hex'),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_viewer',
      email: 'viewer@hospital.org',
      name: 'Report Viewer',
      role: 'viewer',
      passwordHash: crypto.createHash('sha256').update('viewer123').digest('hex'),
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    permits,
    receipts,
    benchmark,
    epochs,
    users,
    chains: Object.entries(chains).map(([subjectId, data]) => ({
      subjectId,
      receiptCount: data.receipts.length,
      headHash: data.prevHash,
    })),
  };
}

// Export for use in server
module.exports = { generateDemoData };

// Run if executed directly
if (require.main === module) {
  const data = generateDemoData();
  console.log('Generated demo data:');
  console.log(`- ${data.permits.length} permits`);
  console.log(`- ${data.receipts.length} receipts`);
  console.log(`- ${data.chains.length} chains`);
  console.log(`- ${data.epochs.length} epochs`);
  console.log(`- ${data.users.length} users`);
  console.log(`- 1 benchmark`);
  console.log('\nSample receipt:');
  console.log(JSON.stringify(data.receipts[0], null, 2));
}
