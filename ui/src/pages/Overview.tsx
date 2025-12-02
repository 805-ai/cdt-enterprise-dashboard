import { useQuery } from '@tanstack/react-query'
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import KPICard from '../components/KPICard'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics`)
  if (!res.ok) throw new Error('Failed to fetch metrics')
  return res.json()
}

// Demo data for charts
const volumeData = [
  { date: 'Mon', receipts: 4200, permits: 1800 },
  { date: 'Tue', receipts: 3800, permits: 2100 },
  { date: 'Wed', receipts: 5100, permits: 2400 },
  { date: 'Thu', receipts: 4700, permits: 1900 },
  { date: 'Fri', receipts: 5800, permits: 2800 },
  { date: 'Sat', receipts: 3200, permits: 1200 },
  { date: 'Sun', receipts: 2900, permits: 1100 },
]

const latencyData = [
  { time: '00:00', p50: 12, p95: 28, p99: 45 },
  { time: '04:00', p50: 11, p95: 25, p99: 42 },
  { time: '08:00', p50: 15, p95: 32, p99: 58 },
  { time: '12:00', p50: 18, p95: 38, p99: 65 },
  { time: '16:00', p50: 16, p95: 35, p99: 55 },
  { time: '20:00', p50: 14, p95: 30, p99: 48 },
]

const statusData = [
  { name: 'Valid', value: 45230, color: '#10b981' },
  { name: 'Revoked', value: 1240, color: '#ef4444' },
  { name: 'Pending', value: 530, color: '#f59e0b' },
]

export default function Overview() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 30000,
  })

  const kpis = metrics || {
    totalReceipts: 47000,
    validReceipts: 45230,
    revokedReceipts: 1240,
    chainIntegrity: 100,
    avgLatencyMs: 14,
    currentEpoch: '2024-001',
  }

  return (
    <div className="space-y-6">
      {/* FinalBoss Trust Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px'}}></div>
        </div>

        {/* Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

        <div className="relative p-6">
          <div className="flex items-center justify-between flex-wrap gap-6">
            {/* Left - Branding */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <ShieldCheckIcon className="w-9 h-9 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  FinalBoss Trust
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Enterprise Consent Data Trail Platform
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full">
                    PATENT PENDING
                  </span>
                  <span className="text-xs text-slate-500">CDT Engine v2.1.0</span>
                </div>
              </div>
            </div>

            {/* Right - Tech & Company */}
            <div className="flex items-center gap-6">
              {/* Technology */}
              <div className="hidden lg:block text-right pr-6 border-r border-slate-700">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Core Technology</p>
                <p className="text-sm text-slate-300 mt-1">HMAC-Chained Cryptographic Receipts</p>
                <p className="text-xs text-slate-500 mt-0.5">Epoch-Based Mass Revocation</p>
              </div>

              {/* Company Badge */}
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-slate-500 text-right">Developed by</p>
                  <p className="text-sm font-semibold text-white">805 AI</p>
                </div>
                <div className="w-11 h-11 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xs">805</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            System Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Real-time consent data trail monitoring
          </p>
        </div>
        <button className="btn-primary">
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Receipts"
          value={kpis.totalReceipts.toLocaleString()}
          subtitle="All time"
          change={12.5}
          changeLabel="vs last month"
          trend="up"
          color="blue"
          icon={<DocumentTextIcon className="w-6 h-6" />}
        />
        <KPICard
          title="Valid Receipts"
          value={kpis.validReceipts.toLocaleString()}
          subtitle={`${((kpis.validReceipts / kpis.totalReceipts) * 100).toFixed(1)}% of total`}
          change={8.2}
          changeLabel="vs last month"
          trend="up"
          color="green"
          icon={<ShieldCheckIcon className="w-6 h-6" />}
        />
        <KPICard
          title="Avg Latency"
          value={`${kpis.avgLatencyMs}ms`}
          subtitle="P50 response time"
          change={-5.3}
          changeLabel="vs last week"
          trend="up"
          color="blue"
          icon={<ClockIcon className="w-6 h-6" />}
        />
        <KPICard
          title="Chain Integrity"
          value={`${kpis.chainIntegrity}%`}
          subtitle="All chains verified"
          color="green"
          icon={<ShieldCheckIcon className="w-6 h-6" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Receipt Volume (7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
              />
              <Area
                type="monotone"
                dataKey="receipts"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                name="Receipts"
              />
              <Area
                type="monotone"
                dataKey="permits"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                name="Permits"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Latency Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Response Latency (24h)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} unit="ms" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
              />
              <Line type="monotone" dataKey="p50" stroke="#10B981" name="P50" strokeWidth={2} />
              <Line type="monotone" dataKey="p95" stroke="#F59E0B" name="P95" strokeWidth={2} />
              <Line type="monotone" dataKey="p99" stroke="#EF4444" name="P99" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Pie */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Receipt Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {statusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { action: 'Receipt Generated', id: 'r_8f3k2...', time: '2 min ago', status: 'valid' },
              { action: 'Chain Verified', id: 'chain_92f...', time: '5 min ago', status: 'valid' },
              { action: 'Epoch Bumped', id: '2024-001', time: '1 hour ago', status: 'pending' },
              { action: 'Receipt Revoked', id: 'r_4d8n1...', time: '3 hours ago', status: 'revoked' },
              { action: 'Benchmark Run', id: 'bench_7k2...', time: '6 hours ago', status: 'valid' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.status === 'valid'
                        ? 'bg-green-500'
                        : item.status === 'revoked'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {item.id}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
