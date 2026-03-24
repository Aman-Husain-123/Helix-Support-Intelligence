'use client';

import { useState } from 'react';
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

function WorkspaceView({ user, selectedTicket, setSelectedTicket }: any) {
    const [reply, setReply] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    return (
        <div className="flex flex-1 min-h-0">
            {/* Ticket List */}
            <div className="w-64 border-r border-surface-800 flex flex-col shrink-0">
                <div className="p-3 border-b border-surface-800">
                    <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-500" />
                        <input className="w-full bg-surface-800 text-surface-300 placeholder:text-surface-600 text-xs rounded-lg py-2 pl-8 pr-3 outline-none focus:ring-1 focus:ring-accent-500/50" placeholder="Search tickets..." />
                    </div>
                </div>
                <div className="flex border-b border-surface-800 px-3 gap-1 py-2">
                    {['Inbox', 'Team', 'Channels'].map(f => (
                        <button key={f} className={`px-2 py-1 rounded text-[10px] font-medium ${f === 'Inbox' ? 'bg-surface-800 text-white' : 'text-surface-500 hover:text-white'}`}>{f}</button>
                    ))}
                </div>
                <div className="px-3 py-2 space-y-0.5">
                    {[{ label: 'All tickets', count: 4, id: 'all' }, { label: 'Assigned to me', count: 2, id: 'mine' }, { label: 'Unassigned', count: 0, id: 'unassigned' }, { label: 'Priority', count: 2, id: 'priority' }].map(f => (
                        <button key={f.id} onClick={() => setActiveFilter(f.id)} className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${activeFilter === f.id ? 'bg-surface-800 text-white' : 'text-surface-500 hover:text-surface-300'}`}>
                            <span>{f.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${f.count > 0 ? 'bg-accent-500/20 text-accent-400' : 'text-surface-600'}`}>{f.count}</span>
                        </button>
                    ))}
                </div>
                <div className="px-3 py-1 overflow-y-auto flex-1">
                    <p className="text-[9px] uppercase font-bold text-surface-600 tracking-wider mb-1">TICKETS</p>
                    <div className="space-y-0.5">
                        {MOCK_TICKETS.map(t => (
                            <button key={t.id} onClick={() => setSelectedTicket(t)} className={`w-full text-left px-2 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${selectedTicket?.id === t.id ? 'bg-surface-800' : 'hover:bg-surface-800/50'}`}>
                                <div className={`w-7 h-7 rounded-full ${t.color} flex items-center justify-center text-[10px] font-bold shrink-0`}>{t.initials}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-surface-200 truncate">{t.customer}</span>
                                        <span className="text-[10px] text-surface-500 shrink-0 ml-1">{t.time}</span>
                                    </div>
                                    <p className="text-[10px] text-surface-500 truncate">{t.subject}</p>
                                </div>
                                {t.unread > 0 && <span className="w-4 h-4 rounded-full bg-accent-500 text-[9px] font-bold flex items-center justify-center shrink-0">{t.unread}</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="h-12 border-b border-surface-800 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full ${selectedTicket?.color} flex items-center justify-center text-[10px] font-bold`}>{selectedTicket?.initials}</div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">{selectedTicket?.customer}</span>
                                <span className="text-[10px] text-surface-500">{selectedTicket?.id}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${selectedTicket?.status === 'resolved' ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'}`}>{selectedTicket?.status}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${PRIORITY_BADGE[selectedTicket?.priority]}`}>{selectedTicket?.priority?.toLowerCase()} priority</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-xs px-3 py-1.5 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 flex items-center gap-1.5"><Paperclip size={12} />Attach</button>
                        <button className="text-xs px-3 py-1.5 rounded-lg bg-surface-800 text-green-400 hover:bg-surface-700 flex items-center gap-1.5"><Circle size={8} className="fill-green-400" />Close Ticket</button>
                        <button className="text-xs px-3 py-1.5 rounded-lg bg-accent-600 text-white hover:bg-accent-500 font-medium">Join call</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                    <div className="flex items-center gap-3 text-[10px] text-surface-600"><div className="flex-1 h-px bg-surface-800" /><span>Today</span><div className="flex-1 h-px bg-surface-800" /></div>
                    {MOCK_MESSAGES.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'customer' && <div className={`w-8 h-8 rounded-full ${msg.color} flex items-center justify-center text-[10px] font-bold shrink-0 mt-1`}>{msg.initials}</div>}
                            <div className={`max-w-[60%] flex flex-col ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-surface-300">{msg.name}</span><span className="text-[10px] text-surface-600">{msg.time}</span></div>
                                <div className={`rounded-2xl px-4 py-3 text-sm ${msg.sender === 'agent' ? 'bg-accent-600 text-white rounded-tr-sm' : 'bg-surface-800 text-surface-200 rounded-tl-sm'}`}>{msg.text}</div>
                                {msg.sender === 'agent' && <span className="text-[10px] text-surface-600 mt-1">✓ Read</span>}
                            </div>
                            {msg.sender === 'agent' && <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center text-xs font-bold shrink-0 mt-1">Y</div>}
                        </div>
                    ))}
                </div>
                <div className="border-t border-surface-800">
                    <div className="flex items-center gap-1 px-4 py-2 border-b border-surface-800">
                        {['Reply', 'Note', 'Email'].map(t => <button key={t} className={`text-xs px-3 py-1 rounded font-medium ${t === 'Reply' ? 'text-white bg-surface-800' : 'text-surface-500 hover:text-white'}`}>{t}</button>)}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-800">
                        {[Bold, Italic, Code, Link2].map((Icon, i) => <button key={i} className="text-surface-600 hover:text-surface-300"><Icon size={13} /></button>)}
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                        <input value={reply} onChange={e => setReply(e.target.value)} className="flex-1 bg-transparent text-surface-300 placeholder:text-surface-600 text-sm outline-none" placeholder="Reply to the customer..." />
                        <button className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${reply.trim() ? 'bg-accent-600 text-white hover:bg-accent-500' : 'bg-surface-800 text-surface-500'}`}> Send <Send size={12} /></button>
                    </div>
                    <p className="text-[10px] text-surface-700 px-4 pb-2">Enter to send · Shift+Enter for new line</p>
                </div>
            </div>

            {/* Right Details */}
            <div className="w-64 border-l border-surface-800 flex flex-col overflow-y-auto shrink-0">
                <div className="flex items-center gap-1 border-b border-surface-800 px-4 py-3">
                    {['AI Assistant', 'Ticket', 'Timeline'].map(t => <button key={t} className={`flex-1 text-[10px] py-1.5 rounded font-medium ${t === 'Ticket' ? 'bg-surface-800 text-white' : 'text-surface-500 hover:text-white'}`}>{t}</button>)}
                </div>
                <div className="p-4 border-b border-surface-800">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-surface-500 font-mono">{selectedTicket?.id}</span>
                        <MoreHorizontal size={14} className="text-surface-600 cursor-pointer hover:text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-4">{selectedTicket?.subject}</h3>
                    {[{ label: 'Customer', value: selectedTicket?.customer }, { label: 'Channel', value: selectedTicket?.channel }, { label: 'Assignee', value: 'Alex Rivera' }, { label: 'Priority', value: selectedTicket?.priority, red: true }, { label: 'SLA Limit', value: '12:13 AM' }].map(({ label, value, red }) => (
                        <div key={label} className="flex items-center justify-between py-1.5 border-b border-surface-800/50">
                            <span className="text-[11px] text-surface-500">{label}</span>
                            <span className={`text-[11px] font-medium ${red ? 'text-red-400' : 'text-surface-300'}`}>{value}</span>
                        </div>
                    ))}
                    <div className="flex gap-2 mt-4">
                        <button className="flex-1 py-2 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 text-xs font-medium">Reassign</button>
                        <button className="flex-1 py-2 rounded-lg bg-amber-500/80 text-white hover:bg-amber-500 text-xs font-medium">Re-open</button>
                    </div>
                </div>
                <div className="p-4">
                    <p className="text-[10px] uppercase font-bold text-surface-600 tracking-wider mb-3">Customer Details</p>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-full ${selectedTicket?.color} flex items-center justify-center text-xs font-bold`}>{selectedTicket?.initials}</div>
                        <span className="text-sm font-semibold text-white">{selectedTicket?.customer}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[{ label: 'Tickets', val: '1' }, { label: 'CSAT', val: '4.8' }, { label: 'Spent', val: '$2k' }].map(s => (
                            <div key={s.label} className="bg-surface-800/60 rounded-lg p-2 text-center border border-surface-750">
                                <p className="text-sm font-bold text-white">{s.val}</p>
                                <p className="text-[10px] text-surface-500">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AgentDashboard() {
    const { user, loading, logout } = useUser('agent');
    const [activeNav, setActiveNav] = useState('workspace');
    const [selectedTicket, setSelectedTicket] = useState(MOCK_TICKETS[0]);

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
                    {activeNav === 'workspace' && <WorkspaceView user={user} selectedTicket={selectedTicket} setSelectedTicket={setSelectedTicket} />}
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
