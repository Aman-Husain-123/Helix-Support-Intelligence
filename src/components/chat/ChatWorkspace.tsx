import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble, type Message } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { CONVERSATIONS } from '../layout/Sidebar';

interface ChatWorkspaceProps {
  conversationId: number;
}

const AI_DRAFT = 'Hi Jordan, your latest invoice is higher because your workspace moved from the Standard plan to the Growth plan on March 1st. This added prorated charges for the remaining days in your billing cycle. I\'d be happy to break down the exact charges if that would help!';

const INITIAL_MESSAGES: Record<number, Message[]> = {
  1: [
    {
      id: 1, from: 'customer', name: 'Jordan Matthews', initials: 'JM', time: '10:02 AM',
      text: 'Hi, my last invoice looks higher than usual. Can you check why?',
    },
    {
      id: 2, from: 'agent', name: 'You', initials: 'AR', time: '10:03 AM', status: 'read',
      text: 'Absolutely! Give me a second while I pull up your account.',
    },
    {
      id: 3, from: 'ai', name: 'Helix AI', initials: 'AI', time: '10:03 AM',
      text: 'I found a plan change from Standard → Growth on March 1st (+$48 prorated). I\'ve drafted a reply for you — check the AI Assistant panel.',
    },
    {
      id: 4, from: 'customer', name: 'Jordan Matthews', initials: 'JM', time: '10:05 AM',
      text: 'Oh wait, I did change the plan but didn\'t realize it would be charged immediately. Is there a way to get a refund for the unused days?',
      reactions: [{ emoji: '👀', count: 1 }],
    },
  ],
  2: [
    { id: 1, from: 'customer', name: 'Acme Inc.', initials: 'AI', time: '09:30 AM', text: 'The API integration keeps timing out after 30 seconds. Is there a known issue?' },
    { id: 2, from: 'agent', name: 'You', initials: 'AR', time: '09:32 AM', status: 'delivered', text: 'I\'m checking our status page and backend logs now.' },
  ],
  3: [
    { id: 1, from: 'customer', name: 'Sarah Kim', initials: 'SK', time: '09:10 AM', text: 'Hi, I lost access to my authenticator app. Can you help me reset my 2FA?' },
  ],
  4: [
    { id: 1, from: 'customer', name: 'DevCorp Trial', initials: 'DC', time: '08:45 AM', text: 'We need the enterprise contract finalized ASAP. Our deadline is tomorrow.' },
    { id: 2, from: 'agent', name: 'You', initials: 'AR', time: '08:47 AM', status: 'read', text: 'I\'ll loop in our enterprise team right away.' },
  ],
  5: [
    { id: 1, from: 'customer', name: 'Marcus Okafor', initials: 'MO', time: '07:30 AM', text: 'My export wasn\'t including all rows.' },
    { id: 2, from: 'agent', name: 'You', initials: 'AR', time: '07:35 AM', status: 'read', text: 'That was a pagination bug in our export endpoint — we pushed a fix 20 minutes ago!' },
    { id: 3, from: 'customer', name: 'Marcus Okafor', initials: 'MO', time: '07:40 AM', text: 'Thanks! That solved my issue.', reactions: [{ emoji: '👍', count: 1 }] },
  ],
};

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({ conversationId }) => {
  const [messagesByConv, setMessagesByConv] = useState<Record<number, Message[]>>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [draftUsed, setDraftUsed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const messages = messagesByConv[conversationId] ?? [];
  const conv = CONVERSATIONS.find((c) => c.id === conversationId);

  // Scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, conversationId]);

  // Simulate customer typing response after agent sends
  const simulateCustomerReply = (convId: number) => {
    if (convId !== 1) return;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessagesByConv((prev) => {
        const prevMessages = prev[convId] ?? [];
        const newMsg: Message = {
          id: Date.now(),
          from: 'customer',
          name: 'Jordan Matthews',
          initials: 'JM',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Got it, that makes sense now. Are prorated charges standard across all plan upgrades?',
        };
        return { ...prev, [convId]: [...prevMessages, newMsg] };
      });
    }, 2800);
  };

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id: Date.now(),
      from: 'agent',
      name: 'You',
      initials: 'AR',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      status: 'sent',
    };
    setMessagesByConv((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), newMsg],
    }));
    simulateCustomerReply(conversationId);
  };

  const handleReact = (msgId: number, emoji: string) => {
    setMessagesByConv((prev) => {
      const msgs = prev[conversationId] ?? [];
      return {
        ...prev,
        [conversationId]: msgs.map((m) => {
          if (m.id !== msgId) return m;
          const reactions = m.reactions ?? [];
          const existing = reactions.find((r) => r.emoji === emoji);
          return {
            ...m,
            reactions: existing
              ? reactions.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1 } : r)
              : [...reactions, { emoji, count: 1 }],
          };
        }),
      };
    });
  };

  const statusBadge = conv ? (
    conv.status === 'open'
      ? <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Open</span>
      : conv.status === 'pending'
        ? <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">Pending</span>
        : <span className="rounded-full bg-slate-700/40 border border-slate-600/20 px-2 py-0.5 text-[10px] font-semibold text-slate-400">Resolved</span>
  ) : null;

  const priorityBadge = conv?.priority ? (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${conv.priority === 'high'
        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        : conv.priority === 'medium'
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          : 'bg-slate-700/40 border-slate-600/20 text-slate-400'
      }`}>
      {conv.priority} priority
    </span>
  ) : null;

  if (!conv) return null;

  return (
    <section className="flex min-w-0 flex-1 flex-col border-r border-border bg-background/60">
      {/* ── Conversation header ── */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-border px-4 py-3 bg-sidebar/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br ${conv.color} flex items-center justify-center text-[12px] font-bold text-white shadow-md`}>
            {conv.initials}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[14px] font-semibold text-slate-100 truncate">{conv.name}</h2>
              <span className="text-[12px] text-slate-500 font-mono">{conv.ticketId}</span>
              {statusBadge}
              {priorityBadge}
            </div>
            <p className="text-[11px] text-slate-500 capitalize">{conv.channel} · {messages.length} messages</p>
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
          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-600 hover:text-slate-100">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ticket
          </button>
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

        {messages.map((m) => (
          <MessageBubble key={m.id} {...m} onReact={handleReact} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 animate-slide-up">
            <div className={`h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br ${conv.color} flex items-center justify-center text-[11px] font-bold text-white`}>
              {conv.initials}
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

        <div ref={endRef} />
      </div>

      {/* ── Composer ── */}
      <MessageComposer
        onSend={handleSend}
        aiDraftText={!draftUsed && conversationId === 1 ? AI_DRAFT : undefined}
        onInsertDraft={() => setDraftUsed(true)}
      />
    </section>
  );
};
