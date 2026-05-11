import React, { useState, useLayoutEffect, useRef } from 'react'
import { LinkManager } from './components/LinkManager'
import { SnippetManager } from './components/SnippetManager'
import { JobTracker } from './components/JobTracker'
import { Link2, FileText, Briefcase, Settings, Trash2, Database, ShieldCheck } from 'lucide-react'
import { db } from './lib/db'
import { BackupSchema } from './lib/schemas'
import gsap from 'gsap'
import logo from '../public/logo.png'
import './index.css'

type Tab = 'links' | 'snippets' | 'jobs' | 'settings'

const TAB_META: Record<Tab, { label: string; Icon: React.FC<{ size: number }>; color: string; description: string }> = {
    links: {
        label: 'Links',
        Icon: Link2,
        color: 'blue',
        description: 'Core professional links and resources.'
    },
    snippets: {
        label: 'Snippets',
        Icon: FileText,
        color: 'emerald',
        description: 'Reusable text context for applications.'
    },
    jobs: {
        label: 'Tracker',
        Icon: Briefcase,
        color: 'violet',
        description: 'Manage your active job opportunities.'
    },
    settings: {
        label: 'System',
        Icon: Settings,
        color: 'neutral',
        description: 'Global data and privacy controls.'
    }
}

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('links')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const sidebarRef = useRef<HTMLElement>(null)

    useLayoutEffect(() => {
        gsap.from('.dashboard-header', {
            y: -20,
            opacity: 0,
            duration: 1,
            ease: 'expo.out'
        })
    }, [])

    useLayoutEffect(() => {
        if (contentRef.current) {
            gsap.fromTo(contentRef.current, 
                { opacity: 0, y: 10, scale: 0.98 }, 
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
            )
        }
    }, [activeTab])



    const handleLocalExport = async () => {
        try {
            const links = await db.links.toArray()
            const snippets = await db.snippets.toArray()
            const jobs = await db.jobs.toArray()
            const backup = { version: 1, links, snippets, jobs, exportedAt: new Date().toISOString() }
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `stash_backup_${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
            setSuccess('Exported successfully!')
        } catch (err: any) {
            setError('Export failed: ' + err.message)
        }
    }

    const handleLocalImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!confirm('Importing will OVERWRITE all current data. Are you sure?')) return
        const reader = new FileReader()
        reader.onload = async () => {
            try {
                const data = JSON.parse(reader.result as string)
                const validated = BackupSchema.parse(data)
                await db.transaction('rw', db.links, db.snippets, db.jobs, async () => {
                    await db.links.clear(); await db.snippets.clear(); await db.jobs.clear()
                    await db.links.bulkAdd(validated.links); await db.snippets.bulkAdd(validated.snippets); await db.jobs.bulkAdd(validated.jobs)
                })
                setSuccess('Imported successfully! Please refresh.'); setTimeout(() => window.location.reload(), 1500)
            } catch (err: any) {
                setError('Import failed: Invalid format.')
            }
        }
        reader.readAsText(file)
    }

    const handleReset = async () => {
        if (!confirm('Are you ABSOLUTELY sure? This will delete all data.')) return
        await db.transaction('rw', db.links, db.snippets, db.jobs, async () => {
            await db.links.clear(); await db.snippets.clear(); await db.jobs.clear()
        })
        setSuccess('All data cleared.'); setTimeout(() => window.location.reload(), 1000)
    }

    return (
        <div className="flex min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-hidden">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <aside ref={sidebarRef} className="w-72 p-8 flex flex-col fixed h-full z-20">
                <div className="bg-[#0f0f0f] rounded-[40px] h-full flex flex-col border border-white/10 shadow-2xl relative">
                    <div className="p-6 flex-1 overflow-y-auto clean-scrollbar">
                         <div className="flex items-center gap-3 mb-10 px-4 cursor-default shrink-0">
                            <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-white/10">
                                <img src={logo} alt="Stash Logo" className="w-full h-full object-cover scale-110" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tighter leading-none">STASH</h1>
                                <p className="text-[10px] font-black text-neutral-500 tracking-[0.2em] mt-1">V2.0</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {(Object.entries(TAB_META) as [Tab, typeof TAB_META[Tab]][]).map(([key, meta]) => (
                                <button
                                    key={key}
                                    onClick={() => { setActiveTab(key); setError(null); setSuccess(null); }}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group border ${
                                        activeTab === key
                                            ? 'bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.15)] scale-[1.02]'
                                            : 'text-white/70 hover:text-white hover:bg-white/5 border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                        activeTab === key ? 'bg-black text-white' : 'bg-white/5 group-hover:bg-white/10'
                                    }`}>
                                        <meta.Icon size={16} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">{meta.label}</p>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-8 border-t border-white/5 bg-black/20 shrink-0">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500">
                                    <ShieldCheck size={16} />
                                </div>
                                <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Local-First</p>
                            </div>
                            <p className="text-[10px] text-neutral-500 font-bold leading-relaxed">Your data is stored locally and never leaves this device.</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 ml-72 p-12 relative z-10 h-screen overflow-y-auto">
                <header className="dashboard-header flex justify-between items-end mb-12 max-w-6xl mx-auto">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]" />
                             <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">{TAB_META[activeTab].description}</p>
                        </div>
                        <h2 className="text-6xl font-black tracking-tighter uppercase">
                            {TAB_META[activeTab].label}
                        </h2>
                    </div>
                </header>

                <div ref={contentRef} className="max-w-6xl mx-auto pb-24">
                    {activeTab === 'links' && <LinkManager />}
                    {activeTab === 'snippets' && <SnippetManager />}
                    {activeTab === 'jobs' && <JobTracker />}
                    


                    {activeTab === 'settings' && (
                        <div className="space-y-10 max-w-3xl">
                            <div className="bg-neutral-900/40 backdrop-blur-2xl rounded-[40px] p-12 border border-white/5">
                                <header className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-neutral-400"><Database size={24} /></div>
                                    <h3 className="text-2xl font-black tracking-tight uppercase">Core Data</h3>
                                </header>
                                {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest mb-6">{error}</div>}
                                {success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-6">{success}</div>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Export Protocol</p>
                                        <p className="text-sm font-bold text-white/80 mb-8 leading-relaxed">Generate a portable JSON manifest of your entire stash.</p>
                                        <button onClick={handleLocalExport} className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition hover:bg-neutral-200">Initialize Export</button>
                                    </div>
                                    <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Import Protocol</p>
                                        <p className="text-sm font-bold text-white/80 mb-8 leading-relaxed">Incorporate external data into your local vault.</p>
                                        <label className="block w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition text-center cursor-pointer">
                                            Select File
                                            <input type="file" accept=".json" className="hidden" onChange={handleLocalImport} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-neutral-900/40 backdrop-blur-2xl rounded-[40px] p-12 border border-red-500/10">
                                <div className="flex items-center gap-4 mb-6 text-red-500/80"><Trash2 size={24} /><h3 className="text-2xl font-black tracking-tight uppercase">Destruction</h3></div>
                                <p className="text-neutral-500 text-sm mb-8 font-medium italic">Purge all local storage and reset application state. This action is irreversible.</p>
                                <button onClick={handleReset} className="px-10 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition">Purge Data Vault</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

const App: React.FC = () => {
    return <Dashboard />
}

import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
