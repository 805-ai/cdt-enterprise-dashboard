import { useState } from 'react'
import {
  ChartBarIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  BoltIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

interface BenchmarkResult {
  id: string
  name: string
  timestamp: string
  receiptsCount: number
  permitThroughput: number
  receiptThroughput: number
  p50: number
  p95: number
  p99: number
  chainVerifyMs: number
  signatureVerifyMs: number
}

const demoBenchmarks: BenchmarkResult[] = [
  {
    id: 'bench_001',
    name: 'Production Load Test',
    timestamp: new Date().toISOString(),
    receiptsCount: 50000,
    permitThroughput: 25420,
    receiptThroughput: 12830,
    p50: 8,
    p95: 24,
    p99: 45,
    chainVerifyMs: 2.3,
    signatureVerifyMs: 0.8,
  },
  {
    id: 'bench_002',
    name: 'Stress Test',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    receiptsCount: 100000,
    permitThroughput: 22100,
    receiptThroughput: 11500,
    p50: 12,
    p95: 32,
    p99: 58,
    chainVerifyMs: 2.8,
    signatureVerifyMs: 0.9,
  },
  {
    id: 'bench_003',
    name: 'Baseline',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    receiptsCount: 10000,
    permitThroughput: 28000,
    receiptThroughput: 14200,
    p50: 6,
    p95: 18,
    p99: 35,
    chainVerifyMs: 1.9,
    signatureVerifyMs: 0.7,
  },
]

const throughputData = [
  { name: '10K', permits: 28000, receipts: 14200 },
  { name: '25K', permits: 26500, receipts: 13500 },
  { name: '50K', permits: 25420, receipts: 12830 },
  { name: '75K', permits: 23800, receipts: 12100 },
  { name: '100K', permits: 22100, receipts: 11500 },
]

const latencyTrend = [
  { run: 1, p50: 6, p95: 18, p99: 35 },
  { run: 2, p50: 7, p95: 20, p99: 38 },
  { run: 3, p50: 8, p95: 24, p99: 45 },
  { run: 4, p50: 9, p95: 26, p99: 48 },
  { run: 5, p50: 8, p95: 24, p99: 45 },
]

export default function Benchmarks() {
  const [benchmarks] = useState(demoBenchmarks)
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkResult | null>(
    demoBenchmarks[0]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Performance Benchmarks
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Throughput and latency metrics for CDT Engine
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <ArrowUpTrayIcon className="w-4 h-4" />
            Upload Results
          </button>
          <button className="btn-primary flex items-center gap-2">
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Latest Benchmark KPIs */}
      {selectedBenchmark && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <BoltIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Permit Throughput
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedBenchmark.permitThroughput.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">ops/sec</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <CpuChipIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Receipt Throughput
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedBenchmark.receiptThroughput.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">ops/sec</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <ClockIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">P50 Latency</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedBenchmark.p50}ms
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">median response</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <ClockIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">P99 Latency</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedBenchmark.p99}ms
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">tail response</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throughput by Volume */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Throughput vs Volume
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={throughputData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
              />
              <Bar dataKey="permits" fill="#3B82F6" name="Permits/sec" radius={[4, 4, 0, 0]} />
              <Bar dataKey="receipts" fill="#10B981" name="Receipts/sec" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Latency Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Latency Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="run" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} unit="ms" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
              />
              <Line
                type="monotone"
                dataKey="p50"
                stroke="#10B981"
                name="P50"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="p95"
                stroke="#F59E0B"
                name="P95"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="p99"
                stroke="#EF4444"
                name="P99"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Benchmark History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Benchmark History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Volume
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Permit/s
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Receipt/s
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  P50
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  P99
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {benchmarks.map((bench) => (
                <tr
                  key={bench.id}
                  onClick={() => setSelectedBenchmark(bench)}
                  className={`cursor-pointer transition-colors ${
                    selectedBenchmark?.id === bench.id
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {bench.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(bench.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">
                    {bench.receiptsCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400">
                    {bench.permitThroughput.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-green-600 dark:text-green-400">
                    {bench.receiptThroughput.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">
                    {bench.p50}ms
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">
                    {bench.p99}ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
