import React from 'react';

interface TimelineTabProps {
    conversationId: number;
}

interface TimelineEvent {
    id: number;
    type: 'message' | 'status' | 'ai' | 'ticket' | 'system';
    title: string;
    desc?: string;
    time: string;
    actor?: string;
}

const EVENTS_BY_CONV: Record<number, TimelineEvent[]> = {
    1: [
        { id: 1, type: 'system', title: 'Conversation started', desc: 'Via web chat widget', time: '10:02 AM' },
        { id: 2, type: 'ticket', title: 'Ticket TCK-4821 created', desc: 'Auto-classified: billing › plan-change', time: '10:02 AM' },
        { id: 3, type: 'ai', title: 'Helix AI analyzed conversation', desc: 'Context: plan upgrade Mar 1 · confidence 94%', time: '10:03 AM' },
        { id: 4, type: 'message', title: 'Agent replied', desc: 'Alex Rivera joined the conversation', time: '10:03 AM', actor: 'AR' },
        { id: 5, type: 'ai', title: 'Draft reply generated', desc: 'RAG sources: billing/plan-changes.md, billing/sla.md', time: '10:03 AM' },
        { id: 6, type: 'message', title: 'Customer replied', desc: 'Asking about refund for unused days', time: '10:05 AM' },
        { id: 7, type: 'status', title: 'SLA warning triggered', desc: 'First response SLA: 4 min remaining', time: '10:07 AM' },
    ],
    2: [
        { id: 1, type: 'system', title: 'Email received', time: '09:30 AM' },
        { id: 2, type: 'ticket', title: 'Ticket TCK-4790 created', desc: 'Category: API · L2 escalation pending', time: '09:30 AM' },
        { id: 3, type: 'ai', title: 'AI flagged as technical issue', desc: 'Routed to Priya Nair (L2 Engineer)', time: '09:31 AM' },
        { id: 4, type: 'message', title: 'Agent acknowledged', time: '09:32 AM', actor: 'PN' },
    ],
    3: [
        { id: 1, type: 'system', title: 'Conversation started', desc: 'Web chat', time: '09:10 AM' },
        { id: 2, type: 'ticket', title: 'Ticket TCK-4785 created', time: '09:10 AM' },
        { id: 3, type: 'ai', title: 'AI flagged: identity verification required', desc: '2FA reset security flow initiated', time: '09:11 AM' },
    ],
    4: [
        { id: 1, type: 'system', title: 'Slack message received', time: '08:45 AM' },
        { id: 2, type: 'ticket', title: 'Ticket TCK-4770 created', desc: 'Priority: HIGH · SLA: 30 min', time: '08:45 AM' },
        { id: 3, type: 'status', title: 'Escalated to Enterprise Team', actor: 'LS', time: '08:47 AM' },
        { id: 4, type: 'message', title: 'Agent replied', time: '08:47 AM', actor: 'LS' },
    ],
    5: [
        { id: 1, type: 'system', title: 'Email received', time: '07:30 AM' },
        { id: 2, type: 'ticket', title: 'Ticket TCK-4751 created', time: '07:30 AM' },
        { id: 3, type: 'ai', title: 'AI identified: known export bug', desc: 'Linked to engineering issue #ENG-2291', time: '07:31 AM' },
        { id: 4, type: 'message', title: 'Alex replied with fix info', time: '07:35 AM', actor: 'AR' },
        { id: 5, type: 'status', title: 'Ticket resolved', desc: 'CSAT survey sent', time: '07:42 AM' },
    ],
};

const eventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
        case 'message':
            return { icon: '💬', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400' };
        case 'ai':
            return { icon: '✦', bg: 'bg-cyan-500/15', border: 'border-cyan-500/25', text: 'text-cyan-400' };
        case 'ticket':
            return { icon: '🎟️', bg: 'bg-violet-500/15', border: 'border-violet-500/25', text: 'text-violet-400' };
        case 'status':
            return { icon: '⚡', bg: 'bg-amber-500/15', border: 'border-amber-500/25', text: 'text-amber-400' };
        case 'system':
        default:
            return { icon: '⚙️', bg: 'bg-slate-700/40', border: 'border-slate-600/20', text: 'text-slate-400' };
    }
};

export const TimelineTab: React.FC<TimelineTabProps> = ({ conversationId }) => {
    const events = EVENTS_BY_CONV[conversationId] ?? [];

    return (
        <div className="animate-fade-in">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Activity Timeline · {events.length} events
            </p>
            <div className="relative space-y-0">
                {/* Vertical line */}
                <div className="absolute left-[13px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/30 via-border to-transparent" />

                {events.map((event, idx) => {
                    const { icon, bg, border, text } = eventIcon(event.type);
                    const isLast = idx === events.length - 1;
                    return (
                        <div key={event.id} className={`relative flex gap-3 ${!isLast ? 'pb-4' : ''}`}>
                            {/* Icon node */}
                            <div className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border ${bg} ${border} text-[12px]`}>
                                {event.actor ? (
                                    <span className={`text-[9px] font-bold ${text}`}>{event.actor}</span>
                                ) : (
                                    <span>{icon}</span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-[12px] font-medium text-slate-200">{event.title}</p>
                                    <span className="flex-shrink-0 text-[10px] text-slate-500 font-mono">{event.time}</span>
                                </div>
                                {event.desc && (
                                    <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">{event.desc}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer note */}
            <div className="mt-4 rounded-lg border border-border bg-surface/50 px-3 py-2 text-center">
                <p className="text-[11px] text-slate-500">All events are logged and auditable</p>
            </div>
        </div>
    );
};
