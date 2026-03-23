import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';

interface TicketTabProps {
  conversationId: string;
}

const statusBadge = (s: string) => {
  const styles: Record<string, string> = {
    open: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    pending: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    resolved: 'bg-slate-700/40 border-slate-600/20 text-slate-400',
    closed: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${styles[s] ?? ''}`}>
      {s}
    </span>
  );
};

const priorityColor: Record<string, string> = {
  urgent: 'text-rose-600 animate-pulse',
  high: 'text-rose-400',
  medium: 'text-amber-400',
  low: 'text-slate-400',
};

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

export const TicketTab: React.FC<TicketTabProps> = ({ conversationId }) => {
  const { tickets, updateTicketStatus } = useTickets();
  const ticket = tickets.find(t => t.id === conversationId);
  const [expanded, setExpanded] = useState(true);

  if (!ticket) return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="text-3xl">🎟️</span>
      <p className="text-[12px] text-slate-400">No ticket for this conversation yet.</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main ticket card */}
      <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
        {/* Card header */}
        <div
          className="flex cursor-pointer items-center justify-between px-3 py-2.5 hover:bg-surfaceHover transition"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-400">{ticket.id}</span>
            {statusBadge(ticket.status)}
          </div>
          <svg
            className={`h-3.5 w-3.5 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="px-3 pb-0.5">
          <p className="text-[13px] font-semibold text-slate-100">{ticket.subject}</p>
        </div>

        {expanded && (
          <div className="animate-slide-up">
            <dl className="mt-2 divide-y divide-border/50">
              {[
                { label: 'Customer', value: ticket.customerName },
                { label: 'Channel', value: ticket.channel },
                { label: 'Assignee', value: ticket.assignedTo || 'Unassigned' },
                {
                  label: 'Priority',
                  valueEl: (
                    <span className={`font-semibold capitalize ${priorityColor[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  ),
                },
                {
                  label: 'SLA Limit',
                  valueEl: (
                    <span className={ticket.status === 'resolved' || ticket.status === 'closed' ? 'text-emerald-400' : 'text-rose-400 font-semibold'}>
                      {ticket.sla_due_at ? new Date(ticket.sla_due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                    </span>
                  ),
                },
                { label: 'Updated', value: ticket.updatedAt },
              ].map(({ label, value, valueEl, mono }: any) => (
                <div key={label} className="flex items-center justify-between px-3 py-1.5">
                  <dt className="text-[11px] text-slate-500">{label}</dt>
                  <dd className={`text-[11px] text-slate-200 text-right truncate max-w-[60%] ${mono ? 'font-mono text-[10px]' : ''}`}>
                    {valueEl ?? value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 px-3 py-2.5">
              <span className="rounded-md border border-border bg-slate-900/50 px-2 py-0.5 text-[10px] text-slate-400">#{ticket.status}</span>
              <button className="rounded-md border border-dashed border-slate-700 px-2 py-0.5 text-[10px] text-slate-500 hover:border-slate-500 hover:text-slate-300 transition">
                + Add tag
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 border-t border-border px-3 py-2.5">
          <button className="flex-1 rounded-lg border border-border bg-surface py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100">
            Reassign
          </button>
          {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
            <button onClick={() => updateTicketStatus(ticket.id, 'resolved')} className="flex-1 rounded-lg bg-emerald-500/15 border border-emerald-500/20 py-1.5 text-[11px] font-medium text-emerald-400 transition hover:bg-emerald-500/25">
              Resolve ✓
            </button>
          ) : (
            <button onClick={() => updateTicketStatus(ticket.id, 'open')} className="flex-1 rounded-lg bg-amber-500/15 border border-amber-500/20 py-1.5 text-[11px] font-medium text-amber-400 transition hover:bg-amber-500/25">
              Re-open
            </button>
          )}
        </div>
      </div>

      {/* Customer summary */}
      <div className="rounded-xl border border-border bg-surface/50 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Customer Details</p>
        <div className="flex items-center gap-2.5">
          <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarColor(ticket.customerName)} flex items-center justify-center text-[11px] font-bold text-white`}>
            {getInitials(ticket.customerName)}
          </div>
          <div>
            <p className="text-[12px] font-medium text-slate-100">{ticket.customerName}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Tickets', val: tickets.filter(t => t.customerName === ticket.customerName).length.toString() },
            { label: 'CSAT', val: '4.8' },
            { label: 'Since', val: '2025' },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-lg border border-border bg-background/50 py-1.5">
              <p className="text-[13px] font-bold text-slate-100">{val}</p>
              <p className="text-[10px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
