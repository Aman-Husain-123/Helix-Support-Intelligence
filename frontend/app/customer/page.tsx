'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { useChat } from '../../hooks/useChat';
import {
    Bot, MessageSquare, Ticket as TicketIcon, Bell, Settings, LogOut,
    Send, Zap, Star, Clock, CheckCircle2, ArrowUpRight, User as UserIcon, Plus, X, AlertTriangle, BookOpen
} from 'lucide-react';

const SIDE_ICONS = [
    { icon: Bot, label: 'AI', id: 'ai' },
    { icon: TicketIcon, label: 'Tickets', id: 'tickets' },
    { icon: Bell, label: 'Notifs', id: 'notifs' },
    { icon: UserIcon, label: 'Profile', id: 'profile' },
];

const MY_TICKETS = [
    { id: 'TCK-4785', subject: '2FA reset request', status: 'resolved', updated: '34m ago', priority: 'URGENT' },
    { id: 'TCK-4601', subject: 'Billing discrepancy Q1', status: 'open', updated: '2d ago', priority: 'HIGH' },
    { id: 'TCK-4389', subject: 'Integration webhook setup', status: 'closed', updated: '5d ago', priority: 'MEDIUM' },
];

const STATUS_CHIP: Record<string, string> = {
    resolved: 'text-green-400 bg-green-500/10',
    open: 'text-blue-400 bg-blue-500/10',
    closed: 'text-surface-500 bg-surface-800',
};

function AIChat({ user, messages, sendMessage, isTyping, isConnected }: any) {
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="h-14 border-b border-surface-800 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-blue-600 flex items-center justify-center shadow-lg shadow-accent-500/20"><Bot size={18} /></div>
                    <div>
                        <p className="font-semibold text-white text-sm">Helix AI Assistant</p>
                        <p className="text-[10px] text-surface-500">Powered by GPT-4o · RAG · Vector DB</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="text-xs text-surface-400 hover:text-white">Close History</button>
                    <div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border ${isConnected ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
                        {isConnected ? 'LIVE' : 'REST FALLBACK (WS SLOW)'}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-12 py-8 space-y-6"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '32px 32px' }}>
                {messages.length === 0 && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-blue-600 flex items-center justify-center shrink-0"><Bot size={16} /></div>
                            <div className="bg-surface-800 border border-surface-700 rounded-2xl rounded-tl-sm px-5 py-3">
                                <p className="text-surface-200 text-sm">Hi! 👋 I'm Helix AI. How can I help you today?</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-surface-600 ml-12">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        {/* Quick prompts */}
                        <div className="ml-12 mt-2 flex flex-wrap gap-2">
                            {['How do I reset my 2FA?', 'Check my invoice status', 'What are your API limits?'].map(q => (
                                <button key={q} onClick={() => sendMessage(q)} className="text-xs bg-surface-800 border border-surface-700 hover:border-accent-500/50 text-surface-300 px-3 py-1.5 rounded-full transition-colors hover:text-white">{q}</button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg: any) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} max-w-2xl ${msg.sender === 'user' ? 'ml-auto' : ''}`}>
                        {msg.sender !== 'user' && <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-blue-600 flex items-center justify-center shrink-0 mt-1"><Bot size={16} /></div>}
                        <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} gap-1`}>
                            <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-accent-600 text-white rounded-tr-sm' : 'bg-surface-800 border border-surface-700 text-surface-200 rounded-tl-sm'}`}>
                                <p>{msg.text}</p>

                                {msg.type === 'escalation' && (
                                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertTriangle size={10} /> Intelligence Upgrade Required</p>
                                        <p className="text-xs text-surface-400 mb-4 font-medium italic">It seems this request is complex. I've alerted our team to help you faster.</p>
                                        <button onClick={() => { /* logic to switch to tickets tab */ }} className="w-full py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-lg shadow-red-500/10">Open Priority Ticket</button>
                                    </div>
                                )}

                                {msg.sources?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-surface-750">
                                        <p className="w-full text-[9px] font-black text-surface-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><BookOpen size={9} /> Sources Verified</p>
                                        {msg.sources.map((s: string, i: number) => <span key={i} className="text-[9px] bg-accent-500/10 text-accent-400 px-2 py-0.5 rounded border border-accent-500/20 font-bold">[{i + 1}] {s}</span>)}
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-surface-600 px-1">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {msg.sender === 'user' && <div className="w-9 h-9 rounded-full bg-surface-700 flex items-center justify-center shrink-0 mt-1 text-xs font-bold">{user?.sub?.[0]?.toUpperCase()}</div>}
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3 items-center">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-blue-600 flex items-center justify-center shrink-0"><Bot size={16} /></div>
                        <div className="bg-surface-800 border border-surface-700 rounded-2xl rounded-tl-sm px-5 py-3 flex gap-1.5">
                            {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="border-t border-surface-800 px-6 py-4">
                <div className="text-[10px] text-surface-600 text-center mb-3">
                    {isConnected ? 'Agent has been assigned. You may message them here...' : 'Connecting to support...'}
                </div>
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input value={input} onChange={e => setInput(e.target.value)}
                        placeholder="Ask a question or describe your issue..."
                        className="flex-1 bg-surface-800 border border-surface-700 text-surface-200 placeholder:text-surface-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-accent-500/50 transition-all" />
                    <button type="submit" disabled={!input.trim()} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${input.trim() ? 'bg-accent-600 hover:bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'bg-surface-800 text-surface-600 cursor-not-allowed'}`}>
                        Send <Send size={14} />
                    </button>
                </form>
                <p className="text-[10px] text-surface-700 text-center mt-3">AI responses are based on your account data and our knowledge base</p>
            </div>
        </div>
    );
}

function TicketsView({ user }: any) {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({ subject: '', description: '', priority: 'medium' });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://localhost:8000/api/ticketing/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setTickets(await res.json());
        } catch (e) { }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://localhost:8000/api/ticketing/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowCreate(false);
                setFormData({ subject: '', description: '', priority: 'medium' });
                fetchTickets();
            }
        } catch (e) { }
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Support Tickets</h2>
                    <p className="text-surface-500 text-sm mt-1">Manage and track your active inquiries</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                    <Plus size={16} /> New Ticket
                </button>
            </div>

            {loading ? (
                <div className="py-12 text-center text-surface-600">Loading your tickets...</div>
            ) : tickets.length === 0 ? (
                <div className="bg-surface-800/40 border-2 border-dashed border-surface-800 rounded-3xl p-20 text-center">
                    <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-surface-600"><TicketIcon size={32} /></div>
                    <p className="text-surface-300 font-medium">No active tickets found</p>
                    <p className="text-surface-600 text-sm mt-1">Need help? Create a new ticket or talk to our AI.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {tickets.map(t => (
                        <div key={t.id} className="bg-surface-800/60 border border-surface-750 p-6 rounded-2xl flex items-center justify-between group hover:border-surface-600 transition-all cursor-pointer">
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold ${t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>#{t.id.toString().slice(-4)}</div>
                                <div>
                                    <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">{t.subject}</h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>{t.status}</span>
                                        <span className="text-[10px] text-surface-600 flex items-center gap-1"><Clock size={10} /> {new Date(t.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <ArrowUpRight size={18} className="text-surface-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <div className="absolute inset-0 z-50 bg-surface-950/80 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-surface-900 border border-surface-800 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-surface-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Open New Ticket</h3>
                            <button onClick={() => setShowCreate(false)} className="text-surface-500 hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-5">
                            <div>
                                <label className="text-xs font-bold text-surface-500 uppercase tracking-widest block mb-2">Subject</label>
                                <input required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full bg-surface-800 border border-surface-750 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50" placeholder="Summary of the issue..." />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-surface-500 uppercase tracking-widest block mb-2">Priority</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['low', 'medium', 'high', 'urgent'].map(p => (
                                        <button key={p} type="button" onClick={() => setFormData({ ...formData, priority: p })} className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${formData.priority === p ? 'bg-emerald-500 text-white' : 'bg-surface-800 text-surface-500 hover:bg-surface-750'}`}>{p}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-surface-500 uppercase tracking-widest block mb-2">Description</label>
                                <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-surface-800 border border-surface-750 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 resize-none" placeholder="Explain the details..." />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-surface-800 hover:bg-surface-750 text-surface-300 py-3 rounded-xl text-sm font-bold transition-all">Cancel</button>
                                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all">Submit Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProfileView({ user, logout }: any) {
    return (
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
            <h2 className="text-lg font-bold text-white">My Profile</h2>
            <div className="flex items-center gap-5 bg-surface-800/60 border border-surface-750 rounded-xl p-6">
                <div className="w-16 h-16 rounded-full bg-accent-600 flex items-center justify-center text-2xl font-black">{user?.sub?.[0]?.toUpperCase()}</div>
                <div>
                    <p className="text-lg font-bold text-white">{user?.sub}</p>
                    <p className="text-sm text-surface-400 capitalize">{user?.role} · {user?.tenant_id}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-green-400">Active account</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[{ label: 'Tickets', value: '3', icon: TicketIcon }, { label: 'CSAT', value: '4.8', icon: Star }, { label: 'Joined', value: 'Mar 24', icon: Clock }].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-surface-800/60 border border-surface-750 rounded-xl p-4 text-center">
                        <Icon size={16} className="mx-auto text-surface-500 mb-2" />
                        <p className="text-xl font-black text-white">{value}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{label}</p>
                    </div>
                ))}
            </div>
            <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-surface-200">Account Settings</h3>
                <div><label className="text-xs text-surface-400 block mb-1.5">Email</label><input defaultValue={user?.sub || ''} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-300 outline-none focus:border-accent-500/50" /></div>
                <div><label className="text-xs text-surface-400 block mb-1.5">New Password</label><input type="password" className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-300 outline-none focus:border-accent-500/50" placeholder="••••••••" /></div>
                <button className="w-full bg-accent-600 hover:bg-accent-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Save Changes</button>
                <button onClick={logout} className="w-full border border-red-500/20 text-red-400 hover:bg-red-500/10 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"><LogOut size={14} />Sign Out</button>
            </div>
        </div>
    );
}

export default function CustomerDashboard({ defaultActive = 'overview' }: { defaultActive?: string }) {
    const { user, loading, logout } = useUser('customer');
    const [activeNav, setActiveNav] = useState(defaultActive);
    const { messages, sendMessage, isTyping, isConnected } = useChat(user?.sub || 'anonymous');

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-surface-950">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    const NAV_ITEMS = [
        { id: 'overview', label: 'Home', icon: Bot },
        { id: 'ai', label: 'Ask AI', icon: Zap },
        { id: 'tickets', label: 'My Tickets', icon: TicketIcon },
        { id: 'notifs', label: 'Inbox', icon: Bell },
    ];

    return (
        <div className="min-h-screen bg-surface-950 text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
            {/* Top Navigation */}
            <nav className="h-20 border-b border-surface-800/50 bg-surface-950/50 backdrop-blur-xl sticky top-0 z-50 px-8 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Zap size={20} className="text-white fill-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tighter leading-none">HELIX</span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Support Hub</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-1 bg-surface-900/50 p-1.5 rounded-2xl border border-surface-800/50">
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveNav(item.id)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 ${activeNav === item.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-surface-500 hover:text-white hover:bg-surface-800'}`}
                            >
                                <item.icon size={16} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-xs font-bold text-white">{user?.sub?.split('@')[0]}</span>
                        <span className="text-[10px] text-surface-600 font-medium uppercase tracking-widest">{user?.tenant_id} customer</span>
                    </div>
                    <div className="relative group">
                        <button className="w-11 h-11 rounded-2xl bg-surface-900 border border-surface-800 flex items-center justify-center hover:border-emerald-500/50 transition-all group-hover:scale-105 active:scale-95 overflow-hidden">
                            <UserIcon size={20} className="text-emerald-500" />
                        </button>
                        <div className="absolute top-full right-0 mt-3 w-56 bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-[100]">
                            <button onClick={() => setActiveNav('profile')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"><Settings size={16} />Settings</button>
                            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"><LogOut size={16} />Sign Out</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-8 py-10">
                {activeNav === 'overview' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {/* Hero Section */}
                        <div className="relative overflow-hidden bg-surface-900 rounded-[48px] p-16 border border-surface-800/50">
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />

                            <div className="relative z-10 max-w-2xl">
                                <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
                                    How can we <span className="text-emerald-500">help you</span> today?
                                </h1>
                                <p className="text-xl text-surface-400 leading-relaxed mb-10">
                                    Search our knowledge base or chat with our AI agent to resolve issues instantly.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => setActiveNav('ai')} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                                        <Bot size={20} /> Ask Helix AI
                                    </button>
                                    <button onClick={() => setActiveNav('tickets')} className="px-8 py-4 bg-surface-800 hover:bg-surface-750 text-white rounded-2xl font-black border border-surface-700 transition-all flex items-center gap-3">
                                        <Plus size={20} /> Open a Ticket
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-surface-900/50 border border-surface-800 p-8 rounded-[32px] hover:border-surface-700 transition-all cursor-pointer" onClick={() => setActiveNav('tickets')}>
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6"><TicketIcon size={24} /></div>
                                <h3 className="text-lg font-bold text-white mb-2">My Tickets</h3>
                                <p className="text-surface-500 text-sm mb-6 leading-relaxed">View all your active support requests and their current status.</p>
                                <div className="text-emerald-500 font-bold text-sm flex items-center gap-2 group">View dashboard <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></div>
                            </div>
                            <div className="bg-surface-900/50 border border-surface-800 p-8 rounded-[32px] hover:border-surface-700 transition-all cursor-pointer" onClick={() => setActiveNav('ai')}>
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6"><MessageSquare size={24} /></div>
                                <h3 className="text-lg font-bold text-white mb-2">Resolution Rate</h3>
                                <p className="text-surface-500 text-sm mb-6 leading-relaxed">Our AI resolves 85% of queries instantly. Try chatting before opening a ticket.</p>
                                <div className="text-blue-500 font-bold text-sm flex items-center gap-2 group">Start AI conversation <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></div>
                            </div>
                            <div className="bg-emerald-600 p-8 rounded-[32px] shadow-2xl shadow-emerald-500/10">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6"><Zap size={24} className="fill-white" /></div>
                                <h3 className="text-lg font-bold text-white mb-2">Quick Support</h3>
                                <p className="text-emerald-100/70 text-sm mb-6 leading-relaxed">Access our most common help articles instantly to save time.</p>
                                <button className="bg-white text-emerald-600 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-emerald-50 transition-all shadow-lg">Browse FAQ</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeNav === 'ai' && (
                    <div className="h-[700px] bg-surface-900 border border-surface-800 rounded-[40px] overflow-hidden shadow-2xl">
                        <AIChat user={user} messages={messages} sendMessage={sendMessage} isTyping={isTyping} isConnected={isConnected} />
                    </div>
                )}

                {activeNav === 'tickets' && (
                    <div className="bg-surface-900 border border-surface-800 rounded-[40px] p-4 min-h-[600px] shadow-2xl">
                        <TicketsView user={user} />
                    </div>
                )}

                {activeNav === 'profile' && <ProfileView user={user} logout={logout} />}

                {activeNav === 'notifs' && (
                    <div className="flex flex-col items-center justify-center py-40 bg-surface-900/40 border-2 border-dashed border-surface-800 rounded-[48px]">
                        <div className="w-20 h-20 bg-surface-800 rounded-3xl flex items-center justify-center text-surface-600 mb-6"><Bell size={40} /></div>
                        <h3 className="text-2xl font-bold text-surface-300">All caught up</h3>
                        <p className="text-surface-600 text-base mt-2">New notifications will appear here as your tickets are updated.</p>
                        <button onClick={() => setActiveNav('overview')} className="mt-8 px-6 py-2.5 bg-surface-800 hover:bg-surface-750 text-surface-300 rounded-xl text-sm font-bold transition-all">Back to Home</button>
                    </div>
                )}
            </main>
        </div>
    );
}
