import React, { useState, useLayoutEffect, useRef } from 'react'
import { db } from '../lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import gsap from 'gsap'
import { FileText, Trash2, Copy, Plus, Tag, Check, Sparkles } from 'lucide-react'

export const SnippetManager: React.FC = () => {
    const snippets = useLiveQuery(() => db.snippets.reverse().sortBy('createdAt')) || []
    const [newSnippet, setNewSnippet] = useState({ title: '', content: '', tags: '' })
    const [copyId, setCopyId] = useState<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if (snippets.length > 0 && containerRef.current) {
            gsap.fromTo(containerRef.current.children, 
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, stagger: 0.05, duration: 0.6, ease: 'expo.out' }
            )
        }
    }, [snippets.length])

    const addSnippet = async (e: React.FormEvent) => {
        e.preventDefault()
        await db.snippets.add({
            title: newSnippet.title,
            content: newSnippet.content,
            tags: newSnippet.tags.split(',').map(t => t.trim()).filter(Boolean),
            createdAt: new Date().toISOString()
        })
        setNewSnippet({ title: '', content: '', tags: '' })
    }

    const deleteSnippet = async (id?: number) => {
        if (id && confirm('Delete this snippet?')) await db.snippets.delete(id)
    }

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text)
        setCopyId(id)
        setTimeout(() => setCopyId(null), 2000)
    }

    return (
        <div className="space-y-10">
            {/* Glass Creator */}
            <div className="glass-morphism border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-24 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-700" />
                
                <header className="relative z-10 mb-8">
                    <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <Plus size={20} className="text-emerald-500" />
                        </div>
                        CREATE SNIPPET
                    </h2>
                    <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 ml-14">Store your reusable context</p>
                </header>

                <form onSubmit={addSnippet} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Title</label>
                            <input
                                placeholder="e.g. Executive Summary"
                                className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl focus:border-emerald-500/50 focus:bg-white/10 outline-none text-sm transition text-white font-bold"
                                value={newSnippet.title}
                                onChange={e => setNewSnippet({ ...newSnippet, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Tags</label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                                <input
                                    placeholder="Work, Bio, etc."
                                    className="w-full bg-white/5 border border-white/5 p-4 pl-12 rounded-2xl focus:border-emerald-500/50 focus:bg-white/10 outline-none text-sm transition text-white font-bold"
                                    value={newSnippet.tags}
                                    onChange={e => setNewSnippet({ ...newSnippet, tags: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Content</label>
                        <textarea
                            placeholder="Drop your text here..."
                            rows={5}
                            className="w-full bg-white/5 border border-white/5 p-5 rounded-3xl focus:border-emerald-500/50 focus:bg-white/10 outline-none text-sm transition resize-none text-neutral-300 leading-relaxed font-medium"
                            value={newSnippet.content}
                            onChange={e => setNewSnippet({ ...newSnippet, content: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex justify-end items-center gap-4">
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition shadow-xl shadow-emerald-900/20 active:scale-95 flex items-center gap-2">
                             <Sparkles size={16} /> Save Snippet
                        </button>
                    </div>
                </form>
            </div>

            {/* Snippets Grid */}
            <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {snippets.map(snippet => (
                    <div key={snippet.id} className="group p-8 glass-card rounded-[32px] hover:border-emerald-500/20 transition-all duration-300 relative flex flex-col h-full overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 bg-emerald-500/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500" />
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center space-x-4 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/10">
                                    <FileText className="text-emerald-500 w-6 h-6" />
                                </div>
                                <h3 className="font-black text-lg text-white/90 truncate tracking-tight">{snippet.title}</h3>
                            </div>
                            <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0 duration-300">
                                <button 
                                    onClick={() => copyToClipboard(snippet.content, snippet.id!)} 
                                    className={`p-3 rounded-xl transition flex items-center gap-2 ${copyId === snippet.id ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'}`}
                                >
                                    {copyId === snippet.id ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                                <button onClick={() => deleteSnippet(snippet.id)} className="p-3 bg-white/5 hover:bg-red-500/10 text-neutral-400 hover:text-red-500 rounded-xl transition"><Trash2 size={14} /></button>
                            </div>
                        </div>

                        <div className="flex-1 bg-white/[0.02] rounded-2xl p-5 mb-6 border border-white/5 overflow-hidden group-hover:border-emerald-500/10 transition relative z-10">
                            <p className="text-neutral-400 text-sm whitespace-pre-wrap leading-relaxed line-clamp-6 font-medium italic">"{snippet.content}"</p>
                        </div>

                        {snippet.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-auto relative z-10">
                                {snippet.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-white/5 text-neutral-500 text-[10px] rounded-xl uppercase font-black tracking-[0.15em] border border-white/5">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
