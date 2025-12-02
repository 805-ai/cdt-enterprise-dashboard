import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Overview from './pages/Overview'
import Receipts from './pages/Receipts'
import Chain from './pages/Chain'
import Revoke from './pages/Revoke'
import Benchmarks from './pages/Benchmarks'
import Admin from './pages/Admin'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex-1 flex flex-col">
            <Header
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              darkMode={darkMode}
              onDarkModeToggle={toggleDarkMode}
            />

            <main className="flex-1 p-6 overflow-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/receipts" element={<Receipts />} />
                <Route path="/chain" element={<Chain />} />
                <Route path="/revoke" element={<Revoke />} />
                <Route path="/benchmarks" element={<Benchmarks />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
