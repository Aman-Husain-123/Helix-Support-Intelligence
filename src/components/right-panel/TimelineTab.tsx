import React from 'react';
import { useTickets } from '../../context/TicketContext';

interface TimelineTabProps {
    conversationId: string;
}

const eventIcon = (type: string) => {
    switch (type) {
        case 'agent':
        case 'customer':
        case 'message':
            return { icon: '💬', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400' };
        case 'ai':
            return { icon: '✦', bg: 'bg-cyan-500/15', border: 'border-cyan-500/25', text: 'text-cyan-400' };
        case 'system':
        default:
            return { icon: '⚙️', bg: 'bg-slate-700/40', border: 'border-slate-600/20', text: 'text-slate-400' };
    }
};

export const TimelineTab: React.FC<TimelineTabProps> = ({ conversationId }) => {
    const { tickets } = useTickets();
    const ticket = tickets.find(t => t.id === conversationId);

    if (!ticket) {
        return (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-[12px] text-slate-400">No ticket selected.</p>
            </div>
        );
    }

    const events = ticket.messages.map(m => ({
        id: m.id,
        type: m.role,
        title: m.role === 'customer' ? 'Customer replied'
            : m.role === 'agent' ? 'Agent replied'
                : m.role === 'ai' ? 'AI action' : 'System event',
        desc: m.text,
        time: m.time,
        actor: m.role === 'customer' || m.role === 'agent' ? m.senderName : undefined
    }));

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
                                {icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-[12px] font-medium text-slate-200">{event.title}</p>
                                    <span className="flex-shrink-0 text-[10px] text-slate-500 font-mono">{event.time}</span>
                                </div>
                                {event.desc && (
                                    <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed truncate">{event.desc}</p>
                                )}
                                {event.actor && (
                                    <span className={`text-[9px] font-bold ${text}`}>by {event.actor}</span>
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
