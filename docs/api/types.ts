/**
 * CDT Enterprise Dashboard - TypeScript Types
 * ============================================
 * Generated from OpenAPI spec
 */

// ============================================
// Core Types
// ============================================

export interface Permit {
  permit_id: string;
  tenant_id: string;
  requester_id: string;
  model_id?: string;
  jurisdiction?: string;
  epoch: number;
  policy_snapshot?: Record<string, unknown>;
  issued_at: string;
  expires_at: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface Receipt {
  receipt_id: string;
  permit_id: string;
  action: ReceiptAction;
  timestamp: string;
  epoch: number;
  prev_hash: string;
  hash: string;
  signature: string;
  metadata?: Record<string, unknown>;
}

export interface ReceiptDetail extends Receipt {
  verification_status: 'valid' | 'invalid' | 'pending';
  chain_position: number;
}

export type ReceiptAction =
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'DATA_ACCESSED'
  | 'DATA_DELETED'
  | 'INFERENCE_RUN';

// ============================================
// Request Types
// ============================================

export interface IssuePermitsRequest {
  count: number;
  metadata?: Record<string, unknown>;
}

export interface GenerateReceiptsRequest {
  count: number;
  chained?: boolean;
  action?: ReceiptAction;
  metadata?: Record<string, unknown>;
}

export interface VerifyReceiptsRequest {
  receipt_ids?: string[];
  range?: { start: number; end: number };
  all?: boolean;
}

export interface SearchReceiptsParams {
  receipt_id?: string;
  permit_id?: string;
  action?: ReceiptAction;
  epoch?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface VerifyChainRequest {
  window_start?: number;
  window_end?: number;
  full?: boolean;
}

export interface BumpEpochRequest {
  reason: string;
  requested_by: string;
}

export interface BenchmarkUploadRequest {
  data: BenchmarkRawData;
  name?: string;
}

export interface AuditLogParams {
  event_type?: AuditEventType;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

// ============================================
// Response Types
// ============================================

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
}

export interface OperationStats {
  count: number;
  duration_ms: number;
  throughput: number;
}

export interface IssuePermitsResponse {
  permits: Permit[];
  stats: OperationStats;
}

export interface GenerateReceiptsResponse {
  receipts: Receipt[];
  stats: OperationStats;
}

export interface VerificationFailure {
  receipt_id: string;
  reason: 'hash_mismatch' | 'signature_invalid' | 'chain_broken' | 'epoch_mismatch';
}

export interface VerifyReceiptsResponse {
  valid: number;
  invalid: number;
  stats: OperationStats;
  failures: VerificationFailure[];
}

export interface SearchReceiptsResponse {
  receipts: Receipt[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ChainError {
  index: number;
  receipt_id: string;
  error: string;
}

export interface ChainVerifyStats {
  checked: number;
  valid: number;
  invalid: number;
  duration_ms: number;
}

export interface VerifyChainResponse {
  valid: boolean;
  errors: ChainError[];
  stats: ChainVerifyStats;
}

export interface ChainStats {
  length: number;
  head_hash: string;
  tail_hash: string;
  current_epoch: number;
  last_verified?: string;
}

export interface EpochInfo {
  epoch: number;
  last_bumped_at?: string;
  last_bumped_by?: string;
  bump_reason?: string;
}

export interface BumpEpochResponse {
  old_epoch: number;
  new_epoch: number;
  revoked_count: number;
  timestamp: string;
}

export interface BenchmarkMetrics {
  permit_throughput: number;
  receipt_throughput: number;
  verify_throughput?: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  chain_length: number;
  chain_valid: boolean;
}

export interface BenchmarkRawData {
  benchmark_time: string;
  config: {
    count: number;
    verify: boolean;
    parallel: number;
  };
  permit_issuance: {
    count: number;
    total_sec: number;
    avg_ms: number;
    p50_ms: number;
    p95_ms: number;
    p99_ms: number;
    throughput: number;
  };
  receipt_generation: {
    count: number;
    total_sec: number;
    avg_ms: number;
    p50_ms: number;
    p95_ms: number;
    p99_ms: number;
    throughput: number;
  };
  receipt_verification?: {
    count: number;
    total_sec: number;
    avg_ms: number;
    p50_ms: number;
    p95_ms: number;
    p99_ms: number;
    throughput: number;
  };
  chain_integrity: {
    length: number;
    valid: boolean;
    verify_time_sec: number;
    verify_rate: number;
  };
  sample_receipt?: Receipt;
}

export interface BenchmarkData {
  id: string;
  name?: string;
  uploaded_at: string;
  metrics: BenchmarkMetrics;
  raw: BenchmarkRawData;
}

export interface BenchmarkUploadResponse {
  id: string;
  stored_at: string;
}

export type AuditEventType =
  | 'PERMIT_ISSUED'
  | 'RECEIPT_GENERATED'
  | 'RECEIPT_VERIFIED'
  | 'CHAIN_VERIFIED'
  | 'EPOCH_BUMPED'
  | 'USER_LOGIN'
  | 'SETTINGS_CHANGED';

export interface AuditLogEntry {
  id: string;
  event_type: AuditEventType;
  user_id: string;
  timestamp: string;
  details: Record<string, unknown>;
  ip_address?: string;
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
}

export interface MetricsResponse {
  permits_total: number;
  receipts_total: number;
  current_epoch: number;
  chain_valid: boolean;
  permits_per_sec: number;
  receipts_per_sec: number;
  verify_per_sec: number;
  error_count: number;
  uptime_seconds: number;
}

// ============================================
// Error Types
// ============================================

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

// ============================================
// RBAC Types
// ============================================

export type Role = 'viewer' | 'operator' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  created_at: string;
  last_login?: string;
}

// ============================================
// Dashboard State Types
// ============================================

export interface DashboardState {
  metrics: MetricsResponse | null;
  chainStats: ChainStats | null;
  epochInfo: EpochInfo | null;
  latestBenchmark: BenchmarkData | null;
  isLoading: boolean;
  error: string | null;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface LatencyPercentiles {
  timestamp: string;
  p50: number;
  p95: number;
  p99: number;
}
