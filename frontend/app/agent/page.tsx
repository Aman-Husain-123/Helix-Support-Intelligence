'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { useChat } from '../../hooks/useChat';
import {
    Layers, BarChart2, MessageSquare, Brain, BookOpen, Settings, LogOut,
    Search, Zap, Circle, MoreHorizontal, Send, Paperclip, Bold, Italic,
    Code, Link2, Tag, TrendingUp, Clock, Star, CheckCircle2, AlertTriangle
} from 'lucide-react';

const MOCK_TICKETS = [
    { id: 'TCK-4785', subject: '2FA reset request', customer: 'Sarah Kim', initials: 'SK', color: 'bg-blue-500', channel: 'web', unread: 1, priority: 'URGENT', status: 'resolved', time: '12:34 AM' },
    { id: 'TCK-4821', subject: 'Invoice higher than expected', customer: 'Jordan Matthews', initials: 'JM', color: 'bg-green-500', channel: 'email', unread: 0, priority: 'HIGH', status: 'open', time: '12:01 AM' },
    { id: 'TCK-4798', subject: 'API timeouts in production', customer: 'Acme Inc.', initials: 'AI', color: 'bg-orange-500', channel: 'api', unread: 0, priority: 'MEDIUM', status: 'open', time: '11m' },
    { id: 'TCK-4770', subject: 'Issue in sidebar', customer: 'shivam', initials: 'S', color: 'bg-purple-500', channel: 'web', unread: 0, priority: 'LOW', status: 'open', time: '12:00' },
];

const MOCK_MESSAGES = [
    { id: 1, sender: 'customer', name: 'Sarah Kim', text: 'Can you help me reset my 2FA?', time: '12:00 AM', initials: 'SK', color: 'bg-blue-500' },
    { id: 2, sender: 'agent', name: 'You', text: "Hi Sarah, I can help you reset your 2FA. For security, I'll need to verify your identity first. Could you confirm the email address on your account and the last 4 digits of the phone number you registered?", time: '12:04 AM' },
];

const PRIORITY_BADGE: Record<string, string> = {
    URGENT: 'bg-red-500/20 text-red-400 border-red-500/40',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    LOW: 'bg-surface-700 text-surface-400 border-surface-600',
};

const SIDE_NAV = [
    { icon: Layers, label: 'Workspace', id: 'workspace' },
    { icon: BarChart2, label: 'Analytics', id: 'analytics' },
    { icon: MessageSquare, label: 'Queues', id: 'queues' },
    { icon: Brain, label: 'AI', id: 'ai' },
    { icon: BookOpen, label: 'Knowledge', id: 'knowledge' },
    { icon: Settings, label: 'Settings', id: 'settings' },
];

function StatsView({ user }: any) {
    const stats = [
        { label: 'Resolved Today', value: '12', icon: CheckCircle2, color: 'text-green-400', sub: '+3 vs yesterday' },
        { label: 'Open Tickets', value: '5', icon: AlertTriangle, color: 'text-yellow-400', sub: '2 urgent' },
        { label: 'Avg Handle Time', value: '18m', icon: Clock, color: 'text-blue-400', sub: '−3m vs avg' },
        { label: 'CSAT Score', value: '4.9', icon: Star, color: 'text-accent-400', sub: 'Excellent' },
    ];
    const weekly = [14, 20, 9, 17, 22, 8, 12];
    const max = Math.max(...weekly);
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return (
        <div className="p-6 overflow-y-auto space-y-6">
            <div>
                <h2 className="text-lg font-bold text-white">My Stats</h2>
                <p className="text-surface-500 text-sm">Welcome back, {user?.sub?.split('@')[0]}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {stats.map(({ label, value, icon: Icon, color, sub }) => (
                    <div key={label} className="bg-surface-800/60 border border-surface-750 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3"><span className="text-surface-400 text-xs">{label}</span><Icon size={15} className={color} /></div>
                        <p className="text-2xl font-black text-white">{value}</p>
                        <p className="text-[10px] text-surface-500 mt-1">{sub}</p>
                    </div>
                ))}
            </div>
            <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-surface-300 mb-5">Tickets Resolved — This Week</h3>
                <div className="flex items-end gap-2 h-28">
                    {weekly.map((v, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full bg-gradient-to-t from-accent-600 to-accent-400 rounded-md opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${(v / max) * 100}px` }} />
                            <span className="text-[10px] text-surface-600">{days[i]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function WorkspaceView({ user }: any) {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [ticketDetail, setTicketDetail] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('open');
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, [activeTab]);

    useEffect(() => {
        if (selectedTicketId) fetchTicketDetail();
    }, [selectedTicketId]);

    const fetchTickets = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/ticketing/all?status=${activeTab}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setTickets(await res.json());
        } catch (e) { }
        setLoading(false);
    };

    const fetchTicketDetail = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/ticketing/${selectedTicketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setTicketDetail(await res.json());
        } catch (e) { }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!reply.trim() || !selectedTicketId) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/ticketing/${selectedTicketId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: reply })
            });
            if (res.ok) {
                setReply('');
                fetchTicketDetail();
            }
        } catch (e) { }
    };

    const updateStatus = async (newStatus: string) => {
        if (!selectedTicketId) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/ticketing/${selectedTicketId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchTickets();
                fetchTicketDetail();
            }
        } catch (e) { }
    };

    return (
        <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* List */}
            <div className="w-80 border-r border-surface-800 flex flex-col shrink-0">
                <div className="px-4 py-3 border-b border-surface-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Queue</h3>
                    <span className="text-[10px] bg-surface-800 text-surface-500 px-2 py-0.5 rounded-full font-bold">{tickets.length}</span>
                </div>
                <div className="flex border-b border-surface-800 px-3 gap-1 py-1 shrink-0 overflow-x-auto no-scrollbar">
                    {['open', 'pending', 'resolved', 'closed'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${activeTab === t ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-surface-600 hover:text-white'}`}>{t}</button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="py-20 text-center text-surface-700 text-xs">Fetching queue...</div>
                    ) : tickets.map(t => (
                        <button key={t.id} onClick={() => setSelectedTicketId(t.id)} className={`w-full text-left p-4 rounded-2xl border transition-all relative group ${selectedTicketId === t.id ? 'bg-surface-800/80 border-surface-700' : 'bg-transparent border-transparent hover:bg-surface-800/40'}`}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${t.priority === 'urgent' ? 'bg-red-500/10 text-red-400' : 'bg-surface-800 text-surface-500'}`}>{t.priority}</span>
                                <span className="text-[9px] text-surface-600">{new Date(t.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className={`text-sm font-bold truncate transition-colors ${selectedTicketId === t.id ? 'text-blue-400' : 'text-white group-hover:text-blue-300'}`}>{t.subject}</h4>
                            <p className="text-[11px] text-surface-500 mt-0.5 truncate">{t.customer_email || 'Customer'}</p>
                            {selectedTicketId === t.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[2px_0_10px_rgba(59,130,246,0.5)]" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 flex flex-col min-h-0 bg-surface-900/30">
                {ticketDetail ? (
                    <>
                        <div className="h-14 border-b border-surface-800 flex items-center justify-between px-6 shrink-0 bg-surface-900/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h3 className="text-sm font-bold text-white">{ticketDetail.subject}</h3>
                                    <p className="text-[10px] text-surface-500 mt-0.5">#{ticketDetail.id} · Created {new Date(ticketDetail.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateStatus('pending')} className="text-[10px] px-3 py-1.5 rounded-lg bg-surface-800 text-surface-400 hover:text-yellow-400 transition-colors font-bold uppercase tracking-wider">Wait Client</button>
                                <button onClick={() => updateStatus('resolved')} className="text-[10px] px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all font-bold uppercase tracking-wider">Resolve</button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="bg-surface-800/40 border border-surface-750 p-6 rounded-3xl mb-8">
                                <p className="text-[10px] font-black uppercase text-blue-500 mb-2 tracking-widest">Initial Inquiry</p>
                                <p className="text-surface-200 text-sm leading-relaxed">{ticketDetail.description}</p>
                            </div>

                            {ticketDetail.messages?.map((msg: any) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.sender_role === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] flex flex-col ${msg.sender_role === 'agent' ? 'items-end' : 'items-start'} gap-1`}>
                                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender_role === 'agent' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-surface-800 border border-surface-750 text-surface-200 rounded-tl-sm shadow-sm'}`}>
                                            {msg.content}
                                        </div>
                                        <p className="text-[9px] text-surface-600 px-2 font-medium">{msg.sender_role.toUpperCase()} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-surface-800 bg-surface-900/50">
                            <form onSubmit={handleSend} className="bg-surface-800 border border-surface-750 rounded-2xl overflow-hidden focus-within:border-blue-500/50 transition-all shadow-xl">
                                <textarea
                                    value={reply}
                                    onChange={e => setReply(e.target.value)}
                                    rows={3}
                                    className="w-full bg-transparent p-4 text-sm text-surface-200 placeholder:text-surface-600 outline-none resize-none"
                                    placeholder={`Reply to ${ticketDetail.customer_email || 'customer'}...`}
                                />
                                <div className="px-4 py-2 bg-surface-800/50 border-t border-surface-750 flex items-center justify-between">
                                    <div className="flex gap-4 opacity-50"><Paperclip size={14} /><Star size={14} /><Tag size={14} /></div>
                                    <button type="submit" disabled={!reply.trim()} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${reply.trim() ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-surface-700 text-surface-500'}`}>Send Reply</button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center text-surface-700 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)]">
                        <MessageSquare size={64} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-surface-600">No ticket selected</h3>
                        <p className="text-sm mt-1 max-w-xs">Select a request from the sidebar to view details and start helping.</p>
                    </div>
                )}
            </div>

            {/* Context Sidebar */}
            <div className="w-72 border-l border-surface-800 flex flex-col overflow-y-auto shrink-0 bg-surface-950/20">
                {ticketDetail && (
                    <div className="p-6 space-y-8">
                        <div>
                            <p className="text-[10px] font-black uppercase text-surface-600 tracking-widest mb-4">Customer Context</p>
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-bold">
                                    {ticketDetail.customer_email?.[0].toUpperCase() || 'C'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white truncate w-40">{ticketDetail.customer_email || 'Anonymous'}</p>
                                    <p className="text-[10px] text-surface-600">Customer ID: {ticketDetail.customer_id}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-surface-800/40 p-3 rounded-xl border border-surface-800/50">
                                    <p className="text-[9px] text-surface-600 uppercase font-black">Tickets</p>
                                    <p className="text-lg font-bold text-white mt-1">1</p>
                                </div>
                                <div className="bg-surface-800/40 p-3 rounded-xl border border-surface-800/50">
                                    <p className="text-[9px] text-surface-600 uppercase font-black">CSAT</p>
                                    <p className="text-lg font-bold text-emerald-400 mt-1">N/A</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase text-surface-600 tracking-widest mb-4">SLA Tracking</p>
                            <div className="bg-surface-800/40 border border-surface-800/50 rounded-2xl p-4 space-y-4">
                                <div>
                                    <p className="text-[10px] text-surface-500">Deadline</p>
                                    <p className="text-xs font-bold text-white mt-1">{ticketDetail.sla_due_at ? new Date(ticketDetail.sla_due_at).toLocaleString() : 'N/A'}</p>
                                </div>
                                <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[65%]" />
                                </div>
                                <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">In Policy</p>
                            </div>
                        </div>

                        <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-[24px]">
                            <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-3 flex items-center gap-2"><Zap size={10} /> AI Summary</p>
                            <p className="text-xs text-blue-100/70 italic leading-relaxed">
                                {ticketDetail.ai_summary || "AI is analyzing this ticket context... Summary will appear here shortly."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AgentDashboard() {
    const { user, loading, logout } = useUser('agent');
    const [activeNav, setActiveNav] = useState('workspace');

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-surface-900">
            <div className="w-2 h-2 rounded-full bg-accent-500 animate-ping" />
        </div>
    );

    return (
        <div className="flex h-screen bg-surface-900 text-white font-sans overflow-hidden text-sm">
            <aside className="w-14 bg-surface-950 flex flex-col items-center py-3 border-r border-surface-800 shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20"><Zap size={16} /></div>
                <div className="mb-4 text-[8px] font-black text-blue-400 uppercase tracking-widest text-center">Agent</div>
                <nav className="flex flex-col gap-1 flex-1 w-full px-2">
                    {SIDE_NAV.map(({ icon: Icon, label, id }) => (
                        <button key={id} onClick={() => setActiveNav(id)} title={label} className={`w-full flex flex-col items-center justify-center h-12 rounded-lg transition-all text-[9px] gap-1 ${activeNav === id ? 'bg-surface-800 text-blue-400' : 'text-surface-600 hover:bg-surface-800/50 hover:text-surface-300'}`}>
                            <Icon size={16} /><span>{label}</span>
                        </button>
                    ))}
                </nav>
                <div className="flex flex-col items-center gap-3 mb-2">
                    <button onClick={logout} title="Sign out" className="text-surface-600 hover:text-white"><LogOut size={15} /></button>
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">{user?.sub?.[0]?.toUpperCase() ?? 'A'}</div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-12 border-b border-surface-800 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2 capitalize font-semibold text-surface-300">
                        {activeNav}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-surface-500">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-green-400 font-medium">agent · available</span>
                        <span className="border-l border-surface-800 pl-3">{user?.tenant_id}</span>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {activeNav === 'workspace' && <WorkspaceView user={user} />}
                    {activeNav === 'analytics' && <StatsView user={user} />}
                    {activeNav !== 'workspace' && activeNav !== 'analytics' && (
                        <div className="flex-1 flex items-center justify-center flex-col gap-3 text-surface-600">
                            <Zap size={32} className="text-surface-700" />
                            <p className="text-sm font-medium capitalize">{activeNav} — Coming soon</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
