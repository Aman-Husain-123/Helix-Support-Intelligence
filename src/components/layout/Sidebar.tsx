import React, { useState } from 'react';
import { useTickets, type TicketPriority } from '../../context/TicketContext';
import { useUser } from '../../context/AuthContext';

const channelIcon = (ch: string) => {
  switch (ch) {
    case 'web': return (
      <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    );
    case 'email': return (
      <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
    case 'phone': return (
      <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    );
    case 'slack': return (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    );
  }
};

const priorityDot = (p?: TicketPriority) => {
  if (!p) return null;
  const cls = { urgent: 'bg-rose-600 animate-pulse', high: 'bg-rose-500', medium: 'bg-amber-400', low: 'bg-slate-500' }[p];
  return <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cls}`} />;
};

interface SidebarProps {
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
}

const teamMembers = [
  { name: 'Alex Rivera', role: 'Support Lead', status: 'online', color: 'from-indigo-500 to-sky-400', initials: 'AR' },
  { name: 'Priya Nair', role: 'L2 Engineer', status: 'online', color: 'from-violet-500 to-pink-500', initials: 'PN' },
  { name: 'Sam Cho', role: 'Billing Agent', status: 'busy', color: 'from-amber-400 to-orange-500', initials: 'SC' },
  { name: 'Leila Santos', role: 'CSM', status: 'away', color: 'from-emerald-500 to-teal-500', initials: 'LS' },
];

const statusColor = (s: string) => {
  if (s === 'online') return 'bg-emerald-500';
  if (s === 'busy') return 'bg-rose-500';
  return 'bg-amber-400';
};

const channels = ['# general', '# billing', '# technical', '# escalations', '# product-feedback'];

// Helper to generate a consistent color per customer string
const getAvatarColor = (name: string) => {
  const AVATAR_COLORS = [
    'from-indigo-500 to-violet-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-400 to-orange-500',
    'from-sky-500 to-blue-600',
  ];
  return AVATAR_COLORS[name.length % AVATAR_COLORS.length];
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
};

export const Sidebar: React.FC<SidebarProps> = ({ activeConversationId, setActiveConversationId }) => {
  const { tickets } = useTickets();
  const { user } = useUser();
  const [activeInbox, setActiveInbox] = useState('All tickets');
  const [search, setSearch] = useState('');
  const [section, setSection] = useState<'inbox' | 'team' | 'channels'>('inbox');

  const inboxItems = ['All tickets', 'Assigned to me', 'Unassigned', 'Priority'] as const;

  const inboxCounts = {
    'All tickets': tickets.length,
    'Assigned to me': tickets.filter(t => t.assignedTo === user?.name).length,
    'Unassigned': tickets.filter(t => !t.assignedTo).length,
    'Priority': tickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length,
  };

  // 1. Filter tickets based on active tab
  let visibleTickets = tickets;
  if (activeInbox === 'Assigned to me') visibleTickets = tickets.filter(t => t.assignedTo === user?.name);
  if (activeInbox === 'Unassigned') visibleTickets = tickets.filter(t => !t.assignedTo);
  if (activeInbox === 'Priority') visibleTickets = tickets.filter(t => t.priority === 'urgent' || t.priority === 'high');

  // 2. Filter by Search
  const filtered = visibleTickets.filter(
    (c) =>
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="hidden w-72 flex-col border-r border-border bg-sidebar/90 backdrop-blur-xl md:flex flex-shrink-0">
      {/* ── Search ── */}
      <div className="px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 focus-within:border-indigo-500/60 transition">
          <svg className="h-3.5 w-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets…"
            className="flex-1 bg-transparent text-[12px] text-slate-200 placeholder:text-slate-500 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-500 hover:text-slate-300">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Section toggles ── */}
      <div className="flex border-b border-border px-2 pt-2 gap-1">
        {(['inbox', 'team', 'channels'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`flex-1 py-1.5 rounded-t text-[11px] font-medium capitalize transition ${section === s ? 'bg-surface text-slate-100 border-t border-x border-border' : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {/* ── Inbox section ── */}
        {section === 'inbox' && (
          <>
            <div className="mb-2">
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Inbox</p>
              <ul className="space-y-0.5">
                {inboxItems.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => setActiveInbox(item)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${activeInbox === item
                        ? 'bg-indigo-500/15 text-slate-100 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }`}
                    >
                      <span className="text-[12px]">{item}</span>
                      {inboxCounts[item] !== undefined && (
                        <span className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${activeInbox === item ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-300'
                          }`}>
                          {inboxCounts[item]}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Conversation list */}
            <div>
              <div className="mb-1 flex items-center justify-between px-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Tickets</p>
              </div>
              <ul className="space-y-0.5">
                {filtered.map((ticket) => (
                  <li key={ticket.id}>
                    <button
                      onClick={() => setActiveConversationId(ticket.id)}
                      className={`group flex w-full gap-2.5 rounded-xl px-2 py-2 text-left transition animate-fade-in ${ticket.id === activeConversationId
                        ? 'bg-indigo-500/15 ring-1 ring-indigo-500/30'
                        : 'hover:bg-slate-800/50'
                        }`}
                    >
                      {/* Avatar */}
                      <div className={`relative mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(ticket.customerName)} text-[11px] font-bold text-white shadow-sm`}>
                        {getInitials(ticket.customerName)}
                        {ticket.status === 'resolved' && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-1 ring-sidebar text-white">
                            <svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                        {ticket.status === 'closed' && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-500 ring-1 ring-sidebar text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {priorityDot(ticket.priority)}
                          <span className="truncate text-[12px] font-medium text-slate-200 group-hover:text-slate-100">{ticket.customerName}</span>
                          <span className="ml-auto flex-shrink-0 text-[10px] text-slate-500">{ticket.updatedAt}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`flex items-center gap-0.5 rounded text-[10px] px-1 py-0.5 ${ticket.channel === 'web' ? 'text-sky-400' :
                            ticket.channel === 'email' ? 'text-violet-400' :
                              ticket.channel === 'slack' ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                            {channelIcon(ticket.channel)}
                          </span>
                          <span className="truncate text-[11px] text-slate-500">{ticket.subject}</span>
                          {ticket.unread > 0 && (
                            <span className="ml-auto flex-shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                              {ticket.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
                {filtered.length === 0 && (
                  <li className="flex flex-col items-center gap-2 py-8 text-center">
                    <span className="text-2xl">🔍</span>
                    <span className="text-[12px] text-slate-500">No tickets match</span>
                  </li>
                )}
              </ul>
            </div>
          </>
        )}

        {/* ── Team Section ── */}
        {section === 'team' && (
          <div>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Team presence</p>
            <ul className="space-y-1">
              {teamMembers.map((m) => (
                <li key={m.name}>
                  <div className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-slate-800/50 transition cursor-default">
                    <div className="relative">
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-[11px] font-bold text-white`}>
                        {m.initials}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-1 ring-sidebar ${statusColor(m.status)}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-slate-200 truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-500">{m.role}</p>
                    </div>
                    <span className={`text-[10px] capitalize ${m.status === 'online' ? 'text-emerald-400' : m.status === 'busy' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {m.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Channels Section ── */}
        {section === 'channels' && (
          <div>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Channels</p>
            <ul className="space-y-0.5">
              {channels.map((ch) => (
                <li key={ch}>
                  <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-200">
                    <span className="text-slate-500">#</span>
                    <span>{ch.replace('# ', '')}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* ── Agent profile ── */}
      <div className="border-t border-border px-3 py-3">
        <button className="flex w-full items-center gap-2.5 rounded-xl bg-surface/60 px-3 py-2 text-left transition hover:bg-surface">
          <div className="relative">
            <div className={`h-8 w-8 rounded-full bg-gradient-to-tr ${user?.avatarColor || 'from-indigo-500 to-cyan-400'} flex items-center justify-center text-[11px] font-bold text-white`}>
              {user?.avatarInitials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-1 ring-sidebar" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-slate-200">{user?.name || 'Agent'}</p>
            <p className="text-[10px] text-slate-500">{user?.role} · available</p>
          </div>
          <svg className="h-3.5 w-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </aside>
  );
};
