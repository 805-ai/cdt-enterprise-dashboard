import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface ChainVerification {
  chainId: string
  subjectId: string
  totalReceipts: number
  verified: boolean
  brokenAt?: number
  verifiedAt: string
  hashesValid: boolean
  signaturesValid: boolean
}

// Demo chains
const demoChains: ChainVerification[] = [
  {
    chainId: 'chain_a8f2k9',
    subjectId: 'subj_1001',
    totalReceipts: 156,
    verified: true,
    verifiedAt: new Date().toISOString(),
    hashesValid: true,
    signaturesValid: true,
  },
  {
    chainId: 'chain_b3m7n2',
    subjectId: 'subj_1002',
    totalReceipts: 89,
    verified: true,
    verifiedAt: new Date().toISOString(),
    hashesValid: true,
    signaturesValid: true,
  },
  {
    chainId: 'chain_c9p4x1',
    subjectId: 'subj_1003',
    totalReceipts: 234,
    verified: true,
    verifiedAt: new Date().toISOString(),
    hashesValid: true,
    signaturesValid: true,
  },
  {
    chainId: 'chain_d2q8y5',
    subjectId: 'subj_1004',
    totalReceipts: 67,
    verified: false,
    brokenAt: 45,
    verifiedAt: new Date().toISOString(),
    hashesValid: false,
    signaturesValid: true,
  },
]

export default function Chain() {
  const [verifyingChain, setVerifyingChain] = useState<string | null>(null)
  const [chains, setChains] = useState(demoChains)

  const verifyMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      const res = await fetch(`${API_BASE}/chain/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId }),
      })
      if (!res.ok) throw new Error('Verification failed')
      return res.json()
    },
    onSuccess: (data, subjectId) => {
      setChains((prev) =>
        prev.map((c) =>
          c.subjectId === subjectId
            ? { ...c, verified: true, verifiedAt: new Date().toISOString() }
            : c
        )
      )
      setVerifyingChain(null)
    },
  })

  const handleVerify = (subjectId: string) => {
    setVerifyingChain(subjectId)
    // Simulate verification
    setTimeout(() => {
      setChains((prev) =>
        prev.map((c) =>
          c.subjectId === subjectId
            ? { ...c, verified: true, verifiedAt: new Date().toISOString(), hashesValid: true }
            : c
        )
      )
      setVerifyingChain(null)
    }, 2000)
  }

  const totalChains = chains.length
  const validChains = chains.filter((c) => c.verified).length
  const brokenChains = chains.filter((c) => !c.verified).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chain Integrity
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Verify HMAC-chained receipt integrity
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => chains.forEach((c) => handleVerify(c.subjectId))}
        >
          <ArrowPathIcon className="w-4 h-4" />
          Verify All Chains
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Chains</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalChains}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{validChains}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
            <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Broken</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{brokenChains}</p>
          </div>
        </div>
      </div>

      {/* Chain List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Subject Chains
        </h3>
        <div className="space-y-4">
          {chains.map((chain) => (
            <div
              key={chain.chainId}
              className={`p-4 rounded-xl border ${
                chain.verified
                  ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20'
                  : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      chain.verified
                        ? 'bg-green-100 dark:bg-green-900/40'
                        : 'bg-red-100 dark:bg-red-900/40'
                    }`}
                  >
                    {chain.verified ? (
                      <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {chain.chainId}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Subject: {chain.subjectId} • {chain.totalReceipts} receipts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        chain.verified
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {chain.verified ? 'Verified' : `Broken at receipt #${chain.brokenAt}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(chain.verifiedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleVerify(chain.subjectId)}
                    disabled={verifyingChain === chain.subjectId}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <ArrowPathIcon
                      className={`w-4 h-4 ${
                        verifyingChain === chain.subjectId ? 'animate-spin' : ''
                      }`}
                    />
                    {verifyingChain === chain.subjectId ? 'Verifying...' : 'Re-verify'}
                  </button>
                </div>
              </div>

              {/* Verification Details */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {chain.hashesValid ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Hash Chain {chain.hashesValid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {chain.signaturesValid ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Signatures {chain.signaturesValid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
