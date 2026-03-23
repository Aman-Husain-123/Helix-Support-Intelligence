import React, { useRef, useState } from 'react';
import { useUser } from '../context/AuthContext';

// ── Customer View ────────────────────────────────────────────────────────────
// Permissions: chat with AI, create/view tickets, browse help center

type CustomerTab = 'chat' | 'tickets' | 'help';

const HELP_ARTICLES = [
    { id: 1, title: 'How to upgrade your plan', category: 'Billing', views: 1240 },
    { id: 2, title: 'Understanding prorated charges', category: 'Billing', views: 893 },
    { id: 3, title: 'Resetting two-factor authentication', category: 'Security', views: 742 },
    { id: 4, title: 'API rate limits and timeout handling', category: 'Developers', views: 621 },
    { id: 5, title: 'Exporting your data', category: 'Data', views: 519 },
    { id: 6, title: 'Setting up SSO / SAML', category: 'Security', views: 410 },
];

interface AiMsg { id: number; role: 'user' | 'ai'; text: string; time: string }
const AI_REPLIES = [
    "Thanks for reaching out! I've looked into your account and found the relevant information. The plan change from Standard to Growth on March 1st added prorated charges of $48 for the remaining billing cycle.",
    "I understand your concern. Based on our documentation, you're entitled to a prorated refund if you downgrade within 7 days. Would you like me to initiate that for you?",
    "Great question! Our API timeout limit is configurable up to 120 seconds with the Growth plan. Here's the relevant documentation section — I've linked it below.",
];

export const CustomerView: React.FC = () => {
    const { user, logout } = useUser();
    const [tab, setTab] = useState<CustomerTab>('chat');
    const [messages, setMessages] = useState<AiMsg[]>([
        { id: 1, role: 'ai', text: `Hi ${user?.name?.split(' ')[0]}! 👋 I'm Helix AI, your support assistant. How can I help you today?`, time: 'Just now' },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketBody, setTicketBody] = useState('');
    const [ticketCreated, setTicketCreated] = useState(false);
    const [helpSearch, setHelpSearch] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    const MY_TICKETS = [
        { id: 'TCK-4821', subject: 'Invoice higher than expected', status: 'open', updated: '2m ago', priority: 'high' },
        { id: 'TCK-4785', subject: '2FA reset request', status: 'pending', updated: '30m ago', priority: 'low' },
        { id: 'TCK-4710', subject: 'Export missing rows', status: 'resolved', updated: '2d ago', priority: 'medium' },
    ];

    const sendMessage = async () => {
        const text = input.trim();
        if (!text) return;
        const userMsg: AiMsg = { id: Date.now(), role: 'user', text, time: 'Just now' };
        setMessages((p) => [...p, userMsg]);
        setInput('');
        setIsTyping(true);
        setTimeout(() => {
            const aiMsg: AiMsg = {
                id: Date.now() + 1, role: 'ai',
                text: AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)],
                time: 'Just now',
            };
            setMessages((p) => [...p, aiMsg]);
            setIsTyping(false);
            setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }, 1600);
    };

    const filteredArticles = HELP_ARTICLES.filter(
        (a) => a.title.toLowerCase().includes(helpSearch.toLowerCase()) || a.category.toLowerCase().includes(helpSearch.toLowerCase())
    );

    const tabs: { id: CustomerTab; label: string; icon: string }[] = [
        { id: 'chat', label: 'AI Chat', icon: '🤖' },
        { id: 'tickets', label: 'My Tickets', icon: '🎟️' },
        { id: 'help', label: 'Help Center', icon: '📚' },
    ];

    return (
        <div className="flex h-screen w-screen flex-col bg-background bg-grid-pattern font-sans text-slate-100">
            {/* Top bar */}
            <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-border bg-sidebar/90 px-4 backdrop-blur-xl">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/30 animate-glow">
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-white">
                            <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M3 6l7 4 7-4M10 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[13px] font-semibold text-slate-100">Helix</span>
                        <span className="text-[10px] text-violet-400">Customer Portal</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/8 px-2.5 py-1 text-[10px] font-medium text-violet-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                        Customer · {user?.tenantId}
                    </span>
                    <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${user?.avatarColor} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {user?.avatarInitials}
                    </div>
                    <button onClick={logout} className="text-[11px] text-slate-500 hover:text-slate-200 transition">Sign out</button>
                </div>
            </header>

            {/* Main */}
            <div className="flex min-h-0 flex-1">
                {/* Sidebar nav */}
                <aside className="flex w-16 flex-col items-center border-r border-border bg-sidebar/60 py-4 gap-2">
                    {tabs.map((t) => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            title={t.label}
                            className={`flex flex-col items-center gap-1 rounded-xl p-2.5 transition w-12 ${tab === t.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}>
                            <span className="text-lg leading-none">{t.icon}</span>
                            <span className="text-[9px] font-medium">{t.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </aside>

                {/* Content */}
                <main className="flex min-h-0 flex-1 flex-col">
                    {/* ── AI Chat ── */}
                    {tab === 'chat' && (
                        <div className="flex flex-1 flex-col min-h-0">
                            <div className="flex-shrink-0 flex items-center gap-2 border-b border-border px-6 py-3 bg-sidebar/40">
                                <div className="h-7 w-7 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-[10px] font-bold text-white">✦</div>
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-100">Helix AI Assistant</p>
                                    <p className="text-[10px] text-slate-500">Powered by GPT-4o · RAG · Vector DB</p>
                                </div>
                                <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping-slow" />Online
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 px-6 py-5">
                                {messages.map((m) => (
                                    <div key={m.id} className={`flex gap-3 animate-slide-up ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${m.role === 'ai' ? 'bg-gradient-to-br from-indigo-500 to-cyan-400' : `bg-gradient-to-br ${user?.avatarColor}`
                                            }`}>
                                            {m.role === 'ai' ? '✦' : user?.avatarInitials}
                                        </div>
                                        <div className={`max-w-xl rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${m.role === 'ai'
                                            ? 'bg-slate-900/80 border border-indigo-500/30 text-slate-100 rounded-tl-sm'
                                            : 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm'
                                            }`}>
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-[10px] text-white">✦</div>
                                        <div className="flex items-center gap-1 rounded-2xl border border-indigo-500/20 bg-slate-900/80 px-4 py-3">
                                            {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-indigo-400" style={{ animation: `typing 1.4s infinite ease-in-out ${i * 0.2}s` }} />)}
                                        </div>
                                    </div>
                                )}
                                <div ref={endRef} />
                            </div>

                            <div className="flex-shrink-0 border-t border-border bg-sidebar/50 px-6 py-3">
                                <div className="flex gap-2">
                                    <input value={input} onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Ask Helix AI anything about your account…"
                                        className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 transition" />
                                    <button onClick={sendMessage} disabled={!input.trim()}
                                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-[12px] font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-40">
                                        Send ↑
                                    </button>
                                </div>
                                <p className="mt-1.5 text-center text-[10px] text-slate-600">AI responses are based on your account data and our knowledge base</p>
                            </div>
                        </div>
                    )}

                    {/* ── My Tickets ── */}
                    {tab === 'tickets' && (
                        <div className="flex-1 overflow-y-auto px-6 py-5 animate-fade-in">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-100">My Tickets</h2>
                                    <p className="text-[12px] text-slate-500">All support requests from your account</p>
                                </div>
                                {!ticketCreated ? (
                                    <button onClick={() => setTicketCreated(false)}
                                        className="flex items-center gap-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 px-4 py-2 text-[12px] font-medium text-indigo-300 hover:bg-indigo-500/25 transition">
                                        + New ticket
                                    </button>
                                ) : null}
                            </div>

                            {/* New ticket form */}
                            {!ticketCreated ? (
                                <div className="mb-5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4 animate-fade-in">
                                    <p className="mb-3 text-[12px] font-semibold text-indigo-300">Create new ticket</p>
                                    <input value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)}
                                        placeholder="Subject"
                                        className="mb-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 transition" />
                                    <textarea value={ticketBody} onChange={(e) => setTicketBody(e.target.value)}
                                        rows={3} placeholder="Describe your issue…"
                                        className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 transition" />
                                    <div className="mt-2 flex gap-2">
                                        <button onClick={() => setTicketCreated(true)}
                                            className="rounded-lg bg-indigo-500 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-indigo-400 transition">
                                            Submit
                                        </button>
                                        <button onClick={() => setTicketCreated(true)} className="text-[11px] text-slate-500 hover:text-slate-300 transition px-2">Cancel</button>
                                    </div>
                                </div>
                            ) : null}

                            <div className="space-y-2">
                                {MY_TICKETS.map((t) => (
                                    <div key={t.id} className="flex items-center gap-4 rounded-xl border border-border bg-surface/50 px-4 py-3 hover:border-indigo-500/30 transition cursor-pointer">
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[11px] text-slate-500">{t.id}</span>
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${t.status === 'open' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                    : t.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                        : 'bg-slate-700/40 border-slate-600/20 text-slate-400'}`}>{t.status}</span>
                                                <span className={`h-1.5 w-1.5 rounded-full ${t.priority === 'high' ? 'bg-rose-500' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-500'}`} />
                                            </div>
                                            <p className="mt-0.5 text-[13px] font-medium text-slate-200 truncate">{t.subject}</p>
                                        </div>
                                        <span className="text-[11px] text-slate-500 flex-shrink-0">{t.updated}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Help Center ── */}
                    {tab === 'help' && (
                        <div className="flex-1 overflow-y-auto px-6 py-5 animate-fade-in">
                            <div className="mb-6 text-center">
                                <h2 className="text-xl font-bold text-slate-100">Help Center</h2>
                                <p className="mt-1 text-[13px] text-slate-400">Search our knowledge base</p>
                                <div className="mx-auto mt-4 flex max-w-md items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 focus-within:border-indigo-500/60 transition">
                                    <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input value={helpSearch} onChange={(e) => setHelpSearch(e.target.value)}
                                        placeholder="Search articles…"
                                        className="flex-1 bg-transparent text-[13px] text-slate-200 placeholder:text-slate-500 outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {filteredArticles.map((a) => (
                                    <button key={a.id}
                                        className="flex gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3 text-left transition hover:border-indigo-500/40 hover:bg-surfaceHover">
                                        <svg className="h-5 w-5 flex-shrink-0 text-indigo-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-medium text-slate-200 truncate">{a.title}</p>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                <span className="text-[10px] text-indigo-400">{a.category}</span>
                                                <span className="text-[10px] text-slate-600">{a.views.toLocaleString()} views</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                {filteredArticles.length === 0 && (
                                    <div className="col-span-2 flex flex-col items-center gap-2 py-12 text-center">
                                        <span className="text-3xl">🔍</span>
                                        <p className="text-[13px] text-slate-400">No articles match your search.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
