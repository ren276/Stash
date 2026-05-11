import React, { useState, useLayoutEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { db } from './lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link2, FileText, Copy, Search, ExternalLink, Settings, Trash2, Briefcase, ChevronRight } from 'lucide-react'
import gsap from 'gsap'
import logo from '../public/logo.png'
import './index.css'

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'links' | 'snippets' | 'jobs'>('links')
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const links = useLiveQuery(() => db.links.reverse().sortBy('createdAt')) || []
  const snippets = useLiveQuery(() => db.snippets.reverse().sortBy('createdAt')) || []
  const jobs = useLiveQuery(() => db.jobs.reverse().sortBy('timestamp')) || []

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children,
        { opacity: 0, x: -10, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, stagger: 0.03, duration: 0.4, ease: 'power2.out', clearProps: 'all' }
      )
    }
  }, [activeTab, search])

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.openOptionsPage()
    }
  }

  const deleteItem = async (e: React.MouseEvent, type: 'links' | 'snippets' | 'jobs', id: number) => {
    e.stopPropagation()
    e.preventDefault()
    if (type === 'links') {
      await db.links.delete(id)
    } else if (type === 'snippets') {
      await db.snippets.delete(id)
    } else {
      await db.jobs.delete(id)
    }
  }

  const filteredLinks = links.filter(l =>
    l.label?.toLowerCase().includes(search.toLowerCase()) ||
    l.url?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredSnippets = snippets.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.content?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredJobs = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-[420px] h-[600px] bg-neutral-950 text-white flex flex-col font-sans overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-purple-600/10 blur-[80px] rounded-full" />

      <header className="p-5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center shadow-lg overflow-hidden shrink-0 border border-white/10">
            <img src={logo} alt="Stash Logo" className="w-full h-full object-cover scale-110" />
          </div>
          <div>
            <span className="font-black text-base tracking-tight uppercase block leading-none">Stash</span>
            <span className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase mt-0.5">Browser Extension</span>
          </div>
        </div>
        <button 
          onClick={openOptions} 
          className="p-2.5 hover:bg-white/5 rounded-xl transition-all duration-300 text-neutral-500 hover:text-white border border-transparent hover:border-white/10"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Search Section */}
      <div className="px-5 mb-4 z-10">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            autoFocus
            placeholder="Search stashed resources..."
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-blue-500/50 focus:bg-white/[0.08] outline-none transition-all duration-300 placeholder:text-neutral-600"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Premium Tabs */}
      <div className="flex px-5 gap-1 mb-6 z-10">
        {[
          { id: 'links', label: 'Links', icon: Link2, count: filteredLinks.length },
          { id: 'snippets', label: 'Snippets', icon: FileText, count: filteredSnippets.length },
          { id: 'jobs', label: 'Pipeline', icon: Briefcase, count: filteredJobs.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black transition-all duration-300 flex flex-col items-center gap-1.5 border ${
              activeTab === tab.id 
                ? 'bg-white/10 text-white border-white/10 shadow-lg' 
                : 'bg-transparent text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-white/5'
            }`}
          >
            <tab.icon size={14} className={activeTab === tab.id ? 'text-blue-400' : ''} />
            <span className="uppercase tracking-[0.15em]">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3 z-10 scrollbar-hide" ref={containerRef}>
        {activeTab === 'links' ? (
          filteredLinks.length > 0 ? filteredLinks.map(link => (
            <div key={link.id} className="group flex items-center justify-between p-4 glass-card rounded-2xl hover:bg-white/[0.05] transition-all duration-300 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-40 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0 text-blue-400">
                  <Link2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black truncate leading-tight text-white/90 group-hover:text-white transition-colors">{link.label || 'Untitled Link'}</p>
                  <p className="text-[10px] text-neutral-500 truncate mt-1 font-medium">{new URL(link.url).hostname}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <button
                  onClick={(e) => deleteItem(e, 'links', link.id!)}
                  className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => copyToClipboard(link.url, link.id!)}
                  className={`p-2 rounded-lg transition-all ${copiedId === link.id ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          )) : (
            <EmptyState icon={Link2} label="No links stashed" />
          )
        ) : activeTab === 'snippets' ? (
          filteredSnippets.length > 0 ? filteredSnippets.map(snippet => (
            <div key={snippet.id} className="group p-4 glass-card rounded-2xl hover:bg-white/[0.05] transition-all duration-300">
               <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-400">
                        <FileText size={14} />
                    </div>
                    <h3 className="text-sm font-black text-white/90">{snippet.title}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => deleteItem(e, 'snippets', snippet.id!)}
                    className="p-2 text-neutral-500 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => copyToClipboard(snippet.content, snippet.id!)}
                    className={`p-2 rounded-lg transition-all ${copiedId === snippet.id ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed font-medium bg-black/20 p-2 rounded-lg border border-white/5">{snippet.content}</p>
            </div>
          )) : (
            <EmptyState icon={FileText} label="No snippets stashed" />
          )
        ) : (
          filteredJobs.length > 0 ? filteredJobs.map(job => (
            <div key={job.id} className="group flex items-center justify-between p-4 glass-card rounded-2xl hover:bg-white/[0.05] transition-all duration-300">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center shrink-0 text-purple-400">
                  <Briefcase size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black truncate text-white/90 group-hover:text-white transition-colors">{job.title}</p>
                  <p className="text-[10px] text-neutral-500 truncate font-medium mt-0.5">{job.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => deleteItem(e, 'jobs', job.id!)}
                  className="p-2 text-neutral-500 hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          )) : (
            <EmptyState icon={Briefcase} label="Pipeline is empty" />
          )
        )}
      </div>

      {/* Premium Footer */}
      <div className="p-5 bg-neutral-950/80 backdrop-blur-xl border-t border-white/5 mt-auto z-20">
        <button
          onClick={openOptions}
          className="w-full group py-4 bg-white text-black text-xs font-black rounded-2xl transition-all duration-500 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
        >
          <span className="uppercase tracking-[0.2em] ml-2">Enter Dashboard</span>
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

const EmptyState = ({ icon: Icon, label }: { icon: any, label: string }) => (
    <div className="h-64 flex flex-col items-center justify-center text-neutral-700 space-y-4">
        <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center">
            <Icon size={28} className="opacity-20" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest">{label}</p>
    </div>
)

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  )
}
