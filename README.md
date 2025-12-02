# CDT Enterprise Dashboard

Hospital-grade consent data trail monitoring dashboard with real-time analytics, chain integrity verification, and FHIR R4 integration.

## Quick Start

### One-Click Docker Deploy

```bash
docker compose up -d
```

Dashboard will be available at: http://localhost:8080

### Default Credentials (Demo Mode)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.org | admin123 |
| Auditor | compliance@hospital.org | compliance123 |
| Viewer | viewer@hospital.org | viewer123 |

## Features

### Overview Dashboard
- Real-time KPI cards (receipts, latency, chain integrity)
- Volume trends (7-day receipt/permit activity)
- Latency percentiles (P50/P95/P99)
- Status distribution pie chart

### Receipt Explorer
- Full-text search across all receipts
- Filter by status (valid/revoked/pending)
- Filter by subject ID and date range
- Click-to-expand receipt details
- CSV/PDF export

### Chain Integrity
- Per-subject HMAC chain verification
- Visual chain status indicators
- One-click re-verification
- Broken chain detection and alerting

### Epoch Control
- Current epoch status display
- Epoch history timeline
- Mass revocation (epoch bump) with confirmation
- Audit trail for all epoch operations

### Benchmarks
- Throughput metrics (permits/sec, receipts/sec)
- Latency distribution charts
- Benchmark history and comparison
- Upload external benchmark results
- PDF report generation

### Administration
- User management (RBAC: admin/auditor/viewer)
- Audit log viewer
- API key rotation
- FHIR integration settings

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    NGINX (port 80)                  │
│         Static files + API reverse proxy            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐    ┌──────────────────────────┐  │
│  │   React UI   │    │     Express API          │  │
│  │   (Vite)     │    │     (port 3001)          │  │
│  │              │    │                          │  │
│  │  - Dashboard │    │  - /api/permits          │  │
│  │  - Receipts  │    │  - /api/receipts         │  │
│  │  - Chain     │    │  - /api/chain            │  │
│  │  - Revoke    │    │  - /api/epoch            │  │
│  │  - Benchmarks│    │  - /api/fhir/*           │  │
│  │  - Admin     │    │                          │  │
│  └──────────────┘    └──────────────────────────┘  │
│                              │                      │
├──────────────────────────────┼──────────────────────┤
│                              ▼                      │
│  ┌──────────────┐    ┌──────────────┐              │
│  │   MongoDB    │    │    Redis     │              │
│  │  (port 27017)│    │  (port 6379) │              │
│  │              │    │              │              │
│  │  - permits   │    │  - sessions  │              │
│  │  - receipts  │    │  - cache     │              │
│  │  - epochs    │    │              │              │
│  │  - users     │    │              │              │
│  └──────────────┘    └──────────────┘              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/permits/issue | Issue new consent permit |
| POST | /api/receipts/generate | Generate HMAC-signed receipt |
| POST | /api/receipts/verify | Verify single receipt signature |
| GET | /api/receipts/search | Search receipts with filters |
| POST | /api/chain/verify | Verify full chain for subject |
| GET | /api/epoch/current | Get current epoch info |
| POST | /api/epoch/bump | Bump epoch (mass revoke) |
| GET | /api/metrics | System metrics for monitoring |
| GET | /api/fhir/metadata | FHIR capability statement |
| GET | /api/fhir/Consent | Export consents in FHIR R4 |
| GET | /api/fhir/AuditEvent | Export receipts as FHIR audit events |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| HMAC_SECRET | (required) | 32-char HMAC signing key |
| JWT_SECRET | (required) | JWT signing key |
| MONGO_URI | mongodb://localhost:27017/cdt | MongoDB connection |
| DEMO_MODE | false | Enable demo mode with seed data |
| PORT | 3001 | API server port |

## Production Deployment

1. Set secure secrets:
```bash
export HMAC_SECRET=$(openssl rand -hex 16)
export JWT_SECRET=$(openssl rand -hex 32)
```

2. Disable demo mode:
```bash
export DEMO_MODE=false
```

3. Deploy:
```bash
docker compose -f docker-compose.prod.yml up -d
```

## FHIR Integration

The dashboard exports consent data in FHIR R4 format for integration with Epic, Cerner, and other EHR systems.

### Supported Resources
- **Consent** - CDT permits mapped to FHIR Consent resources
- **AuditEvent** - CDT receipts mapped to FHIR AuditEvent resources

### Configuration
1. Navigate to Admin > Settings
2. Enable FHIR Export
3. Configure EHR FHIR server URL
4. Test connection

## License

Proprietary - FinalBoss Tech / 805 AI
