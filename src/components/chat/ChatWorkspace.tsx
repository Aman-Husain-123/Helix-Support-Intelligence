import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble, type Message } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { useTickets } from '../../context/TicketContext';

interface ChatWorkspaceProps {
  conversationId: string;
}

const AI_DRAFT = 'Hi Jordan, your latest invoice is higher because your workspace moved from the Standard plan to the Growth plan on March 1st. This added prorated charges for the remaining days in your billing cycle. I\'d be happy to break down the exact charges if that would help!';

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
  return name.split(' ').map((n) => n.charAt(0)).join('').toUpperCase().substring(0, 2);
};

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({ conversationId }) => {
  const { tickets, addMessageToTicket, updateTicketStatus } = useTickets();
  const [isTyping] = useState(false);
  const [draftUsed, setDraftUsed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const ticket = tickets.find(t => t.id === conversationId);

  // Scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages.length, conversationId]);

  if (!ticket) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-slate-500 border-r border-border">
        Select a ticket to view the conversation.
      </div>
    );
  }

  // Map TicketMessage to Message format for MessageBubble
  const displayMessages: Message[] = ticket.messages.map(m => ({
    id: parseInt(m.id, 10) || Date.now(),
    from: m.role === 'customer' ? 'customer' : m.role === 'agent' ? 'agent' : m.role === 'system' ? 'system' : 'ai',
    name: m.senderName,
    initials: getInitials(m.senderName),
    time: m.time,
    text: m.text,
    status: 'read'
  }));

  const handleSend = (text: string) => {
    addMessageToTicket(conversationId, {
      role: 'agent',
      senderName: 'You',
      text
    });
    // Optionally simulate a transition if status is open
    if (ticket.status === 'open') {
      updateTicketStatus(conversationId, 'pending');
    }
  };

  const handleReact = (_msgId: number, _emoji: string) => {
    // Stub implementation for now without breaking existing props
  };

  const statusBadge = (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${ticket.status === 'open'
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      : ticket.status === 'pending'
        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        : ticket.status === 'resolved'
          ? 'bg-slate-700/40 border-slate-600/20 text-slate-400'
          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
      }`}>
      {ticket.status}
    </span>
  );

  const priorityBadge = (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${ticket.priority === 'urgent'
      ? 'bg-rose-600/10 border-rose-600/20 text-rose-500 animate-pulse'
      : ticket.priority === 'high'
        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        : ticket.priority === 'medium'
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          : 'bg-slate-700/40 border-slate-600/20 text-slate-400'
      }`}>
      {ticket.priority} priority
    </span>
  );

  return (
    <section className="flex min-w-0 flex-1 flex-col border-r border-border bg-background/60">
      {/* ── Conversation header ── */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-border px-4 py-3 bg-sidebar/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(ticket.customerName)} flex items-center justify-center text-[12px] font-bold text-white shadow-md`}>
            {getInitials(ticket.customerName)}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[14px] font-semibold text-slate-100 truncate">{ticket.customerName}</h2>
              <span className="text-[12px] text-slate-500 font-mono">{ticket.id}</span>
              {statusBadge}
              {priorityBadge}
            </div>
            <p className="text-[11px] text-slate-500 capitalize">{ticket.channel} · {ticket.messages.length} messages</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-600 hover:text-slate-100">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Attach
          </button>
          <button className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-600 hover:text-slate-100">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Transfer
          </button>
          {ticket.status !== 'closed' && (
            <button onClick={() => updateTicketStatus(ticket.id, 'closed')} className="flex items-center gap-1.5 rounded-lg border border-border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 px-2.5 py-1.5 text-[11px] font-medium transition hover:border-emerald-500/40">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Close Ticket
            </button>
          )}
          <button className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-indigo-500">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.361a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            Join call
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        {/* Date divider */}
        <div className="relative flex items-center py-1">
          <div className="flex-1 border-t border-border" />
          <span className="mx-3 text-[11px] text-slate-500 bg-background px-1">Today</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {displayMessages.map((m) => (
          <MessageBubble key={m.id} {...m} onReact={handleReact} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 animate-slide-up">
            <div className={`h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(ticket.customerName)} flex items-center justify-center text-[11px] font-bold text-white`}>
              {getInitials(ticket.customerName)}
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-border bg-slate-800/80 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-slate-400"
                  style={{ animation: `typing 1.4s infinite ease-in-out ${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {ticket.status === 'closed' && (
          <div className="py-4 text-center border-t border-border/50">
            <span className="text-[12px] font-semibold text-slate-400">This ticket is closed</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* ── Composer ── */}
      {ticket.status !== 'closed' && (
        <MessageComposer
          onSend={handleSend}
          aiDraftText={!draftUsed && conversationId === 'TCK-4821' ? AI_DRAFT : undefined}
          onInsertDraft={() => setDraftUsed(true)}
        />
      )}
    </section>
  );
};
