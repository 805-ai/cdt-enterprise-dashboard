import { useState } from 'react'
import {
  UserGroupIcon,
  KeyIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'auditor' | 'viewer'
  lastLogin: string
  status: 'active' | 'inactive'
}

interface AuditLog {
  id: string
  user: string
  action: string
  resource: string
  timestamp: string
  ip: string
}

const demoUsers: User[] = [
  {
    id: 'u_001',
    email: 'admin@hospital.org',
    name: 'System Admin',
    role: 'admin',
    lastLogin: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'u_002',
    email: 'compliance@hospital.org',
    name: 'Compliance Officer',
    role: 'auditor',
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    status: 'active',
  },
  {
    id: 'u_003',
    email: 'viewer@hospital.org',
    name: 'Report Viewer',
    role: 'viewer',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    status: 'active',
  },
]

const demoAuditLogs: AuditLog[] = [
  {
    id: 'log_001',
    user: 'admin@hospital.org',
    action: 'EPOCH_BUMP',
    resource: 'epoch/2024-001',
    timestamp: new Date().toISOString(),
    ip: '192.168.1.100',
  },
  {
    id: 'log_002',
    user: 'compliance@hospital.org',
    action: 'CHAIN_VERIFY',
    resource: 'chain/subj_1001',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    ip: '192.168.1.105',
  },
  {
    id: 'log_003',
    user: 'admin@hospital.org',
    action: 'USER_CREATE',
    resource: 'user/u_003',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ip: '192.168.1.100',
  },
  {
    id: 'log_004',
    user: 'compliance@hospital.org',
    action: 'RECEIPT_SEARCH',
    resource: 'receipts?status=revoked',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    ip: '192.168.1.105',
  },
  {
    id: 'log_005',
    user: 'admin@hospital.org',
    action: 'BENCHMARK_UPLOAD',
    resource: 'benchmarks/bench_001',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    ip: '192.168.1.100',
  },
]

const roleColors = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  auditor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'settings'>('users')
  const [users] = useState(demoUsers)
  const [auditLogs] = useState(demoAuditLogs)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Administration
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            User management, audit logs, and system settings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex gap-8">
          {[
            { id: 'users', label: 'Users', icon: UserGroupIcon },
            { id: 'audit', label: 'Audit Log', icon: DocumentTextIcon },
            { id: 'settings', label: 'Settings', icon: KeyIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button className="btn-primary flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Add User
            </button>
          </div>

          <div className="card">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          roleColors[user.role]
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.lastLogin).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          user.status === 'active'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                        <PencilIcon className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="card">
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                    <ShieldCheckIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      <span className="font-mono text-primary-600 dark:text-primary-400">
                        {log.action}
                      </span>{' '}
                      on{' '}
                      <span className="font-mono text-gray-600 dark:text-gray-300">
                        {log.resource}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      by {log.user} from {log.ip}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              API Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HMAC Secret Key
                </label>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value="********************************"
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                               bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
                  />
                  <button className="btn-secondary">Rotate</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  JWT Secret
                </label>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value="********************************"
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                               bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
                  />
                  <button className="btn-secondary">Rotate</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              FHIR Integration
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Enable FHIR Export</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Export consent data in FHIR R4 format
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  FHIR Server URL (Epic/Cerner)
                </label>
                <input
                  type="url"
                  placeholder="https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                             bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="btn-primary">Save Settings</button>
          </div>
        </div>
      )}
    </div>
  )
}
