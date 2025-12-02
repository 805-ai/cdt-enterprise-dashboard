import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

interface HeaderProps {
  onMenuClick: () => void
  darkMode: boolean
  onDarkModeToggle: () => void
}

export default function Header({ onMenuClick, darkMode, onDarkModeToggle }: HeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded-full">
            System Healthy
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Epoch: <span className="font-mono font-medium text-gray-700 dark:text-gray-200">2024-001</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onDarkModeToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <SunIcon className="w-5 h-5 text-gray-300" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative">
          <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="ml-2 flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-slate-700">
          <UserCircleIcon className="w-8 h-8 text-gray-400" />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Compliance Officer</p>
          </div>
        </div>
      </div>
    </header>
  )
}
