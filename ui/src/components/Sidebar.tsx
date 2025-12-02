import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  DocumentTextIcon,
  LinkIcon,
  NoSymbolIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Overview', href: '/overview', icon: HomeIcon },
  { name: 'Receipt Explorer', href: '/receipts', icon: DocumentTextIcon },
  { name: 'Chain Integrity', href: '/chain', icon: LinkIcon },
  { name: 'Epoch Control', href: '/revoke', icon: NoSymbolIcon },
  { name: 'Benchmarks', href: '/benchmarks', icon: ChartBarIcon },
  { name: 'Admin', href: '/admin', icon: CogIcon },
]

export default function Sidebar({ open }: SidebarProps) {
  return (
    <aside
      className={`${
        open ? 'w-64' : 'w-20'
      } bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700
         transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-700">
        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
          <ShieldCheckIcon className="w-5 h-5 text-white" />
        </div>
        {open && (
          <div className="ml-3">
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
              FinalBoss Trust
            </span>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">Consent Data Trail</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
               ${
                 isActive
                   ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                   : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700'
               }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {open && <span className="ml-3">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Version & Branding */}
      {open && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
          {/* Patent Badge */}
          <div className="px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-amber-500 rounded flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">P</span>
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                PATENT PENDING
              </span>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1 leading-tight">
              HMAC-Chained Cryptographic Consent Receipts
            </p>
          </div>

          {/* Version */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">CDT Engine</span>
            <span className="font-mono font-medium text-gray-700 dark:text-gray-300">v2.1.0</span>
          </div>

          {/* Company */}
          <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-violet-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">805</span>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-600 dark:text-gray-300">805 AI / FinalBoss Tech</p>
                <p className="text-[9px] text-gray-400 dark:text-gray-500">Enterprise Healthcare Solutions</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
