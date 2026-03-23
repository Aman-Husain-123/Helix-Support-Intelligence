import React, { useState } from 'react';
import { useUser } from '../context/AuthContext';

// ── Admin Dashboard ───────────────────────────────────────────────────────────
// Permissions: manage agents, configure AI, upload knowledge base, view analytics

type AdminTab = 'agents' | 'ai' | 'knowledge' | 'analytics' | 'settings';

// ── Mock data ─────────────────────────────────────────────────────────────────

export interface AgentData {
    id: string;
    name: string;
    role: string;
    email: string;
    status: 'available' | 'busy' | 'offline';
    tickets: number;
    csat: number;
    since: string;
    skills: string[];
    maxConcurrent: number;
}

const INITIAL_AGENTS: AgentData[] = [
    { id: 'u1', name: 'Alex Rivera', role: 'agent', email: 'agent@helix.io', status: 'available', tickets: 2, csat: 4.9, since: 'Jan 2024', skills: ['billing', 'general'], maxConcurrent: 5 },
    { id: 'u4', name: 'Priya Nair', role: 'agent', email: 'priya@helix.io', status: 'available', tickets: 1, csat: 4.8, since: 'Mar 2024', skills: ['technical', 'api'], maxConcurrent: 4 },
    { id: 'u5', name: 'Sam Cho', role: 'agent', email: 'sam@helix.io', status: 'busy', tickets: 5, csat: 4.6, since: 'Jun 2024', skills: ['security', 'general'], maxConcurrent: 5 },
    { id: 'u6', name: 'Leila Santos', role: 'agent', email: 'leila@helix.io', status: 'offline', tickets: 0, csat: 4.7, since: 'Aug 2024', skills: ['enterprise', 'sales'], maxConcurrent: 3 },
];

export type DocStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface DocItem {
    id: string;
    name: string;
    type: 'file' | 'url';
    size: string;
    updated: string;
    chunks: number;
    collection: string;
    status: DocStatus;
    version: number;
}

const INITIAL_DOCS: DocItem[] = [
    { id: 'd1', name: 'billing/plan-changes.md', type: 'file', size: '12 KB', updated: '2d ago', chunks: 34, collection: 'Billing', status: 'ready', version: 1 },
    { id: 'd2', name: 'billing/refunds.pdf', type: 'file', size: '1.2 MB', updated: '5d ago', chunks: 142, collection: 'Billing', status: 'ready', version: 2 },
    { id: 'd3', name: 'api/limits.md', type: 'file', size: '15 KB', updated: '1w ago', chunks: 41, collection: 'Technical', status: 'ready', version: 1 },
    { id: 'd4', name: 'https://docs.helix.io/security', type: 'url', size: '-', updated: '2w ago', chunks: 18, collection: 'Security', status: 'ready', version: 3 },
    { id: 'd5', name: 'features/export.md', type: 'file', size: '9 KB', updated: '3w ago', chunks: 27, collection: 'General', status: 'ready', version: 1 },
];

const ANALYTICS_METRICS = [
    { label: 'Total Tickets', val: '1,284', delta: '+12%', up: true },
    { label: 'Avg. CSAT', val: '4.76', delta: '+0.3', up: true },
    { label: 'Avg. First Response', val: '4.2 min', delta: '-18%', up: true },
    { label: 'AI Resolution Rate', val: '38%', delta: '+6%', up: true },
    { label: 'Escalation Rate', val: '8.1%', delta: '-2%', up: true },
    { label: 'Open Tickets', val: '47', delta: '+3', up: false },
];

const STATUS_COLOR: Record<string, string> = { available: 'bg-emerald-500', busy: 'bg-rose-500', offline: 'bg-slate-600' };

const CHART_BARS = [42, 58, 35, 72, 88, 65, 51, 90, 78, 63, 84, 70, 55, 91];

// ── Admin View component ──────────────────────────────────────────────────────

export const AdminView: React.FC = () => {
    const { user, logout } = useUser();
    const [tab, setTab] = useState<AdminTab>('analytics');

    // AI Config State (In-Memory MVP)
    const [aiModel, setAiModel] = useState('gpt-4o');
    const [temperature, setTemperature] = useState(0.4);
    const [ragEnabled, setRagEnabled] = useState(true);
    const [maxTokens, setMaxTokens] = useState(1024);
    const [systemPrompt, setSystemPrompt] = useState('You are Helix AI, a helpful customer support assistant. Always be empathetic, concise, and accurate. When unsure, say so and escalate.');
    const [configSaved, setConfigSaved] = useState(false);

    // Agent Management State
    const [agents, setAgents] = useState<AgentData[]>([...INITIAL_AGENTS]);
    const [agentFilter, setAgentFilter] = useState('all');
    const [editingAgent, setEditingAgent] = useState<AgentData | null>(null);

    // Knowledge Base State
    const [docs, setDocs] = useState<DocItem[]>([...INITIAL_DOCS]);
    const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
    const [uploadUrl, setUploadUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [chunkSize, setChunkSize] = useState<number>(1000);
    const [chunkOverlap, setChunkOverlap] = useState<number>(200);
    const [collection, setCollection] = useState('General');

    const saveConfig = () => {
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 2500);
    };

    const handleUpload = () => {
        if (uploadType === 'url' && !uploadUrl.trim()) return;
        if (uploadType === 'file' && !selectedFile) {
            alert("Please select a file to upload first.");
            return;
        }

        const newId = Date.now().toString();
        const newDoc: DocItem = {
            id: newId,
            name: uploadType === 'file' ? selectedFile!.name : uploadUrl,
            type: uploadType,
            size: uploadType === 'file' ? `${(selectedFile!.size / 1024).toFixed(1)} KB` : '-',
            updated: 'Just now',
            chunks: 0,
            collection: collection,
            status: 'pending',
            version: 1,
        };

        setDocs(prev => [newDoc, ...prev]);
        setUploadUrl('');
        setSelectedFile(null);

        // Simulate async worker pipeline (Parse -> Chunk -> Embed EURI -> pgvector Store)
        setTimeout(() => {
            setDocs(prev => prev.map(d => d.id === newId ? { ...d, status: 'processing' } : d));
            setTimeout(() => {
                setDocs(prev => prev.map(d => d.id === newId ? {
                    ...d,
                    status: 'ready',
                    // Simulate chunks based on chunk size setting
                    chunks: Math.floor(Math.random() * 40 * (1000 / chunkSize)) + 5
                } : d));
            }, 3000); // 3 sec processing
        }, 1500); // 1.5 sec pending
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"? This soft-deletes the document but hard-deletes vectors from pgvector.`)) {
            setDocs(prev => prev.filter(d => d.id !== id));
        }
    };

    const saveAgent = () => {
        if (!editingAgent) return;
        setAgents(prev => prev.map(a => a.id === editingAgent.id ? editingAgent : a));
        setEditingAgent(null);
    };

    const tabs: { id: AdminTab; label: string; icon: string }[] = [
        { id: 'analytics', label: 'Analytics', icon: '📊' },
        { id: 'agents', label: 'Agents', icon: '👥' },
        { id: 'ai', label: 'AI Config', icon: '🤖' },
        { id: 'knowledge', label: 'Knowledge Base', icon: '📚' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="flex h-screen w-screen flex-col bg-background bg-grid-pattern font-sans text-slate-100">
            {/* Top bar */}
            <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-border bg-sidebar/90 px-4 backdrop-blur-xl">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30 animate-glow">
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-white">
                            <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M3 6l7 4 7-4M10 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[13px] font-semibold text-slate-100">Helix</span>
                        <span className="text-[10px] text-rose-400">Admin Dashboard</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/8 px-2.5 py-1 text-[10px] font-medium text-rose-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                        Admin · {user?.tenantId}
                    </span>
                    <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${user?.avatarColor} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {user?.avatarInitials}
                    </div>
                    <span className="text-[12px] font-medium text-slate-300 hidden sm:block">{user?.name}</span>
                    <button onClick={logout} className="text-[11px] text-slate-500 hover:text-slate-200 transition">Sign out</button>
                </div>
            </header>

            <div className="flex min-h-0 flex-1">
                {/* Sidebar */}
                <aside className="flex w-16 flex-col items-center border-r border-border bg-sidebar/60 py-4 gap-1">
                    {tabs.map((t) => (
                        <button key={t.id} onClick={() => setTab(t.id)} title={t.label}
                            className={`flex flex-col items-center gap-1 rounded-xl p-2.5 transition w-12 ${tab === t.id ? 'bg-rose-500/20 text-rose-300' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}>
                            <span className="text-lg leading-none">{t.icon}</span>
                            <span className="text-[9px] font-medium">{t.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </aside>

                {/* Content */}
                <main className="flex-1 overflow-y-auto px-6 py-5">

                    {/* ── Analytics ── */}
                    {tab === 'analytics' && (
                        <div className="animate-fade-in space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-100">Analytics Overview</h2>
                                <p className="text-[12px] text-slate-500">Last 30 days · {user?.tenantId}</p>
                            </div>

                            {/* Metrics grid */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {ANALYTICS_METRICS.map(({ label, val, delta, up }) => (
                                    <div key={label} className="rounded-xl border border-border bg-surface/50 p-4">
                                        <p className="text-[11px] font-medium text-slate-500">{label}</p>
                                        <p className="mt-1 text-[22px] font-bold text-slate-100">{val}</p>
                                        <p className={`mt-1 text-[11px] font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {up ? '↑' : '↓'} {delta} vs last month
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Bar chart (visual only) */}
                            <div className="rounded-xl border border-border bg-surface/50 p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-[13px] font-semibold text-slate-200">Tickets resolved per day</p>
                                    <span className="text-[10px] text-slate-500">Past 14 days</span>
                                </div>
                                <div className="flex items-end gap-1.5 h-28">
                                    {CHART_BARS.map((h, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                            <div className="w-full rounded-t-sm bg-gradient-to-t from-indigo-600 to-indigo-400 opacity-80 group-hover:opacity-100 transition"
                                                style={{ height: `${h}%` }} />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 flex justify-between text-[10px] text-slate-600">
                                    <span>Mar 9</span><span>Mar 22</span>
                                </div>
                            </div>

                            {/* Top agents */}
                            <div className="rounded-xl border border-border bg-surface/50 p-5">
                                <p className="mb-3 text-[13px] font-semibold text-slate-200">Top agents by CSAT</p>
                                <div className="space-y-2.5">
                                    {[...agents].sort((a, b) => b.csat - a.csat).map((a, i) => (
                                        <div key={a.id} className="flex items-center gap-3">
                                            <span className="w-5 text-[11px] font-mono text-slate-500">#{i + 1}</span>
                                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-[10px] font-bold text-white">
                                                {a.name.split(' ').map((n) => n[0]).join('')}
                                            </div>
                                            <span className="flex-1 text-[12px] text-slate-200">{a.name}</span>
                                            <div className="flex items-center gap-1">
                                                <div className="h-1.5 rounded-full bg-indigo-500/30 w-24 overflow-hidden">
                                                    <div className="h-full rounded-full bg-indigo-400" style={{ width: `${((a.csat - 4) / 1) * 100}%` }} />
                                                </div>
                                                <span className="text-[11px] font-semibold text-slate-200 w-8 text-right">{a.csat}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Agents ── */}
                    {tab === 'agents' && (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-100">Agent Management</h2>
                                    <p className="text-[12px] text-slate-500">{agents.length} agents · {user?.tenantId}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={agentFilter}
                                        onChange={e => setAgentFilter(e.target.value)}
                                        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] text-slate-200 outline-none focus:border-indigo-500/60"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="available">Available</option>
                                        <option value="busy">Busy</option>
                                        <option value="offline">Offline</option>
                                    </select>
                                    <button className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-[12px] font-medium text-slate-300 hover:border-rose-500/40 hover:text-rose-300 transition">
                                        + Invite agent
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-surface/50">
                                            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Agent</th>
                                            <th className="hidden px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500 sm:table-cell">Email</th>
                                            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Status</th>
                                            <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500">Tickets</th>
                                            <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500">CSAT</th>
                                            <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {agents.filter(a => agentFilter === 'all' || a.status === agentFilter).map((a) => (
                                            <tr key={a.id} className="hover:bg-surfaceHover transition">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="relative">
                                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-[11px] font-bold text-white">
                                                                {a.name.split(' ').map((n) => n[0]).join('')}
                                                            </div>
                                                            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-1 ring-background ${STATUS_COLOR[a.status]}`} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[12px] font-medium text-slate-200">{a.name}</p>
                                                            <p className="text-[10px] text-slate-500">Since {a.since}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden px-4 py-3 sm:table-cell">
                                                    <span className="font-mono text-[11px] text-slate-400">{a.email}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`capitalize text-[11px] font-medium ${a.status === 'available' ? 'text-emerald-400' : a.status === 'busy' ? 'text-rose-400' : 'text-slate-400'
                                                        }`}>{a.status}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-[12px] text-slate-300">{a.tickets}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-[12px] font-semibold text-emerald-400">{a.csat}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => setEditingAgent({ ...a })} className="mr-3 text-[11px] text-indigo-400 hover:text-indigo-300 transition">Edit</button>
                                                    <button className="text-[11px] text-slate-500 hover:text-rose-400 transition">Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── AI Config ── */}
                    {tab === 'ai' && (
                        <div className="animate-fade-in max-w-2xl space-y-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-100">AI Configuration</h2>
                                <p className="text-[12px] text-slate-500">Configure Helix AI behavior for your tenant · {user?.tenantId}</p>
                            </div>

                            <div className="rounded-xl border border-border bg-surface/50 divide-y divide-border overflow-hidden">
                                {/* Model */}
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <p className="text-[12px] font-semibold text-slate-200">Language Model</p>
                                        <p className="text-[11px] text-slate-500">Base LLM used for AI responses</p>
                                    </div>
                                    <select value={aiModel} onChange={(e) => setAiModel(e.target.value)}
                                        className="rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] text-slate-200 outline-none focus:border-indigo-500/60 transition">
                                        <option value="gpt-4o">gpt-4o</option>
                                        <option value="gpt-4o-mini">gpt-4o-mini</option>
                                        <option value="gpt-4-turbo">gpt-4-turbo</option>
                                        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                                    </select>
                                </div>

                                {/* RAG toggle */}
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <p className="text-[12px] font-semibold text-slate-200">RAG (Knowledge Retrieval)</p>
                                        <p className="text-[11px] text-slate-500">Augment AI responses with your knowledge base</p>
                                    </div>
                                    <button onClick={() => setRagEnabled((r) => !r)}
                                        className={`relative h-6 w-11 rounded-full transition ${ragEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${ragEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>

                                {/* Temperature */}
                                <div className="px-4 py-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <div>
                                            <p className="text-[12px] font-semibold text-slate-200">Temperature</p>
                                            <p className="text-[11px] text-slate-500">Controls AI creativity vs determinism</p>
                                        </div>
                                        <span className="font-mono text-[13px] font-bold text-indigo-300">{temperature.toFixed(1)}</span>
                                    </div>
                                    <input type="range" min="0" max="2" step="0.1" value={temperature}
                                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                        className="w-full accent-indigo-500" />
                                    <div className="mt-1 flex justify-between text-[10px] text-slate-600">
                                        <span>0.0 — Precise</span><span>2.0 — Creative</span>
                                    </div>
                                </div>

                                {/* Max tokens */}
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <p className="text-[12px] font-semibold text-slate-200">Max Response Tokens</p>
                                        <p className="text-[11px] text-slate-500">Maximum length of AI reply</p>
                                    </div>
                                    <input type="number" min="256" max="8192" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value) || 256)}
                                        className="rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] text-slate-200 outline-none focus:border-indigo-500/60 transition w-24 text-right"
                                    />
                                </div>

                                {/* System prompt */}
                                <div className="px-4 py-3">
                                    <p className="mb-1.5 text-[12px] font-semibold text-slate-200">System Prompt</p>
                                    <p className="mb-2 text-[11px] text-slate-500">Base instructions given to the AI for every conversation</p>
                                    <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={4}
                                        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-[12px] text-slate-200 outline-none focus:border-indigo-500/60 transition" />
                                </div>

                                {/* Save */}
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-[11px] text-slate-500">
                                        Changes apply immediately to all new conversations
                                    </span>
                                    <button onClick={saveConfig}
                                        className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-semibold text-white transition ${configSaved ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/20'
                                            } shadow-md`}>
                                        {configSaved ? '✓ Saved' : 'Save config'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Knowledge Base ── */}
                    {tab === 'knowledge' && (
                        <div className="animate-fade-in max-w-2xl space-y-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-100">Knowledge Base</h2>
                                <p className="text-[12px] text-slate-500">Documents used by Helix AI for RAG retrieval · {user?.tenantId}</p>
                            </div>

                            {/* Upload Panel */}
                            <div className="rounded-xl border border-border bg-surface/50 p-6">
                                <h3 className="mb-4 text-[14px] font-semibold text-slate-200">Ingest New Data</h3>

                                {/* Upload Type Toggle */}
                                <div className="mb-5 inline-flex rounded-lg bg-background p-1">
                                    <button onClick={() => setUploadType('file')} className={`rounded-md px-4 py-1.5 text-[12px] font-medium transition ${uploadType === 'file' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>File Upload</button>
                                    <button onClick={() => setUploadType('url')} className={`rounded-md px-4 py-1.5 text-[12px] font-medium transition ${uploadType === 'url' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>URL Ingestion</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        {/* File / URL Input */}
                                        {uploadType === 'file' ? (
                                            <div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={e => e.target.files && setSelectedFile(e.target.files[0])}
                                                    className="hidden"
                                                    accept=".pdf,.txt,.md"
                                                />
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${selectedFile ? 'border-indigo-500 bg-indigo-500/10' : 'border-border bg-background/50 hover:border-indigo-500/40'}`}>
                                                    <svg className={`mb-2 h-6 w-6 ${selectedFile ? 'text-indigo-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={selectedFile ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"} /></svg>
                                                    <p className={`text-[12px] font-medium ${selectedFile ? 'text-indigo-300' : 'text-slate-300'} text-center px-4 truncate w-full`}>
                                                        {selectedFile ? selectedFile.name : 'Browse PDF, TXT, MD'}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="mb-1.5 block text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Target URL</label>
                                                <input value={uploadUrl} onChange={e => setUploadUrl(e.target.value)} placeholder="https://docs.example.com" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-indigo-500/60" />
                                            </div>
                                        )}

                                        <div>
                                            <label className="mb-1.5 block text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Collection</label>
                                            <select value={collection} onChange={e => setCollection(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-indigo-500/60">
                                                <option value="General">General</option>
                                                <option value="Billing">Billing</option>
                                                <option value="Technical">Technical</option>
                                                <option value="Security">Security</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4 rounded-xl border border-border bg-background/30 p-4">
                                        <p className="text-[12px] font-semibold text-slate-300 mb-2">Ingestion Pipeline config</p>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-slate-400">Chunk Size</span>
                                                <span className="font-mono text-indigo-300">{chunkSize}</span>
                                            </div>
                                            <input type="range" min="200" max="2000" step="100" value={chunkSize} onChange={e => setChunkSize(parseInt(e.target.value))} className="w-full accent-indigo-500 h-1" />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-slate-400">Chunk Overlap</span>
                                                <span className="font-mono text-indigo-300">{chunkOverlap}</span>
                                            </div>
                                            <input type="range" min="0" max="500" step="50" value={chunkOverlap} onChange={e => setChunkOverlap(parseInt(e.target.value))} className="w-full accent-indigo-500 h-1" />
                                        </div>

                                        <button onClick={handleUpload} className="w-full mt-2 rounded-lg bg-indigo-500 py-2 text-[12px] font-semibold text-white transition hover:bg-indigo-400 shadow-lg shadow-indigo-500/20">
                                            Start Ingestion
                                        </button>
                                        <p className="text-[10px] text-center text-slate-500">Embedded via EURI API & stored in pgvector</p>
                                    </div>
                                </div>
                            </div>

                            {/* Existing docs table */}
                            <div className="overflow-hidden rounded-xl border border-border bg-surface/30">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border bg-surface/80 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                                            <th className="px-4 py-3">Document</th>
                                            <th className="px-4 py-3">Collection</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Chunks / Ver</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {docs.map((d) => (
                                            <tr key={d.id} className="hover:bg-surfaceHover transition">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {d.type === 'file' ? (
                                                            <svg className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                        ) : (
                                                            <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="font-mono text-[12px] text-slate-200 truncate max-w-[200px]">{d.name}</span>
                                                            <span className="text-[10px] text-slate-500">{d.size} · Updated {d.updated}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700">{d.collection}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold ${d.status === 'ready' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                        : d.status === 'processing' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                            : d.status === 'failed' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                                                : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                                        }`}>
                                                        {d.status === 'processing' && <svg className="h-2 w-2 animate-spin text-amber-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" /></svg>}
                                                        {d.status === 'ready' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                                                        {d.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="block text-[12px] text-slate-300 font-mono">{d.chunks > 0 ? d.chunks : '-'} chunks</span>
                                                    <span className="text-[10px] text-slate-500">v{d.version}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleDelete(d.id, d.name)} className="text-[11px] font-medium text-slate-500 hover:text-rose-400 transition underline underline-offset-2">Del</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Settings ── */}
                    {tab === 'settings' && (
                        <div className="animate-fade-in max-w-2xl space-y-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-100">Global Settings</h2>
                                <p className="text-[12px] text-slate-500">System configurations and security · {user?.tenantId}</p>
                            </div>

                            {/* API Keys */}
                            <div className="rounded-xl border border-border bg-surface/50 p-5">
                                <h3 className="mb-4 text-[13px] font-semibold text-slate-200">API Credentials</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-semibold text-slate-400">OpenAI API Key</label>
                                        <input type="password" value="sk-xyz123supersecretkeythatishidden" readOnly className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-slate-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-semibold text-slate-400">EURI / Vector DB Endpoint</label>
                                        <input type="text" value="https://api.euri.com/v1/vector" readOnly className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-slate-500 outline-none" />
                                    </div>
                                    <button className="rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-4 py-1.5 text-[11px] font-medium text-indigo-300 hover:bg-indigo-500/25 transition">
                                        Rotate Keys
                                    </button>
                                </div>
                            </div>

                            {/* Security Status */}
                            <div className="rounded-xl border border-border bg-surface/50 p-5">
                                <h3 className="mb-4 text-[13px] font-semibold text-slate-200">Security & Compliance</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                                        <div className="flex items-center gap-2">
                                            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.965 11.965 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            <span className="text-[12px] font-medium text-slate-200">End-to-End Encryption</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Active</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                                        <div className="flex items-center gap-2">
                                            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            <span className="text-[12px] font-medium text-slate-200">SOC2 Compliance Mode</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Active</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                                        <div className="flex items-center gap-2">
                                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            <span className="text-[12px] font-medium text-slate-400">Data Export</span>
                                        </div>
                                        <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wide">Download Logs</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Agent Edit Modal */}
            {editingAgent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
                    <div className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-2xl overflow-hidden text-slate-200">
                        <div className="flex justify-between items-center bg-surfaceHover px-4 py-3 border-b border-border">
                            <h3 className="text-[14px] font-bold text-slate-100">Edit Agent: {editingAgent.name}</h3>
                            <button onClick={() => setEditingAgent(null)} className="text-slate-500 hover:text-slate-300 text-lg">&times;</button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-[11px] font-semibold text-slate-400 uppercase">Status</label>
                                <select
                                    value={editingAgent.status}
                                    onChange={e => setEditingAgent({ ...editingAgent, status: e.target.value as any })}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] outline-none focus:border-indigo-500"
                                >
                                    <option value="available">Available</option>
                                    <option value="busy">Busy</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[11px] font-semibold text-slate-400 uppercase">Max Concurrent Tickets</label>
                                <input
                                    type="number" min="1" max="20"
                                    value={editingAgent.maxConcurrent}
                                    onChange={e => setEditingAgent({ ...editingAgent, maxConcurrent: parseInt(e.target.value) || 1 })}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[11px] font-semibold text-slate-400 uppercase">Skills (comma separated)</label>
                                <input
                                    type="text"
                                    value={editingAgent.skills.join(', ')}
                                    onChange={e => setEditingAgent({ ...editingAgent, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    placeholder="e.g. billing, technical"
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 p-4 border-t border-border bg-surfaceHover">
                            <button onClick={() => setEditingAgent(null)} className="flex-1 rounded-lg border border-border py-2 text-[12px] font-medium text-slate-300 hover:bg-slate-800 transition">Cancel</button>
                            <button onClick={saveAgent} className="flex-1 rounded-lg bg-indigo-500 py-2 text-[12px] font-medium text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
