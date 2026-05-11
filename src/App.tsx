import { useEffect, useState } from 'react'
import { db } from './lib/db'
import { Layout, Link as LinkIcon, FileText, Briefcase, ExternalLink, Settings } from 'lucide-react'

function App() {
  const [stats, setStats] = useState({ links: 0, snippets: 0, jobs: 0 })

  useEffect(() => {
    const loadStats = async () => {
      const links = await db.links.count()
      const snippets = await db.snippets.count()
      const jobs = await db.jobs.count()
      setStats({ links, snippets, jobs })
    }
    loadStats()
  }, [])

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className="w-[320px] bg-neutral-950 text-white font-sans overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 backdrop-blur-md">
        <img src="/logo.png" alt="Stash Logo" className="h-6 object-contain" />
        <button 
          onClick={() => openOptions()}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <StatCard icon={<LinkIcon size={14} />} label="Links" count={stats.links} color="text-blue-500" />
        <StatCard icon={<FileText size={14} />} label="Snippets" count={stats.snippets} color="text-purple-500" />
        <StatCard icon={<Briefcase size={14} />} label="Jobs" count={stats.jobs} color="text-emerald-500" />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-6 space-y-2">
        <ActionButton 
          icon={<Layout size={16} />} 
          label="Open Dashboard" 
          onClick={() => openOptions()} 
          primary
        />
        <p className="text-[10px] text-center text-neutral-500 mt-4">
          Stash is running in local-first mode. Data is saved to IndexedDB.
        </p>
      </div>
    </div>
  )
}

function StatCard({ icon, label, count, color }: { icon: React.ReactNode, label: string, count: number, color: string }) {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800 p-3 rounded-2xl text-center hover:border-neutral-700 transition-colors">
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <div className="text-lg font-black leading-tight">{count}</div>
      <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">{label}</div>
    </div>
  )
}

function ActionButton({ icon, label, onClick, primary = false }: { icon: React.ReactNode, label: string, onClick: () => void, primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center space-x-2 p-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
        primary 
          ? 'bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/5' 
          : 'bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-800'
      }`}
    >
      {icon}
      <span>{label}</span>
      {primary && <ExternalLink size={12} className="opacity-50" />}
    </button>
  )
}

export default App
