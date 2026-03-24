'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import {
    LayoutDashboard, BarChart2, Users, Brain, BookOpen, Settings, LogOut,
    Bell, Search, TrendingUp, Clock, MessageSquare, Zap, ChevronRight,
    ExternalLink, Upload, Link2, Trash2, RefreshCw, CheckCircle2,
    XCircle, Loader2, Plus, Shield, Eye, AlertTriangle, Globe,
    Database, SlidersHorizontal, Save, ToggleLeft, ToggleRight
} from 'lucide-react';

// ---- Mock Data ----
const TICKETS = [
    { id: 'TCK-4821', subject: 'Invoice higher than expected', customer: 'Jordan Matthews', priority: 'HIGH', status: 'Resolved', updated: '2m ago' },
    { id: 'TCK-4798', subject: 'API timeouts in production', customer: 'Acme Inc.', priority: 'MEDIUM', status: 'Resolved', updated: '18m ago' },
    { id: 'TCK-4785', subject: '2FA reset request', customer: 'Sarah Kim', priority: 'URGENT', status: 'Resolved', updated: '34m ago' },
    { id: 'TCK-4770', subject: 'Mobile app crash on login', customer: 'DevCorp Ltd.', priority: 'HIGH', status: 'Open', updated: '1h ago' },
    { id: 'TCK-4755', subject: 'Data export stuck at 0%', customer: 'Priya Nair', priority: 'MEDIUM', status: 'Open', updated: '2h ago' },
];
const AGENTS = [
    { id: 1, name: 'Alex Rivera', email: 'alex@helix.ai', status: 'online', csat: 4.9, tickets: 12, avatar: 'AR', color: 'bg-purple-500' },
    { id: 2, name: 'Priya Nair', email: 'priya@helix.ai', status: 'online', csat: 4.8, tickets: 9, avatar: 'PN', color: 'bg-blue-500' },
    { id: 3, name: 'Leila Santos', email: 'leila@helix.ai', status: 'away', csat: 4.7, tickets: 7, avatar: 'LS', color: 'bg-green-500' },
    { id: 4, name: 'Carlos Mendes', email: 'carlos@helix.ai', status: 'offline', csat: 4.5, tickets: 3, avatar: 'CM', color: 'bg-orange-500' },
];
const TOP_AGENTS = [
    { name: 'Alex Rivera', csat: '4.9', avatar: 'AR', color: 'bg-purple-500' },
    { name: 'Priya Nair', csat: '4.8', avatar: 'PN', color: 'bg-blue-500' },
    { name: 'Leila Santos', csat: '4.7', avatar: 'LS', color: 'bg-green-500' },
];
const ANALYTICS = [
    { label: 'Mon', tickets: 18, resolved: 14 },
    { label: 'Tue', tickets: 25, resolved: 20 },
    { label: 'Wed', tickets: 22, resolved: 19 },
    { label: 'Thu', tickets: 30, resolved: 24 },
    { label: 'Fri', tickets: 28, resolved: 25 },
    { label: 'Sat', tickets: 10, resolved: 9 },
    { label: 'Sun', tickets: 8, resolved: 8 },
];
const PRIORITY_BADGE: Record<string, string> = {
    URGENT: 'bg-red-500/15 text-red-400 border border-red-500/30',
    HIGH: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    MEDIUM: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    LOW: 'bg-surface-700 text-surface-400 border border-surface-600',
};
const NAV = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: BarChart2, label: 'Analytics', id: 'analytics' },
    { icon: Users, label: 'Agents', id: 'agents' },
    { icon: Brain, label: 'AI', id: 'ai' },
    { icon: BookOpen, label: 'Knowledge', id: 'knowledge' },
    { icon: Settings, label: 'Settings', id: 'settings' },
];

// ---- Sub-views ----
function DashboardView({ user, logout }: any) {
    const [stats, setStats] = useState({
        openTickets: 0,
        activeConvos: 0,
        avgResolution: '4.2h',
        aiRate: '35%'
    });
    const [recentTickets, setRecentTickets] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const tRes = await fetch('http://localhost:8000/api/v1/ticketing/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (tRes.ok) {
                    const data = await tRes.json();
                    setRecentTickets(data.slice(0, 5));
                    setStats(prev => ({
                        ...prev,
                        openTickets: data.filter((t: any) => t.status === 'open').length
                    }));
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="grid grid-cols-[1fr_280px] gap-6 h-full overflow-y-auto p-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-surface-500 text-sm mt-0.5">Live system status · {user?.tenant_id}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Open Tickets', value: stats.openTickets, sub: 'Live from system', icon: MessageSquare, color: 'text-blue-400' },
                        { label: 'Active Conversations', value: stats.activeConvos, sub: '2 pending AI handoff', icon: Zap, color: 'text-accent-400' },
                        { label: 'Avg Resolution Time', value: stats.avgResolution, sub: 'Enterprise benchmark', icon: Clock, color: 'text-green-400' },
                        { label: 'AI Resolution Rate', value: stats.aiRate, sub: 'Target: 50%', icon: TrendingUp, color: 'text-orange-400' },
                    ].map(({ label, value, sub, icon: Icon, color }) => (
                        <div key={label} className="bg-surface-800/60 border border-surface-750 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-surface-400 text-sm">{label}</span>
                                <Icon size={16} className={color} />
                            </div>
                            <p className="text-3xl font-bold text-white">{value}</p>
                            <p className="text-xs text-surface-500 mt-1">{sub}</p>
                        </div>
                    ))}
                </div>
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">Recent Tickets</h2>
                        <button className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1">View all <ExternalLink size={10} /></button>
                    </div>
                    <div className="space-y-2">
                        {recentTickets.length > 0 ? recentTickets.map((t: any) => (
                            <div key={t.id} className="bg-surface-800/60 border border-surface-750 rounded-xl px-5 py-4 flex items-center justify-between hover:border-surface-600 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <span className="text-surface-500 text-xs font-mono">TCK-{t.id}</span>
                                    <div>
                                        <p className="text-sm font-medium text-surface-200 group-hover:text-white transition-colors">{t.subject}</p>
                                        <p className="text-xs text-surface-500 mt-0.5">{t.customer_email || 'Anonymous'} · {new Date(t.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${PRIORITY_BADGE[t.priority.toUpperCase()] || PRIORITY_BADGE['MEDIUM']}`}>{t.priority.toUpperCase()}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${t.status === 'resolved' ? 'text-green-400 bg-green-500/10' : 'text-blue-400 bg-blue-500/10'}`}>{t.status}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 text-center text-surface-600 border-2 border-dashed border-surface-800 rounded-2xl">
                                <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
                                <p>No active tickets in this workspace.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-surface-300 mb-4">Current CSAT Score</h3>
                    <div className="flex flex-col items-center py-4">
                        <div className="relative w-28 h-28">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e2433" strokeWidth="10" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="10" strokeDasharray={`${(4.2 / 5) * 251} 251`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-black text-white">4.2</span>
                            </div>
                        </div>
                        <p className="text-green-400 text-xs font-medium mt-3">Excellent (+0.2 from last week)</p>
                    </div>
                </div>
                <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-surface-300 mb-4">Top Agents</h3>
                    <div className="space-y-3">
                        {TOP_AGENTS.map(agent => (
                            <div key={agent.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full ${agent.color} flex items-center justify-center text-xs font-bold text-white`}>{agent.avatar}</div>
                                    <div>
                                        <p className="text-sm font-medium text-surface-200">{agent.name}</p>
                                        <p className="text-[10px] text-surface-500">{agent.csat} CSAT</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-surface-600" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnalyticsView() {
    const maxTickets = Math.max(...ANALYTICS.map(d => d.tickets));
    return (
        <div className="p-6 space-y-6 overflow-y-auto">
            <div>
                <h1 className="text-xl font-bold text-white">Analytics</h1>
                <p className="text-surface-500 text-sm mt-0.5">Last 7 days performance overview</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Tickets', value: '141', delta: '+18%' },
                    { label: 'Resolved', value: '119', delta: '+12%' },
                    { label: 'Avg Handle Time', value: '4.2h', delta: '−8%' },
                    { label: 'CSAT', value: '4.2', delta: '+0.2' },
                ].map(s => (
                    <div key={s.label} className="bg-surface-800/60 border border-surface-750 rounded-xl p-5">
                        <p className="text-surface-400 text-xs mb-2">{s.label}</p>
                        <p className="text-2xl font-black text-white">{s.value}</p>
                        <p className="text-xs text-green-400 mt-1">{s.delta} vs last week</p>
                    </div>
                ))}
            </div>
            <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-surface-300 mb-6">Tickets This Week</h3>
                <div className="flex items-end gap-3 h-40">
                    {ANALYTICS.map(d => (
                        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex flex-col-reverse gap-0.5 flex-1">
                                <div className="w-full rounded-t" style={{ height: `${(d.resolved / maxTickets) * 130}px`, background: 'linear-gradient(to top, #7c3aed, #a78bfa)' }} />
                                <div className="w-full rounded-t opacity-30" style={{ height: `${((d.tickets - d.resolved) / maxTickets) * 130}px`, background: '#475569' }} />
                            </div>
                            <span className="text-[10px] text-surface-500">{d.label}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2 text-xs text-surface-400"><span className="w-3 h-3 rounded-sm bg-accent-500 opacity-80" />Resolved</div>
                    <div className="flex items-center gap-2 text-xs text-surface-400"><span className="w-3 h-3 rounded-sm bg-surface-600" />Unresolved</div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-surface-300 mb-4">Resolution by Channel</h3>
                    {[{ ch: 'Web Chat', pct: 62 }, { ch: 'Email', pct: 24 }, { ch: 'API', pct: 14 }].map(c => (
                        <div key={c.ch} className="mb-3">
                            <div className="flex justify-between text-xs mb-1.5"><span className="text-surface-300">{c.ch}</span><span className="text-surface-500">{c.pct}%</span></div>
                            <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                                <div className="h-full bg-accent-500 rounded-full" style={{ width: `${c.pct}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-surface-300 mb-4">Priority Breakdown</h3>
                    {[{ p: 'URGENT', count: 8, color: 'bg-red-500' }, { p: 'HIGH', count: 23, color: 'bg-orange-500' }, { p: 'MEDIUM', count: 55, color: 'bg-yellow-500' }, { p: 'LOW', count: 55, color: 'bg-surface-500' }].map(p => (
                        <div key={p.p} className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${p.color}`} /><span className="text-xs text-surface-300">{p.p}</span></div>
                            <span className="text-xs text-surface-400">{p.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AgentsView() {
    const STATUS: Record<string, string> = { online: 'bg-green-500', away: 'bg-yellow-400', offline: 'bg-surface-600' };
    return (
        <div className="p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Agents</h1>
                    <p className="text-surface-500 text-sm mt-0.5">Manage your support team</p>
                </div>
                <button className="flex items-center gap-2 bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors">
                    <Plus size={15} /> Invite Agent
                </button>
            </div>
            <div className="bg-surface-800/60 border border-surface-750 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-surface-800 text-[10px] uppercase font-bold text-surface-500 tracking-wider">
                    <span>Agent</span><span></span><span>Status</span><span>Open Tickets</span><span>CSAT</span><span>Actions</span>
                </div>
                {AGENTS.map(agent => (
                    <div key={agent.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-4 border-b border-surface-800/50 items-center hover:bg-surface-800/30 transition-colors">
                        <div className={`w-9 h-9 rounded-full ${agent.color} flex items-center justify-center text-xs font-bold`}>{agent.avatar}</div>
                        <div>
                            <p className="text-sm font-medium text-surface-200">{agent.name}</p>
                            <p className="text-xs text-surface-500">{agent.email}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-surface-400">
                            <span className={`w-2 h-2 rounded-full ${STATUS[agent.status]}`} />
                            {agent.status}
                        </div>
                        <span className="text-sm font-semibold text-surface-200 text-center">{agent.tickets}</span>
                        <span className="text-sm font-semibold text-green-400 text-center">{agent.csat}</span>
                        <div className="flex gap-2">
                            <button className="text-[10px] px-2 py-1 rounded bg-surface-700 text-surface-300 hover:bg-surface-600 transition-colors">Edit</button>
                            <button className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Remove</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AIView() {
    const [gpt4, setGpt4] = useState(true);
    const [rag, setRag] = useState(true);
    const [escalation, setEscalation] = useState(true);
    const Toggle = ({ val, onChange }: any) => (
        <button onClick={() => onChange(!val)} className={`transition-colors ${val ? 'text-accent-400' : 'text-surface-600'}`}>
            {val ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
        </button>
    );
    return (
        <div className="p-6 space-y-6 overflow-y-auto">
            <div>
                <h1 className="text-xl font-bold text-white">AI Configuration</h1>
                <p className="text-surface-500 text-sm mt-0.5">Control how Helix AI behaves for your workspace</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-surface-200">Model Settings</h3>
                    {[
                        { label: 'GPT-4o (Recommended)', sub: 'Best reasoning and accuracy', val: gpt4, set: setGpt4 },
                        { label: 'RAG Pipeline', sub: 'Ground answers in your docs', val: rag, set: setRag },
                        { label: 'Human Escalation', sub: 'Auto-escalate when AI fails', val: escalation, set: setEscalation },
                    ].map(s => (
                        <div key={s.label} className="flex items-center justify-between py-3 border-b border-surface-800">
                            <div>
                                <p className="text-sm font-medium text-surface-200">{s.label}</p>
                                <p className="text-xs text-surface-500">{s.sub}</p>
                            </div>
                            <Toggle val={s.val} onChange={s.set} />
                        </div>
                    ))}
                </div>
                <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-surface-200">Response Tuning</h3>
                    <div>
                        <label className="text-xs text-surface-400 block mb-2">System Prompt</label>
                        <textarea className="w-full bg-surface-900 border border-surface-700 rounded-lg p-3 text-sm text-surface-300 resize-none outline-none focus:border-accent-500/50 h-28" defaultValue="You are Helix AI, a helpful support assistant. Always be concise, professional, and cite document sources." />
                    </div>
                    <div>
                        <label className="text-xs text-surface-400 block mb-2">Temperature: 0.3</label>
                        <input type="range" min="0" max="1" step="0.1" defaultValue="0.3" className="w-full accent-accent-500" />
                        <div className="flex justify-between text-[10px] text-surface-600 mt-1"><span>Precise</span><span>Creative</span></div>
                    </div>
                    <button className="w-full bg-accent-600 hover:bg-accent-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"><Save size={14} /> Save Configuration</button>
                </div>
            </div>
            <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-surface-200 mb-4">Live AI Stats</h3>
                <div className="grid grid-cols-4 gap-4">
                    {[{ label: 'Tokens Used', value: '42,891', icon: Database }, { label: 'AI Resolved', value: '35%', icon: Zap }, { label: 'Avg Latency', value: '1.2s', icon: Clock }, { label: 'Handoff Rate', value: '16%', icon: AlertTriangle }].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="text-center p-4 bg-surface-900/50 rounded-xl border border-surface-800">
                            <Icon size={18} className="mx-auto text-accent-400 mb-2" />
                            <p className="text-xl font-black text-white">{value}</p>
                            <p className="text-[10px] text-surface-500 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function KnowledgeView({ user }: any) {
    const [docs, setDocs] = useState<any[]>([]);
    const [urlInput, setUrlInput] = useState('');
    const [urlName, setUrlName] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://localhost:8000/api/v1/knowledge/documents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setDocs(await res.json());
        } catch (error) { console.error("Docs fetch error:", error); }
    };

    const STATUS_ICON: Record<string, any> = {
        ready: <CheckCircle2 size={14} className="text-green-400" />,
        processing: <Loader2 size={14} className="text-yellow-400 animate-spin" />,
        failed: <XCircle size={14} className="text-red-400" />,
        pending: <Clock size={14} className="text-surface-400" />,
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const token = localStorage.getItem('access_token');
        setUploading(true);
        const form = new FormData();
        form.append('file', file);
        try {
            const res = await fetch('http://localhost:8000/api/v1/knowledge/documents/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: form
            });
            if (res.ok) {
                await fetchDocs();
            }
        } catch { }
        setUploading(false);
    };

    const handleIngestURL = async () => {
        if (!urlInput || !urlName) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://localhost:8000/api/v1/knowledge/documents/ingest-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ url: urlInput, name: urlName })
            });
            if (res.ok) {
                await fetchDocs();
                setUrlInput(''); setUrlName('');
            }
        } catch { }
    };
    return (
        <div className="p-6 space-y-6 overflow-y-auto">
            <div>
                <h1 className="text-xl font-bold text-white">Knowledge Base</h1>
                <p className="text-surface-500 text-sm mt-0.5">Feed documents to your AI — PDF, TXT, MD, or URLs</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {/* Upload panel */}
                <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2"><Upload size={15} className="text-accent-400" />Upload Document</h3>
                    <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-surface-700 hover:border-accent-500/50 rounded-xl p-8 text-center transition-colors group">
                        <Upload size={24} className="mx-auto text-surface-600 group-hover:text-accent-400 mb-2 transition-colors" />
                        <p className="text-sm text-surface-400 group-hover:text-surface-300">{uploading ? 'Uploading...' : 'Click to upload PDF, TXT, or MD'}</p>
                        <p className="text-xs text-surface-600 mt-1">Max 50MB per file</p>
                    </button>
                    <input ref={fileRef} type="file" accept=".pdf,.txt,.md" className="hidden" onChange={handleUpload} />
                </div>
                {/* URL panel */}
                <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2"><Globe size={15} className="text-blue-400" />Ingest from URL</h3>
                    <input value={urlName} onChange={e => setUrlName(e.target.value)} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-300 placeholder:text-surface-600 outline-none focus:border-accent-500/50" placeholder="Display name (e.g. Help Center)" />
                    <input value={urlInput} onChange={e => setUrlInput(e.target.value)} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-300 placeholder:text-surface-600 outline-none focus:border-accent-500/50" placeholder="https://docs.example.com/..." />
                    <button onClick={handleIngestURL} disabled={!urlInput || !urlName} className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${urlInput && urlName ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-surface-700 text-surface-500 cursor-not-allowed'}`}>
                        <Link2 size={14} /> Start Ingestion
                    </button>
                </div>
            </div>
            {/* Document list */}
            <div className="bg-surface-800/60 border border-surface-750 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-surface-800 text-[10px] uppercase font-bold text-surface-500 tracking-wider">
                    <span>Document</span><span>Type</span><span>Status</span><span>Chunks</span><span>Actions</span>
                </div>
                {docs.map(doc => (
                    <div key={doc.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 border-b border-surface-800/50 items-center hover:bg-surface-800/30 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-surface-200">{doc.name}</p>
                            <p className="text-xs text-surface-500">Updated {doc.updated}</p>
                        </div>
                        <span className="text-[10px] bg-surface-700 text-surface-400 px-2 py-0.5 rounded font-medium uppercase">{doc.type}</span>
                        <div className="flex items-center gap-1.5 text-xs text-surface-400 capitalize">
                            {STATUS_ICON[doc.status]} {doc.status}
                        </div>
                        <span className="text-sm text-surface-400 text-center">{doc.status === 'ready' ? doc.chunks : '—'}</span>
                        <div className="flex gap-2">
                            <button className="text-surface-500 hover:text-white transition-colors"><Eye size={14} /></button>
                            <button className="text-surface-500 hover:text-yellow-400 transition-colors"><RefreshCw size={14} /></button>
                            <button onClick={() => setDocs(d => d.filter(x => x.id !== doc.id))} className="text-surface-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SettingsView({ user, logout }: any) {
    return (
        <div className="p-6 space-y-6 overflow-y-auto">
            <div>
                <h1 className="text-xl font-bold text-white">Settings</h1>
                <p className="text-surface-500 text-sm mt-0.5">Manage your workspace and account</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-surface-200">Workspace</h3>
                    <div><label className="text-xs text-surface-400 block mb-1.5">Workspace Name</label><input defaultValue={user?.tenant_id || ''} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-300 outline-none focus:border-accent-500/50" /></div>
                    <div><label className="text-xs text-surface-400 block mb-1.5">Admin Email</label><input defaultValue={user?.sub || ''} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-300 outline-none focus:border-accent-500/50" /></div>
                    <button className="w-full bg-accent-600 hover:bg-accent-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"><Save size={14} />Save Changes</button>
                </div>
                <div className="bg-surface-800/60 border border-surface-750 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-surface-200">Security</h3>
                    <div><label className="text-xs text-surface-400 block mb-1.5">Current Password</label><input type="password" className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-300 outline-none focus:border-accent-500/50" placeholder="••••••••" /></div>
                    <div><label className="text-xs text-surface-400 block mb-1.5">New Password</label><input type="password" className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-300 outline-none focus:border-accent-500/50" placeholder="••••••••" /></div>
                    <button className="w-full bg-surface-700 hover:bg-surface-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Update Password</button>
                </div>
            </div>
            <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-xs text-surface-500 mb-4">Once you delete your workspace, there is no going back. All data will be lost.</p>
                <button className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors">Delete Workspace</button>
            </div>
        </div>
    );
}

// ---- Main Export ----
export default function AdminDashboard() {
    const { user, loading, logout } = useUser('admin');
    const [activeNav, setActiveNav] = useState('dashboard');

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-surface-950">
            <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
    );

    const views: Record<string, JSX.Element> = {
        dashboard: <DashboardView user={user} logout={logout} />,
        analytics: <AnalyticsView />,
        agents: <AgentsView />,
        ai: <AIView />,
        knowledge: <KnowledgeView user={user} />,
        settings: <SettingsView user={user} logout={logout} />,
    };

    return (
        <div className="flex h-screen bg-surface-950 text-white font-sans selection:bg-purple-500/30 overflow-hidden text-sm">
            {/* Expanded Sidebar */}
            <aside className="w-64 bg-surface-950 flex flex-col py-6 border-r border-surface-800/50 shrink-0">
                <div className="px-6 mb-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Zap size={20} className="text-white fill-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tighter leading-none">HELIX</span>
                        <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mt-0.5">Control Center</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <p className="px-4 text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                    {NAV.map(({ icon: Icon, label, id }) => (
                        <button
                            key={id}
                            onClick={() => setActiveNav(id)}
                            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all relative group ${activeNav === id ? 'bg-purple-500 text-white shadow-xl shadow-purple-500/20' : 'text-surface-500 hover:text-white hover:bg-surface-800/50'}`}
                        >
                            <Icon size={18} className={activeNav === id ? 'text-white' : 'text-surface-600 group-hover:text-purple-400'} />
                            <span className="font-bold tracking-tight">{label}</span>
                            {activeNav === id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                        </button>
                    ))}
                </nav>

                <div className="px-4 mt-6">
                    <div className="bg-surface-900 border border-surface-800 rounded-3xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-xs font-black">
                                {user?.sub?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{user?.sub?.split('@')[0]}</p>
                                <p className="text-[10px] text-surface-600 font-medium">Administrator</p>
                            </div>
                        </div>
                        <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2 bg-surface-800 hover:bg-red-500/10 text-surface-400 hover:text-red-400 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-500/20">
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* System Header */}
                <header className="h-20 bg-surface-950/50 backdrop-blur-xl border-b border-surface-800/50 flex items-center justify-between px-10 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-600 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                className="bg-surface-900 border border-surface-800 rounded-2xl py-2.5 pl-12 pr-6 text-sm text-surface-300 placeholder:text-surface-600 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 w-80 transition-all"
                                placeholder="Global search commands..."
                            />
                        </div>
                        <div className="h-6 w-px bg-surface-800" />
                        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">All systems nominal</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-xl border border-surface-800 flex items-center justify-center text-surface-500 hover:text-white hover:bg-surface-800 transition-all relative">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border-2 border-surface-950" />
                        </button>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-white uppercase tracking-tighter">{user?.tenant_id}</span>
                            <span className="text-[10px] text-surface-600 font-medium">Core Enterprise V2</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden">
                    {views[activeNav]}
                </main>
            </div>
        </div>
    );
}
