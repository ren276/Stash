import React, { useState, useLayoutEffect, useRef, useEffect } from 'react'
import { db, type Job } from '../lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import gsap from 'gsap'
import {
    Briefcase, ExternalLink, Trash2,
    Building2, ChevronDown, LayoutGrid, List,
    Clock, MapPin, Plus, Calendar, Pencil
} from 'lucide-react'
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDroppable,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Status = 'Interested' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected'
type ViewMode = 'list' | 'board'

interface EditJobModal {
    job: Job;
    onClose: () => void;
    onSave: (updates: Partial<Job>) => void;
}

const JobModal: React.FC<EditJobModal> = ({ job, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: job.title,
        company: job.company,
        location: job.location || '',
        salary: job.salary || '',
        deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
        notes: job.notes || ''
    });

    const modalRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (modalRef.current) {
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.9, y: 30 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power4.out' }
            );
        }
    }, []);

    const handleSave = () => {
        onSave({
            ...formData,
            deadline: formData.deadline || undefined
        });
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <div 
                ref={modalRef}
                className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
                
                <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest">Edit Job Details</h2>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Job Title</label>
                            <input 
                                value={formData.title} 
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Company</label>
                            <input 
                                value={formData.company} 
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Location</label>
                            <input 
                                value={formData.location} 
                                placeholder="Remote, New York..."
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Salary Range</label>
                            <input 
                                value={formData.salary} 
                                placeholder="$120k - $150k"
                                onChange={e => setFormData({ ...formData, salary: e.target.value })}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Application Deadline</label>
                        <input 
                            type="date"
                            value={formData.deadline} 
                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Private Notes</label>
                        <textarea 
                            value={formData.notes} 
                            rows={3}
                            placeholder="Add interview tips, recruiter info..."
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-neutral-400 hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex-1 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-white text-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; ring: string; description: string }> = {
    Interested: {
        label: 'Interested',
        color: '#60a5fa',
        bg: 'rgba(96, 165, 250, 0.1)',
        ring: 'rgba(96, 165, 250, 0.2)',
        description: 'Potential opportunities'
    },
    Applied: {
        label: 'Applied',
        color: '#a78bfa',
        bg: 'rgba(167, 139, 250, 0.1)',
        ring: 'rgba(167, 139, 250, 0.2)',
        description: 'Waiting for response'
    },
    Interviewing: {
        label: 'Interviewing',
        color: '#34d399',
        bg: 'rgba(52, 211, 153, 0.1)',
        ring: 'rgba(52, 211, 153, 0.2)',
        description: 'In progress'
    },
    Offer: {
        label: 'Offer',
        color: '#fbbf24',
        bg: 'rgba(251, 191, 36, 0.1)',
        ring: 'rgba(251, 191, 36, 0.2)',
        description: 'Congratulations!'
    },
    Rejected: {
        label: 'Rejected',
        color: '#f87171',
        bg: 'rgba(248, 113, 113, 0.1)',
        ring: 'rgba(248, 113, 113, 0.2)',
        description: 'Closed'
    },
}

const ALL_STATUSES: Status[] = ['Interested', 'Applied', 'Interviewing', 'Offer', 'Rejected']

interface JobCardProps {
    job: Job;
    isBoard?: boolean;
    onDelete: (id: number) => void;
    onEdit: (job: Job) => void;
    onStatusChange: (id: number, status: Status) => void;
    openMenuId: number | null;
    setOpenMenuId: (id: number | null) => void;
    attributes?: any;
    listeners?: any;
    isDragging?: boolean;
    style?: React.CSSProperties;
}

const JobCard: React.FC<JobCardProps> = ({ 
    job, isBoard, onDelete, onEdit, onStatusChange, openMenuId, setOpenMenuId, 
    attributes, listeners, isDragging, style 
}) => {
    const cfg = STATUS_CONFIG[job.status as Status];

    return (
        <div
            style={style}
            {...attributes}
            {...listeners}
            className={`group flex ${isBoard ? 'flex-col items-start' : 'items-center'} gap-4 p-5 glass-card rounded-3xl relative cursor-grab active:cursor-grabbing ${!isDragging ? 'transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.05] z-10 hover:z-20' : 'z-[100] ring-2 ring-blue-500/50 shadow-2xl'}`}
        >
            <div className="flex items-center gap-4 w-full relative z-10 pointer-events-none">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                    style={{ background: cfg.bg, color: cfg.color }}
                >
                    <Building2 size={22} />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-base text-white truncate tracking-tight">{job.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-neutral-400 text-xs font-medium truncate">{job.company}</span>
                        {job.location && (
                            <>
                                <span className="text-neutral-700">•</span>
                                <span className="flex items-center gap-1 text-[10px] text-neutral-500">
                                    <MapPin size={10} />
                                    {job.location}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full relative">
                {isBoard ? (
                    <>
                        <div className="flex flex-wrap gap-3 mt-4 w-full pointer-events-none">
                            {job.salary && (
                                <span className="text-[10px] font-bold text-neutral-500 bg-white/5 px-2 py-1 rounded-lg">
                                    {job.salary}
                                </span>
                            )}
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-600">
                                <Clock size={12} />
                                {job.timestamp && new Date(job.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            {job.deadline && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400/80">
                                    <Calendar size={12} />
                                    {new Date(job.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between w-full mt-5 pt-4 border-t border-white/5">
                            <button
                                onClick={(e) => { e.stopPropagation(); job.id && setOpenMenuId(openMenuId === job.id ? null : job.id); }}
                                className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10 transition-all pointer-events-auto"
                                style={{ color: cfg.color, background: cfg.bg }}
                            >
                                Change Status
                            </button>
                            
                            <div className="flex gap-1 pointer-events-auto">
                                <a href={job.url} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-white/5 text-neutral-500 hover:text-white transition">
                                    <ExternalLink size={14} />
                                </a>
                                <button onClick={(e) => { e.stopPropagation(); onEdit(job); }} className="p-2 rounded-lg hover:bg-white/5 text-neutral-500 hover:text-blue-400 transition">
                                    <Pencil size={14} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); job.id && onDelete(job.id); }} className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-600 hover:text-red-500 transition">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {openMenuId === job.id && (
                            <div className="absolute left-0 bottom-full mb-2 bg-neutral-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-1.5 z-50 w-full shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto">
                                {ALL_STATUSES.map(s => (
                                    <button
                                        key={s}
                                        onClick={(e) => { e.stopPropagation(); job.id && onStatusChange(job.id, s); }}
                                        className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5 transition"
                                        style={{ color: STATUS_CONFIG[s].color }}
                                    >
                                        {STATUS_CONFIG[s].label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                     <div className="flex items-center gap-3 mt-4 pointer-events-auto">
                         <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); job.id && setOpenMenuId(openMenuId === job.id ? null : job.id); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-white/20"
                                style={{ background: cfg.bg, color: cfg.color }}
                            >
                                {cfg.label}
                                <ChevronDown size={14} className={`transition-transform duration-300 ${openMenuId === job.id ? 'rotate-180' : ''}`} />
                            </button>

                            {openMenuId === job.id && (
                                <div className="absolute left-0 top-full mt-2 bg-neutral-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-1.5 z-50 min-w-[180px] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto">
                                    {ALL_STATUSES.map(s => (
                                        <button
                                            key={s}
                                            onClick={(e) => { e.stopPropagation(); job.id && onStatusChange(job.id, s); }}
                                            className={`w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all ${job.status === s ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                            style={{ color: STATUS_CONFIG[s].color }}
                                        >
                                            {STATUS_CONFIG[s].label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-1">
                            <a href={job.url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
                                <ExternalLink size={16} />
                            </a>
                            <button onClick={(e) => { e.stopPropagation(); onEdit(job); }} className="p-2.5 rounded-xl bg-white/5 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                                <Pencil size={16} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); job.id && onDelete(job.id); }} className="p-2.5 rounded-xl bg-white/5 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ColumnProps {
    id: string;
    children: React.ReactNode;
}

const Column: React.FC<ColumnProps> = ({ id, children }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    
    return (
        <div 
            ref={setNodeRef}
            className={`space-y-4 p-3 rounded-[2rem] transition-colors duration-300 min-h-[500px] ${
                isOver ? 'bg-white/5 ring-2 ring-white/10' : 'bg-neutral-900/20 border border-white/[0.03]'
            } backdrop-blur-sm`}
        >
            {children}
        </div>
    );
};

interface SortableItemProps {
    job: Job;
    isBoard?: boolean;
    onDelete: (id: number) => void;
    onEdit: (job: Job) => void;
    onStatusChange: (id: number, status: Status) => void;
    openMenuId: number | null;
    setOpenMenuId: (id: number | null) => void;
}

const SortableJobCard: React.FC<SortableItemProps> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.job.id! });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.2 : 1,
        zIndex: isDragging ? 100 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <JobCard 
                {...props} 
                attributes={attributes} 
                listeners={listeners} 
                isDragging={isDragging} 
            />
        </div>
    );
};

export const JobTracker: React.FC = () => {
    const jobs = useLiveQuery(() => db.jobs.reverse().sortBy('timestamp')) || []
    const [filter, setFilter] = useState<Status | 'All'>('All')
    const [viewMode, setViewMode] = useState<ViewMode>('board')
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)
    const [activeId, setActiveId] = useState<number | null>(null)
    const [editingJob, setEditingJob] = useState<Job | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useLayoutEffect(() => {
        if (jobs.length > 0 && containerRef.current) {
            gsap.fromTo(containerRef.current.children, 
                { opacity: 0, scale: 0.9, y: 20 },
                { 
                    opacity: 1, 
                    scale: 1, 
                    y: 0, 
                    stagger: 0.04, 
                    duration: 0.5, 
                    ease: 'power3.out',
                    clearProps: 'transform'
                }
            )
        }
    }, [jobs.length, filter, viewMode])

    const updateStatus = async (id: number, status: Status) => {
        await db.jobs.update(id, { status })
        setOpenMenuId(null)
    }

    const deleteJob = async (id: number) => {
        if (!confirm('Archive this job entry?')) return
        await db.jobs.delete(id)
    }

    const saveJobUpdates = async (updates: Partial<Job>) => {
        if (editingJob?.id) {
            await db.jobs.update(editingJob.id, updates)
            setEditingJob(null)
        }
    }

    const [localJobs, setLocalJobs] = useState<Job[]>([]);

    useEffect(() => {
        if (activeId === null) {
            setLocalJobs(jobs);
        }
    }, [jobs, activeId]);

    const activeJob = localJobs.find(j => j.id === activeId);

    const onDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const onDragOver = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        const activeIdVal = active.id;
        const overIdVal = over.id;

        const activeItem = localJobs.find(j => j.id === activeIdVal);
        if (!activeItem) return;

        // Moving between columns
        const overItem = localJobs.find(j => j.id === overIdVal);
        const overStatus = ALL_STATUSES.includes(overIdVal as Status) ? (overIdVal as Status) : (overItem ? overItem.status : null);

        if (overStatus && activeItem.status !== overStatus) {
            setLocalJobs(prev => prev.map(j => 
                j.id === activeIdVal ? { ...j, status: overStatus } : j
            ));
        }
    };

    const onDragEnd = async (event: any) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeIdVal = active.id;

        const finalItem = localJobs.find(j => j.id === activeIdVal);
        const originalItem = jobs.find(j => j.id === activeIdVal);

        if (finalItem && originalItem && finalItem.status !== originalItem.status) {
            await db.jobs.update(activeIdVal as number, { status: finalItem.status });
        }
    };


    return (
        <div className="space-y-10 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex gap-5 items-center">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-[2rem] flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.1)]">
                        <Briefcase className="text-blue-500" size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-white">Career Pipeline</h2>
                        <p className="text-neutral-500 text-sm font-medium mt-1">Managing {jobs.length} active opportunities</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-inner">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${viewMode === 'board' ? 'bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.2)]' : 'text-neutral-500 hover:text-white'}`}
                        >
                            <LayoutGrid size={16} />
                            <span className="uppercase tracking-widest">Board</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${viewMode === 'list' ? 'bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.2)]' : 'text-neutral-500 hover:text-white'}`}
                        >
                            <List size={16} />
                            <span className="uppercase tracking-widest">List</span>
                        </button>
                    </div>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                {viewMode === 'list' ? (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        <div className="flex flex-wrap gap-2.5 items-center">
                            {(['All', ...ALL_STATUSES] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                                        filter === s
                                            ? 'bg-white text-black border-white shadow-lg'
                                            : 'bg-white/5 text-neutral-500 border-white/5 hover:border-white/20 hover:text-neutral-300'
                                    }`}
                                >
                                    {s === 'All' ? `All Platforms` : s}
                                    <span className={`ml-2 opacity-50 ${filter === s ? 'text-black' : ''}`}>
                                        {s === 'All' ? localJobs.length : localJobs.filter(j => j.status === s).length}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {localJobs.length === 0 ? (
                             <div className="py-32 glass-card rounded-[3rem] border-dashed flex flex-col items-center justify-center text-center px-6">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <Briefcase size={32} className="text-neutral-700" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest">No entries found</h3>
                                <p className="text-neutral-500 text-sm mt-2 max-w-xs">Start tracking job applications directly from any site using the Stash extension.</p>
                            </div>
                        ) : (
                            <SortableContext items={localJobs.map(j => j.id!)} strategy={verticalListSortingStrategy}>
                                <div ref={containerRef} className="grid grid-cols-1 gap-4">
                                    {(filter === 'All' ? localJobs : localJobs.filter(j => j.status === filter)).map(job => (
                                        <SortableJobCard 
                                            key={job.id} 
                                            job={job} 
                                            onDelete={deleteJob} 
                                            onEdit={setEditingJob}
                                            onStatusChange={updateStatus} 
                                            openMenuId={openMenuId}
                                            setOpenMenuId={setOpenMenuId}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        )}
                    </div>
                ) : (
                    <div ref={containerRef} className="flex gap-6 overflow-x-auto pb-10 -mx-10 px-10 clean-scrollbar snap-x relative items-start">
                        {ALL_STATUSES.map(status => {
                            const statusJobs = localJobs.filter(j => j.status === status)
                            return (
                                <div key={status} className="flex-none w-[320px] space-y-4 snap-start">
                                    <div className="flex items-center justify-between px-2 mb-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentcolor]" style={{ background: STATUS_CONFIG[status].color, color: STATUS_CONFIG[status].color }} />
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/80">{status}</h3>
                                        </div>
                                        <span className="text-[9px] font-black bg-white/5 px-2.5 py-0.5 rounded-lg text-neutral-500 border border-white/5">
                                            {statusJobs.length}
                                        </span>
                                    </div>
                                    <SortableContext items={statusJobs.map(j => j.id!)} strategy={verticalListSortingStrategy}>
                                        <Column id={status}>
                                            {statusJobs.map(job => (
                                                <SortableJobCard 
                                                    key={job.id} 
                                                    job={job} 
                                                    onDelete={deleteJob} 
                                                    onEdit={setEditingJob}
                                                    onStatusChange={updateStatus} 
                                                    isBoard
                                                    openMenuId={openMenuId}
                                                    setOpenMenuId={setOpenMenuId}
                                                />
                                            ))}
                                            
                                            {statusJobs.length === 0 && (
                                                <div className="h-32 flex flex-col items-center justify-center border border-dashed border-white/[0.05] rounded-[1.5rem] group hover:bg-white/[0.02] transition-colors">
                                                    <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                        <Plus size={14} className="text-neutral-600" />
                                                    </div>
                                                    <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Empty Stage</span>
                                                </div>
                                            )}
                                        </Column>
                                    </SortableContext>
                                </div>
                            )
                        })}
                    </div>
                )}

                <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: {
                                opacity: '0.2',
                            },
                        },
                    }),
                }}>
                    {activeJob ? (
                        <div className="opacity-90 scale-105 pointer-events-none">
                            <JobCard 
                                job={activeJob} 
                                isBoard={viewMode === 'board'} 
                                onDelete={() => {}} 
                                onEdit={() => {}} 
                                onStatusChange={() => {}} 
                                openMenuId={null}
                                setOpenMenuId={() => {}}
                                isDragging={true}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {editingJob && (
                <JobModal 
                    job={editingJob} 
                    onClose={() => setEditingJob(null)} 
                    onSave={saveJobUpdates} 
                />
            )}
        </div>
    )
}
