# CDT Enterprise Dashboard - Architecture

## Information Architecture

```
CDT Enterprise Dashboard
├── Executive Overview (/)
│   ├── Real-time KPI Cards
│   │   ├── Permits/sec
│   │   ├── Receipts/sec
│   │   ├── Verify/sec
│   │   ├── Chain Valid %
│   │   ├── Error Count
│   │   └── Current Epoch
│   ├── Throughput Chart (30-min window)
│   ├── Latency Percentiles (P50/P95/P99)
│   ├── System Health Tiles
│   └── Recent Activity Feed
│
├── Receipt Explorer (/receipts)
│   ├── Search Bar (receipt_id, permit_id, action)
│   ├── Filter Panel
│   │   ├── Date Range
│   │   ├── Epoch
│   │   ├── Action Type
│   │   └── Verification Status
│   ├── Results Table
│   │   ├── Receipt ID
│   │   ├── Permit ID
│   │   ├── Action
│   │   ├── Timestamp
│   │   ├── Epoch
│   │   └── Status
│   └── Receipt Detail Modal
│       ├── Canonical Payload
│       ├── Hash
│       ├── Signature
│       ├── Prev Hash
│       ├── Chain Position
│       └── "Verify Now" Button
│
├── Chain Integrity (/chain)
│   ├── Chain Stats Panel
│   │   ├── Total Length
│   │   ├── Head Hash
│   │   ├── Tail Hash
│   │   ├── Last Verified
│   │   └── Error Count
│   ├── Visual Chain Graph
│   ├── Verification Actions
│   │   ├── Verify Full Chain
│   │   └── Verify Window (start/end)
│   └── Verification Results
│
├── Epoch Control (/revoke)
│   ├── Current Epoch Card
│   ├── Epoch History Timeline
│   ├── Bump Epoch Flow
│   │   ├── Confirmation Dialog
│   │   ├── Reason Input
│   │   └── Authorization
│   └── Post-Revoke Validation
│       └── Failed Receipts List
│
├── Benchmarks (/benchmarks)
│   ├── Upload Benchmark JSON
│   ├── Results Table
│   ├── Performance Charts
│   │   ├── Throughput
│   │   ├── Latency Distribution
│   │   └── Chain Growth
│   └── Export (PDF/CSV)
│
└── Admin (/admin)
    ├── Users & RBAC
    │   ├── User List
    │   ├── Role Assignment
    │   └── Invite User
    ├── Security
    │   ├── API Keys
    │   ├── HMAC Key Rotation
    │   └── JWT Settings
    ├── Audit Log
    │   ├── Event List
    │   ├── Filter by Type
    │   └── Export
    └── Settings
        ├── Retention Policy
        ├── Alerting
        └── Integrations
```

## Component Breakdown

### Core Components
| Component | Purpose |
|-----------|---------|
| `<AppShell>` | Main layout with sidebar, header, theme |
| `<Sidebar>` | Navigation with icons, collapsible |
| `<Header>` | Breadcrumb, search, user menu, theme toggle |
| `<KPICard>` | Metric with value, trend, sparkline |
| `<Chart>` | Recharts-based time series |
| `<DataTable>` | Sortable, filterable, paginated table |
| `<Modal>` | Overlay dialogs |
| `<ConfirmDialog>` | Destructive action confirmation |

### Page-Specific Components
| Component | Page | Purpose |
|-----------|------|---------|
| `<ThroughputChart>` | Overview | Permits/receipts/verify per second |
| `<LatencyChart>` | Overview | P50/P95/P99 visualization |
| `<HealthTile>` | Overview | Service health indicator |
| `<ReceiptSearch>` | Explorer | Search with autocomplete |
| `<ReceiptRow>` | Explorer | Table row with inline actions |
| `<ReceiptDetail>` | Explorer | Full receipt modal |
| `<ChainGraph>` | Chain | Visual hash linkage |
| `<EpochTimeline>` | Revoke | Epoch history |
| `<BumpDialog>` | Revoke | Epoch bump confirmation |
| `<AuditLogEntry>` | Admin | Single audit event |
| `<RoleEditor>` | Admin | RBAC assignment |

## Design System

### Colors (Trust-Forward)
```css
/* Light Mode */
--primary: #0066CC;       /* Healthcare blue */
--success: #10B981;       /* Valid/healthy */
--warning: #F59E0B;       /* Caution */
--error: #EF4444;         /* Invalid/error */
--neutral-50: #F9FAFB;
--neutral-900: #111827;

/* Dark Mode */
--primary: #3B82F6;
--bg: #0F172A;
--surface: #1E293B;
```

### Typography
- Headings: Inter, 600-700 weight
- Body: Inter, 400-500 weight
- Mono: JetBrains Mono (hashes, IDs)
- Sizes: 12/14/16/20/24/32px scale

### Spacing
- Base unit: 4px
- Card padding: 24px
- Section gap: 32px
- Grid gap: 16px

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State**: Zustand
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query

## Accessibility

- WCAG 2.1 AA compliance
- Focus indicators on all interactive elements
- Keyboard navigation for all actions
- Screen reader labels
- Color contrast 4.5:1 minimum
- Reduced motion preference support
