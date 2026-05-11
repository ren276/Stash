import React, { useState, useLayoutEffect, useRef } from 'react'
import { db } from '../lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import gsap from 'gsap'
import { Link2, Trash2, ExternalLink, Plus, Globe, Shield, User, Folder } from 'lucide-react'

interface LinkItem {
    id?: number
    label: string
    url: string
    category: string
}

const CATEGORY_ICONS: Record<string, any> = {
    Social: User,
    Professional: Shield,
    Portfolio: Globe,
    Resource: Folder,
    Other: Link2
}

export const LinkManager: React.FC = () => {
    const links = useLiveQuery(() => db.links.reverse().sortBy('createdAt')) || []
    const [newLink, setNewLink] = useState({ title: '', url: '', category: 'Social' })
    const [adding, setAdding] = useState(false)
    const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
    const [, setError] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if (links.length > 0 && containerRef.current) {
            gsap.fromTo(containerRef.current.children, 
                { opacity: 0, scale: 0.9, y: 15 },
                { opacity: 1, scale: 1, y: 0, stagger: 0.05, duration: 0.5, ease: 'power3.out' }
            )
        }
    }, [links.length])

    const normalizeUrl = (url: string) => {
        let trimmed = url.trim()
        if (!trimmed) return ''
        if (!/^https?:\/\//i.test(trimmed)) {
            return `https://${trimmed}`
        }
        return trimmed
    }

    const addLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setAdding(true)
        setError(null)

        try {
            const normalizedUrl = normalizeUrl(newLink.url)
            if (!normalizedUrl) {
                setError('Please enter a valid URL.')
                setAdding(false)
                return
            }

            await db.links.add({
                label: newLink.title,
                url: normalizedUrl,
                category: newLink.category,
                createdAt: new Date().toISOString()
            })

            setNewLink({ title: '', url: '', category: 'Social' })
        } catch (err: any) {

            setError(err.message || 'Failed to add link.')
        } finally {
            setAdding(false)
        }
    }

    const updateLink = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingLink || !editingLink.id) return

        setAdding(true)
        setError(null)

        try {
            const normalizedUrl = normalizeUrl(newLink.url)
            await db.links.update(editingLink.id, {
                label: newLink.title,
                url: normalizedUrl,
                category: newLink.category
            })
            setEditingLink(null)
            setNewLink({ title: '', url: '', category: 'Social' })
        } catch (err: any) {
            setError('Update failed.')
        } finally {
            setAdding(false)
        }
    }

    const startEditing = (link: any) => {
        setEditingLink(link)
        setNewLink({ title: link.label, url: link.url, category: link.category })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const deleteLink = async (id?: number) => {
        if (id && confirm('Delete this link?')) await db.links.delete(id)
    }

    return (
        <div className="space-y-10">
            {/* Glass Form */}
            <div className={`glass-morphism rounded-3xl p-8 border transition-all duration-500 overflow-hidden ${editingLink ? 'border-blue-500/30' : 'border-white/5'}`}>
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-widest text-white/80">
                            {editingLink ? 'Edit Link' : 'Add New Link'}
                        </h2>
                        <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mt-1">
                             {editingLink ? 'Updating existing resource' : 'Expand your professional stash'}
                        </p>
                    </div>
                    {editingLink && (
                        <button onClick={() => setEditingLink(null)} className="text-[10px] font-black text-neutral-500 hover:text-white tracking-widest uppercase bg-white/5 px-3 py-1.5 rounded-lg transition">Cancel</button>
                    )}
                </header>

                <form onSubmit={editingLink ? updateLink : addLink} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Label</label>
                            <input
                                placeholder="e.g. Portfolio"
                                className="w-full bg-white/5 border border-white/5 p-3.5 rounded-2xl focus:border-blue-500/50 focus:bg-white/10 outline-none transition text-sm text-white font-bold"
                                value={newLink.title}
                                onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Target URL</label>
                            <input
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/5 p-3.5 rounded-2xl focus:border-blue-500/50 focus:bg-white/10 outline-none transition text-sm text-white font-bold"
                                value={newLink.url}
                                onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Category</label>
                            <select
                                className="w-full bg-white/5 border border-white/5 p-3.5 rounded-2xl focus:border-blue-500/50 focus:bg-white/10 outline-none transition text-sm text-white font-bold appearance-none"
                                value={newLink.category}
                                onChange={e => setNewLink({ ...newLink, category: e.target.value })}
                            >
                                <option className="bg-neutral-900">Social</option>
                                <option className="bg-neutral-900">Professional</option>
                                <option className="bg-neutral-900">Portfolio</option>
                                <option className="bg-neutral-900">Resource</option>
                                <option className="bg-neutral-900">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            disabled={adding}
                            className={`px-10 py-3.5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-2 ${editingLink ? 'bg-white text-black hover:scale-105' : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20'} disabled:opacity-50`}
                        >
                            {adding ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
                            <span>{editingLink ? 'Update Entry' : 'Stash Link'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Links Grid */}
            <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {links.map(link => {
                    const Icon = CATEGORY_ICONS[link.category] || Link2
                    return (
                        <div key={link.id} className="group p-6 glass-card rounded-3xl hover:border-white/20 transition-all duration-300 relative flex flex-col justify-between overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 bg-blue-500/5 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-700" />
                             
                             <div>
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition duration-300">
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0 duration-300">
                                        <button onClick={() => startEditing(link)} className="p-2.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-xl transition"><ExternalLink size={14} className="rotate-45" /></button>
                                        <a href={link.url} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-xl transition"><ExternalLink size={14} /></a>
                                        <button onClick={() => deleteLink(link.id)} className="p-2.5 bg-white/5 hover:bg-red-500/10 text-neutral-400 hover:text-red-500 rounded-xl transition"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <h3 className="font-black text-lg text-white/90 leading-tight mb-1">{link.label}</h3>
                                <p className="text-neutral-500 text-xs truncate max-w-full font-medium">{link.url.replace(/^https?:\/\//, '')}</p>
                             </div>

                            <div className="mt-8 flex items-center">
                                <span className="px-3 py-1.5 bg-white/5 text-neutral-500 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl border border-white/5">
                                    {link.category}
                                </span>
                            </div>
                        </div>
                    )
                })}

                {links.length === 0 && (
                    <div className="col-span-full py-24 glass-morphism border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-neutral-600">
                        <Link2 size={64} className="mb-4 opacity-5 animate-float" />
                        <p className="font-black text-neutral-500 uppercase tracking-widest text-xs">No entries found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
