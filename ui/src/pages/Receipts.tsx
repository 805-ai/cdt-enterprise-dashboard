import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import DataTable from '../components/DataTable'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface Receipt {
  id: string
  permitId: string
  subjectId: string
  action: string
  timestamp: string
  signature: string
  prevHash: string
  epochId: string
  status: 'valid' | 'revoked' | 'pending'
}

// Demo receipts
const demoReceipts: Receipt[] = Array.from({ length: 50 }, (_, i) => ({
  id: `r_${Math.random().toString(36).substring(2, 10)}`,
  permitId: `p_${Math.random().toString(36).substring(2, 10)}`,
  subjectId: `subj_${1000 + i}`,
  action: ['read', 'write', 'share', 'delete'][Math.floor(Math.random() * 4)],
  timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  signature: `sig_${Math.random().toString(36).substring(2, 20)}...`,
  prevHash: i === 0 ? 'genesis' : `hash_${Math.random().toString(36).substring(2, 12)}`,
  epochId: '2024-001',
  status: Math.random() > 0.1 ? 'valid' : 'revoked',
}))

async function fetchReceipts(params: { status?: string; subjectId?: string }) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.subjectId) query.set('subjectId', params.subjectId)

  const res = await fetch(`${API_BASE}/receipts/search?${query}`)
  if (!res.ok) return demoReceipts
  return res.json()
}

export default function Receipts() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)

  const { data: receipts = demoReceipts, isLoading } = useQuery({
    queryKey: ['receipts', statusFilter],
    queryFn: () => fetchReceipts({ status: statusFilter }),
  })

  const columns = [
    {
      key: 'id',
      header: 'Receipt ID',
      render: (item: Receipt) => (
        <span className="font-mono text-xs text-gray-900 dark:text-white">{item.id}</span>
      ),
    },
    {
      key: 'subjectId',
      header: 'Subject',
      render: (item: Receipt) => (
        <span className="font-mono text-xs">{item.subjectId}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (item: Receipt) => (
        <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs font-medium">
          {item.action}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (item: Receipt) => (
        <span className="text-gray-600 dark:text-gray-300 text-xs">
          {new Date(item.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Receipt) => (
        <span
          className={
            item.status === 'valid'
              ? 'status-valid'
              : item.status === 'revoked'
              ? 'status-revoked'
              : 'status-pending'
          }
        >
          {item.status === 'valid' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
          {item.status === 'revoked' && <XCircleIcon className="w-3 h-3 mr-1" />}
          {item.status}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Receipt Explorer
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Search and verify consent receipts
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </button>
          <button className="btn-primary flex items-center gap-2">
            <DocumentDuplicateIcon className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="valid">Valid</option>
            <option value="revoked">Revoked</option>
            <option value="pending">Pending</option>
          </select>
          <input
            type="text"
            placeholder="Subject ID..."
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white"
          />
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={receipts}
        columns={columns}
        searchable
        searchPlaceholder="Search by ID, subject, or action..."
        pageSize={15}
        onRowClick={setSelectedReceipt}
      />

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Receipt Details
              </h2>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Receipt ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {selectedReceipt.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Permit ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {selectedReceipt.permitId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {selectedReceipt.subjectId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Action</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {selectedReceipt.action}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Epoch</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {selectedReceipt.epochId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <span
                    className={
                      selectedReceipt.status === 'valid'
                        ? 'status-valid'
                        : selectedReceipt.status === 'revoked'
                        ? 'status-revoked'
                        : 'status-pending'
                    }
                  >
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Signature</p>
                <p className="font-mono text-xs bg-gray-100 dark:bg-slate-700 p-3 rounded-lg break-all text-gray-900 dark:text-white">
                  {selectedReceipt.signature}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Previous Hash</p>
                <p className="font-mono text-xs bg-gray-100 dark:bg-slate-700 p-3 rounded-lg text-gray-900 dark:text-white">
                  {selectedReceipt.prevHash}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="btn-primary flex-1">Verify Signature</button>
                <button className="btn-secondary flex-1">View Chain</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
