import React, { useState } from 'react';

interface ShellLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  rightPanel: React.ReactNode;
}

const navItems = ['Workspace', 'Queues', 'Analytics', 'Knowledge Base', 'Reports'];

export const ShellLayout: React.FC<ShellLayoutProps> = ({ sidebar, main, rightPanel }) => {
  const [activeNav, setActiveNav] = useState('Workspace');
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex h-screen min-h-0 flex-col bg-background text-slate-100 font-sans overflow-hidden">
      {/* ── Top Bar ── */}
      <header className="relative z-20 flex h-12 flex-shrink-0 items-center justify-between border-b border-border bg-sidebar/90 px-4 backdrop-blur-xl">
        {/* Logo + Nav */}
        <div className="flex items-center gap-6">
          {/* Logo mark */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/30 animate-glow">
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M3 6l7 4 7-4M10 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-semibold tracking-tight text-slate-100">Helix</span>
              <span className="text-[10px] font-medium text-indigo-400 tracking-wide">Support Intelligence</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden gap-0.5 md:flex">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`relative px-3 py-1.5 text-[12px] font-medium rounded-md transition-all duration-150 ${activeNav === item
                    ? 'text-slate-100 bg-indigo-500/15 after:absolute after:inset-x-0 after:bottom-0'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
              >
                {item}
                {activeNav === item && (
                  <span className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded-t-full bg-gradient-to-r from-indigo-400 to-cyan-400" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Status pill */}
          <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            All systems operational
          </span>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-1 ring-background" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-10 z-50 w-72 animate-slide-up rounded-xl border border-border bg-surface shadow-2xl shadow-black/40">
                <div className="border-b border-border px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-slate-200">Notifications</span>
                  <button className="text-[11px] text-indigo-400 hover:text-indigo-300">Mark all read</button>
                </div>
                {[
                  { icon: '🔴', title: 'SLA breach risk', desc: 'Ticket #4821 — respond in 4 min', time: '1m ago' },
                  { icon: '🤖', title: 'AI suggestion ready', desc: 'Draft reply generated for Jordan M.', time: '3m ago' },
                  { icon: '📨', title: 'New escalation', desc: 'Ticket #4799 escalated to L2', time: '8m ago' },
                ].map((n, i) => (
                  <div key={i} className="flex gap-2.5 px-3 py-2.5 hover:bg-surfaceHover transition cursor-pointer">
                    <span className="text-base">{n.icon}</span>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-medium text-slate-200 truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-500 flex-shrink-0">{n.time}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate">{n.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <button className="flex h-8 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-[12px] text-slate-400 transition hover:border-indigo-500/40 hover:text-slate-200">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:block">Search</span>
            <kbd className="hidden sm:flex h-4 items-center rounded border border-slate-700 bg-slate-900 px-1 text-[9px] text-slate-500 font-mono">⌘K</kbd>
          </button>

          {/* Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-[11px] font-bold text-white cursor-pointer ring-2 ring-indigo-500/20 hover:ring-indigo-500/50 transition">
            AR
          </div>
        </div>
      </header>

      {/* ── Main workspace ── */}
      <main className="flex min-h-0 flex-1 bg-background bg-grid-pattern">
        {sidebar}
        {main}
        {rightPanel}
      </main>
    </div>
  );
};
