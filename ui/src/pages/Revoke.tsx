import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  NoSymbolIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface Epoch {
  id: string
  startedAt: string
  endedAt?: string
  receiptsCount: number
  status: 'active' | 'closed'
}

const demoEpochs: Epoch[] = [
  {
    id: '2024-001',
    startedAt: '2024-01-15T00:00:00Z',
    receiptsCount: 47000,
    status: 'active',
  },
  {
    id: '2023-012',
    startedAt: '2023-12-01T00:00:00Z',
    endedAt: '2024-01-14T23:59:59Z',
    receiptsCount: 38500,
    status: 'closed',
  },
  {
    id: '2023-011',
    startedAt: '2023-11-01T00:00:00Z',
    endedAt: '2023-11-30T23:59:59Z',
    receiptsCount: 41200,
    status: 'closed',
  },
]

export default function Revoke() {
  const [epochs, setEpochs] = useState(demoEpochs)
  const [showConfirm, setShowConfirm] = useState(false)
  const [bumpReason, setBumpReason] = useState('')
  const [bumping, setBumping] = useState(false)

  const currentEpoch = epochs.find((e) => e.status === 'active')

  const handleBumpEpoch = async () => {
    setBumping(true)
    // Simulate epoch bump
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newEpochId = `2024-${String(parseInt(currentEpoch!.id.split('-')[1]) + 1).padStart(3, '0')}`

    setEpochs((prev) => [
      {
        id: newEpochId,
        startedAt: new Date().toISOString(),
        receiptsCount: 0,
        status: 'active',
      },
      ...prev.map((e) =>
        e.status === 'active'
          ? { ...e, status: 'closed' as const, endedAt: new Date().toISOString() }
          : e
      ),
    ])

    setBumping(false)
    setShowConfirm(false)
    setBumpReason('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Epoch Control
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage consent epochs and mass revocation
          </p>
        </div>
      </div>

      {/* Current Epoch Card */}
      {currentEpoch && (
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary-100 dark:bg-primary-900/40 rounded-xl">
                <ClockIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                  Current Epoch
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                  {currentEpoch.id}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Started {new Date(currentEpoch.startedAt).toLocaleDateString()} •{' '}
                  {currentEpoch.receiptsCount.toLocaleString()} receipts
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium
                         flex items-center gap-2 transition-colors"
            >
              <NoSymbolIcon className="w-5 h-5" />
              Bump Epoch
            </button>
          </div>
        </div>
      )}

      {/* Warning Card */}
      <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="flex gap-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
              Epoch Bump Warning
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Bumping the epoch will invalidate all receipts issued in the current epoch.
              This action cannot be undone. All {currentEpoch?.receiptsCount.toLocaleString()}{' '}
              receipts will be marked as revoked immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Epoch History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Epoch History
        </h3>
        <div className="space-y-3">
          {epochs.map((epoch) => (
            <div
              key={epoch.id}
              className={`p-4 rounded-xl border ${
                epoch.status === 'active'
                  ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-700/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {epoch.status === 'active' ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  )}
                  <div>
                    <p className="font-mono font-medium text-gray-900 dark:text-white">
                      {epoch.id}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(epoch.startedAt).toLocaleDateString()}
                      {epoch.endedAt && ` - ${new Date(epoch.endedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {epoch.receiptsCount.toLocaleString()} receipts
                    </p>
                    <span
                      className={`text-xs ${
                        epoch.status === 'active'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {epoch.status === 'active' ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  {epoch.status === 'closed' && (
                    <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Epoch Bump
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This will immediately revoke all{' '}
                <span className="font-bold">
                  {currentEpoch?.receiptsCount.toLocaleString()}
                </span>{' '}
                receipts in epoch{' '}
                <span className="font-mono font-bold">{currentEpoch?.id}</span>.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for revocation (required)
                </label>
                <textarea
                  value={bumpReason}
                  onChange={(e) => setBumpReason(e.target.value)}
                  placeholder="e.g., Security incident, Policy update, Compliance requirement..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                             bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="btn-secondary flex-1"
                  disabled={bumping}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBumpEpoch}
                  disabled={!bumpReason.trim() || bumping}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400
                             text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {bumping ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Bumping...
                    </>
                  ) : (
                    <>
                      <NoSymbolIcon className="w-4 h-4" />
                      Confirm Bump
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
