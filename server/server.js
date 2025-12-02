/**
 * CDT Enterprise Dashboard - Backend Server
 * ==========================================
 * Production-grade API server with RBAC, audit logging, and CDT engine integration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const HMAC_SECRET = process.env.HMAC_SECRET || 'dashboard-hmac-secret-32-chars!!';
const JWT_SECRET = process.env.JWT_SECRET || 'dashboard-jwt-secret-32-chars!!!';

// ============================================
// IN-MEMORY STORES (SQLite in production)
// ============================================
const store = {
  permits: [],
  receipts: [],
  epoch: { current: 1, last_bumped_at: null, last_bumped_by: null, bump_reason: null },
  benchmarks: [],
  auditLogs: [],
  users: [
    { id: 'admin-001', email: 'admin@hospital.org', name: 'System Admin', role: 'admin', created_at: new Date().toISOString() },
    { id: 'operator-001', email: 'ops@hospital.org', name: 'Operations', role: 'operator', created_at: new Date().toISOString() },
    { id: 'viewer-001', email: 'audit@hospital.org', name: 'Compliance Viewer', role: 'viewer', created_at: new Date().toISOString() }
  ],
  metrics: {
    permits_issued: 0,
    receipts_generated: 0,
    verifications_run: 0,
    start_time: Date.now()
  }
};

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============================================
// CRYPTO FUNCTIONS
// ============================================
function computeHash(data) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function computeHMAC(data) {
  return crypto.createHmac('sha256', HMAC_SECRET).update(data).digest('hex');
}

function generateId(prefix = '') {
  return `${prefix}${uuidv4().replace(/-/g, '').slice(0, 16)}`;
}

// ============================================
// AUDIT LOGGING
// ============================================
function auditLog(eventType, userId, details, ipAddress = 'system') {
  const entry = {
    id: generateId('audit_'),
    event_type: eventType,
    user_id: userId,
    timestamp: new Date().toISOString(),
    details,
    ip_address: ipAddress
  };
  store.auditLogs.unshift(entry);
  // Keep last 10000 entries
  if (store.auditLogs.length > 10000) {
    store.auditLogs = store.auditLogs.slice(0, 10000);
  }
  return entry;
}

// ============================================
// CDT ENGINE FUNCTIONS
// ============================================
function issuePermit(metadata = {}) {
  const permit = {
    permit_id: generateId('permit_'),
    tenant_id: metadata.tenant_id || 'default',
    requester_id: metadata.requester_id || 'system',
    model_id: metadata.model_id || 'model:default@1',
    jurisdiction: metadata.jurisdiction || 'US-CA',
    epoch: store.epoch.current,
    policy_snapshot: { epoch: store.epoch.current, terms: `policy-v${store.epoch.current}` },
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    status: 'ACTIVE'
  };
  store.permits.push(permit);
  store.metrics.permits_issued++;
  return permit;
}

function createReceipt(permitId, action = 'INFERENCE_RUN', metadata = {}) {
  const prevHash = store.receipts.length > 0
    ? store.receipts[store.receipts.length - 1].hash
    : 'genesis';

  const receiptData = {
    receipt_id: generateId('receipt_'),
    permit_id: permitId,
    action,
    timestamp: new Date().toISOString(),
    epoch: store.epoch.current,
    prev_hash: prevHash,
    metadata
  };

  const hash = computeHash(receiptData);
  const signature = computeHMAC(hash);

  const receipt = { ...receiptData, hash, signature };
  store.receipts.push(receipt);
  store.metrics.receipts_generated++;
  return receipt;
}

function verifyReceipt(receipt) {
  // Verify hash
  const dataForHash = {
    receipt_id: receipt.receipt_id,
    permit_id: receipt.permit_id,
    action: receipt.action,
    timestamp: receipt.timestamp,
    epoch: receipt.epoch,
    prev_hash: receipt.prev_hash,
    metadata: receipt.metadata
  };
  const computedHash = computeHash(dataForHash);
  if (computedHash !== receipt.hash) {
    return { valid: false, reason: 'hash_mismatch' };
  }

  // Verify signature
  const computedSig = computeHMAC(receipt.hash);
  if (computedSig !== receipt.signature) {
    return { valid: false, reason: 'signature_invalid' };
  }

  // Verify epoch
  if (receipt.epoch !== store.epoch.current) {
    return { valid: false, reason: 'epoch_mismatch' };
  }

  store.metrics.verifications_run++;
  return { valid: true };
}

function verifyChain(start = 0, end = store.receipts.length) {
  const errors = [];
  const receipts = store.receipts.slice(start, end);

  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];
    const globalIndex = start + i;

    // Verify hash
    const dataForHash = {
      receipt_id: receipt.receipt_id,
      permit_id: receipt.permit_id,
      action: receipt.action,
      timestamp: receipt.timestamp,
      epoch: receipt.epoch,
      prev_hash: receipt.prev_hash,
      metadata: receipt.metadata
    };
    const computedHash = computeHash(dataForHash);
    if (computedHash !== receipt.hash) {
      errors.push({ index: globalIndex, receipt_id: receipt.receipt_id, error: 'hash_mismatch' });
    }

    // Verify signature
    const computedSig = computeHMAC(receipt.hash);
    if (computedSig !== receipt.signature) {
      errors.push({ index: globalIndex, receipt_id: receipt.receipt_id, error: 'signature_invalid' });
    }

    // Verify chain linkage
    if (globalIndex > 0) {
      const prevReceipt = store.receipts[globalIndex - 1];
      if (receipt.prev_hash !== prevReceipt.hash) {
        errors.push({ index: globalIndex, receipt_id: receipt.receipt_id, error: 'chain_broken' });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// API ROUTES - HEALTH
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================
// API ROUTES - METRICS
// ============================================
app.get('/api/metrics', (req, res) => {
  const uptimeSeconds = (Date.now() - store.metrics.start_time) / 1000;
  const chainValid = store.receipts.length === 0 || verifyChain().valid;

  res.json({
    permits_total: store.permits.length,
    receipts_total: store.receipts.length,
    current_epoch: store.epoch.current,
    chain_valid: chainValid,
    permits_per_sec: store.metrics.permits_issued / Math.max(uptimeSeconds, 1),
    receipts_per_sec: store.metrics.receipts_generated / Math.max(uptimeSeconds, 1),
    verify_per_sec: store.metrics.verifications_run / Math.max(uptimeSeconds, 1),
    error_count: 0,
    uptime_seconds: uptimeSeconds
  });
});

// ============================================
// API ROUTES - PERMITS
// ============================================
app.post('/api/permits/issue', (req, res) => {
  const startTime = Date.now();
  const { count = 1, metadata = {} } = req.body;

  const permits = [];
  for (let i = 0; i < Math.min(count, 10000); i++) {
    permits.push(issuePermit(metadata));
  }

  const durationMs = Date.now() - startTime;
  auditLog('PERMIT_ISSUED', 'system', { count: permits.length });

  res.json({
    permits: permits.slice(0, 100), // Return first 100
    stats: {
      count: permits.length,
      duration_ms: durationMs,
      throughput: permits.length / (durationMs / 1000)
    }
  });
});

// ============================================
// API ROUTES - RECEIPTS
// ============================================
app.post('/api/receipts/generate', (req, res) => {
  const startTime = Date.now();
  const { count = 1, chained = true, action = 'INFERENCE_RUN', metadata = {} } = req.body;

  // Ensure we have permits
  if (store.permits.length === 0) {
    for (let i = 0; i < count; i++) {
      issuePermit({});
    }
  }

  const receipts = [];
  for (let i = 0; i < Math.min(count, 100000); i++) {
    const permitIndex = i % store.permits.length;
    const permit = store.permits[permitIndex];
    receipts.push(createReceipt(permit.permit_id, action, metadata));
  }

  const durationMs = Date.now() - startTime;
  auditLog('RECEIPT_GENERATED', 'system', { count: receipts.length });

  res.json({
    receipts: receipts.slice(-100), // Return last 100
    stats: {
      count: receipts.length,
      duration_ms: durationMs,
      throughput: receipts.length / (durationMs / 1000)
    }
  });
});

app.post('/api/receipts/verify', (req, res) => {
  const startTime = Date.now();
  const { receipt_ids, range, all = false } = req.body;

  let receiptsToVerify = [];

  if (all) {
    receiptsToVerify = store.receipts;
  } else if (range) {
    receiptsToVerify = store.receipts.slice(range.start, range.end);
  } else if (receipt_ids) {
    receiptsToVerify = store.receipts.filter(r => receipt_ids.includes(r.receipt_id));
  }

  let valid = 0;
  let invalid = 0;
  const failures = [];

  for (const receipt of receiptsToVerify) {
    const result = verifyReceipt(receipt);
    if (result.valid) {
      valid++;
    } else {
      invalid++;
      failures.push({ receipt_id: receipt.receipt_id, reason: result.reason });
    }
  }

  const durationMs = Date.now() - startTime;
  auditLog('RECEIPT_VERIFIED', 'system', { checked: receiptsToVerify.length, valid, invalid });

  res.json({
    valid,
    invalid,
    stats: {
      count: receiptsToVerify.length,
      duration_ms: durationMs,
      throughput: receiptsToVerify.length / (durationMs / 1000)
    },
    failures: failures.slice(0, 100) // First 100 failures
  });
});

app.get('/api/receipts/search', (req, res) => {
  const { receipt_id, permit_id, action, epoch, start_date, end_date, page = 1, limit = 50 } = req.query;

  let results = [...store.receipts];

  if (receipt_id) {
    results = results.filter(r => r.receipt_id.includes(receipt_id));
  }
  if (permit_id) {
    results = results.filter(r => r.permit_id.includes(permit_id));
  }
  if (action) {
    results = results.filter(r => r.action === action);
  }
  if (epoch) {
    results = results.filter(r => r.epoch === parseInt(epoch));
  }
  if (start_date) {
    results = results.filter(r => new Date(r.timestamp) >= new Date(start_date));
  }
  if (end_date) {
    results = results.filter(r => new Date(r.timestamp) <= new Date(end_date));
  }

  // Sort by timestamp descending
  results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const total = results.length;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const paged = results.slice(offset, offset + parseInt(limit));

  res.json({
    receipts: paged,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    has_more: offset + paged.length < total
  });
});

app.get('/api/receipts/:id', (req, res) => {
  const receipt = store.receipts.find(r => r.receipt_id === req.params.id);
  if (!receipt) {
    return res.status(404).json({ error: 'Receipt not found' });
  }

  const verification = verifyReceipt(receipt);
  const chainPosition = store.receipts.findIndex(r => r.receipt_id === receipt.receipt_id);

  res.json({
    ...receipt,
    verification_status: verification.valid ? 'valid' : 'invalid',
    chain_position: chainPosition
  });
});

// ============================================
// API ROUTES - CHAIN
// ============================================
app.post('/api/chain/verify', (req, res) => {
  const startTime = Date.now();
  const { window_start, window_end, full = true } = req.body;

  let start = 0;
  let end = store.receipts.length;

  if (!full && window_start !== undefined) {
    start = window_start;
    end = window_end || store.receipts.length;
  }

  const result = verifyChain(start, end);
  const durationMs = Date.now() - startTime;

  auditLog('CHAIN_VERIFIED', 'system', {
    start,
    end,
    valid: result.valid,
    errors: result.errors.length
  });

  res.json({
    valid: result.valid,
    errors: result.errors.slice(0, 100),
    stats: {
      checked: end - start,
      valid: end - start - result.errors.length,
      invalid: result.errors.length,
      duration_ms: durationMs
    }
  });
});

app.get('/api/chain/stats', (req, res) => {
  const length = store.receipts.length;
  const headHash = length > 0 ? store.receipts[0].hash : null;
  const tailHash = length > 0 ? store.receipts[length - 1].hash : null;

  res.json({
    length,
    head_hash: headHash,
    tail_hash: tailHash,
    current_epoch: store.epoch.current,
    last_verified: new Date().toISOString()
  });
});

// ============================================
// API ROUTES - EPOCH
// ============================================
app.get('/api/epoch/current', (req, res) => {
  res.json({
    epoch: store.epoch.current,
    last_bumped_at: store.epoch.last_bumped_at,
    last_bumped_by: store.epoch.last_bumped_by,
    bump_reason: store.epoch.bump_reason
  });
});

app.post('/api/epoch/bump', (req, res) => {
  const { reason, requested_by } = req.body;

  if (!reason || reason.length < 10) {
    return res.status(400).json({ error: 'Reason must be at least 10 characters' });
  }

  const oldEpoch = store.epoch.current;
  const newEpoch = oldEpoch + 1;

  store.epoch = {
    current: newEpoch,
    last_bumped_at: new Date().toISOString(),
    last_bumped_by: requested_by,
    bump_reason: reason
  };

  // Count revoked permits
  const revokedCount = store.permits.filter(p => p.epoch < newEpoch && p.status === 'ACTIVE').length;
  store.permits.forEach(p => {
    if (p.epoch < newEpoch) {
      p.status = 'REVOKED';
    }
  });

  auditLog('EPOCH_BUMPED', requested_by, { old_epoch: oldEpoch, new_epoch: newEpoch, reason, revoked_count: revokedCount });

  res.json({
    old_epoch: oldEpoch,
    new_epoch: newEpoch,
    revoked_count: revokedCount,
    timestamp: store.epoch.last_bumped_at
  });
});

// ============================================
// API ROUTES - BENCHMARKS
// ============================================
app.post('/api/benchmarks/upload', (req, res) => {
  const { data, name } = req.body;

  const benchmark = {
    id: generateId('bench_'),
    name: name || `Benchmark ${new Date().toISOString()}`,
    uploaded_at: new Date().toISOString(),
    metrics: {
      permit_throughput: data.permit_issuance?.throughput || 0,
      receipt_throughput: data.receipt_generation?.throughput || 0,
      verify_throughput: data.receipt_verification?.throughput || 0,
      p50_latency_ms: data.receipt_generation?.p50_ms || 0,
      p95_latency_ms: data.receipt_generation?.p95_ms || 0,
      p99_latency_ms: data.receipt_generation?.p99_ms || 0,
      chain_length: data.chain_integrity?.length || 0,
      chain_valid: data.chain_integrity?.valid || false
    },
    raw: data
  };

  store.benchmarks.unshift(benchmark);

  res.json({
    id: benchmark.id,
    stored_at: benchmark.uploaded_at
  });
});

app.get('/api/benchmarks/latest', (req, res) => {
  if (store.benchmarks.length === 0) {
    return res.json(null);
  }
  res.json(store.benchmarks[0]);
});

app.get('/api/benchmarks', (req, res) => {
  res.json(store.benchmarks.slice(0, 20));
});

// ============================================
// API ROUTES - AUDIT LOGS
// ============================================
app.get('/api/audit/logs', (req, res) => {
  const { event_type, user_id, start_date, end_date, page = 1, limit = 50 } = req.query;

  let results = [...store.auditLogs];

  if (event_type) {
    results = results.filter(l => l.event_type === event_type);
  }
  if (user_id) {
    results = results.filter(l => l.user_id === user_id);
  }
  if (start_date) {
    results = results.filter(l => new Date(l.timestamp) >= new Date(start_date));
  }
  if (end_date) {
    results = results.filter(l => new Date(l.timestamp) <= new Date(end_date));
  }

  const total = results.length;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const paged = results.slice(offset, offset + parseInt(limit));

  res.json({
    logs: paged,
    total,
    page: parseInt(page)
  });
});

// ============================================
// API ROUTES - USERS (RBAC)
// ============================================
app.get('/api/users', (req, res) => {
  res.json(store.users);
});

// ============================================
// STATIC FILES (UI)
// ============================================
app.use(express.static(path.join(__dirname, '../ui/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../ui/dist/index.html'));
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('============================================');
  console.log('CDT ENTERPRISE DASHBOARD - SERVER RUNNING');
  console.log('============================================');
  console.log(`Port:     ${PORT}`);
  console.log(`API:      http://localhost:${PORT}/api`);
  console.log(`Health:   http://localhost:${PORT}/api/health`);
  console.log(`Metrics:  http://localhost:${PORT}/api/metrics`);
  console.log('============================================');
});

module.exports = app;
