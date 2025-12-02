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
        <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
        {open && (
          <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
            CDT Enterprise
          </span>
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

      {/* Version */}
      {open && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            CDT Engine v2.1.0
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Enterprise Edition
          </p>
        </div>
      )}
    </aside>
  )
}
