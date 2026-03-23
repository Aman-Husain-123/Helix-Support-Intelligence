import React, { useState } from 'react';

interface TicketTabProps {
  conversationId: number;
}

const TICKET_DATA: Record<number, {
  id: string;
  title: string;
  status: 'open' | 'pending' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  customer: string;
  email: string;
  channel: string;
  assignee: string;
  sla: string;
  created: string;
  tags: string[];
}> = {
  1: {
    id: 'TCK-4821', title: 'Invoice higher than expected', status: 'open', priority: 'high',
    customer: 'Jordan Matthews', email: 'jordan@example.com', channel: 'Web chat',
    assignee: 'Alex Rivera', sla: 'Respond in 4 min', created: 'Mar 23, 2026 10:02 AM',
    tags: ['billing', 'plan-change', 'prorated'],
  },
  2: {
    id: 'TCK-4790', title: 'API integration timeout', status: 'pending', priority: 'medium',
    customer: 'Acme Inc.', email: 'dev@acme.com', channel: 'Email',
    assignee: 'Priya Nair', sla: 'Respond in 2h', created: 'Mar 23, 2026 09:30 AM',
    tags: ['api', 'integration', 'timeout'],
  },
  3: {
    id: 'TCK-4785', title: '2FA reset request', status: 'open', priority: 'low',
    customer: 'Sarah Kim', email: 'sarah.k@gmail.com', channel: 'Web chat',
    assignee: 'Sam Cho', sla: 'Respond in 45 min', created: 'Mar 23, 2026 09:10 AM',
    tags: ['security', '2fa', 'account'],
  },
  4: {
    id: 'TCK-4770', title: 'Enterprise contract urgent', status: 'open', priority: 'high',
    customer: 'DevCorp Trial', email: 'cto@devcorp.io', channel: 'Slack',
    assignee: 'Leila Santos', sla: 'Respond in 30 min', created: 'Mar 23, 2026 08:45 AM',
    tags: ['enterprise', 'contract', 'urgent'],
  },
  5: {
    id: 'TCK-4751', title: 'Export missing rows bug', status: 'resolved', priority: 'medium',
    customer: 'Marcus Okafor', email: 'm.okafor@corp.com', channel: 'Email',
    assignee: 'Alex Rivera', sla: 'Resolved ✓', created: 'Mar 23, 2026 07:30 AM',
    tags: ['bug', 'export', 'resolved'],
  },
};

const RELATED_TICKETS = [
  { id: 'TCK-4819', title: 'Billing confusion after upgrade', status: 'open', time: '1h ago', priority: 'medium' },
  { id: 'TCK-4753', title: 'Invoice PDF download broken', status: 'resolved', time: '2d ago', priority: 'low' },
];

const statusBadge = (s: string) => {
  const styles: Record<string, string> = {
    open: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    pending: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    resolved: 'bg-slate-700/40 border-slate-600/20 text-slate-400',
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${styles[s] ?? ''}`}>
      {s}
    </span>
  );
};

const priorityColor: Record<string, string> = {
  high: 'text-rose-400',
  medium: 'text-amber-400',
  low: 'text-slate-400',
};

export const TicketTab: React.FC<TicketTabProps> = ({ conversationId }) => {
  const ticket = TICKET_DATA[conversationId];
  const [expanded, setExpanded] = useState(true);

  if (!ticket) return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="text-3xl">🎟️</span>
      <p className="text-[12px] text-slate-400">No ticket for this conversation yet.</p>
      <button className="mt-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-4 py-2 text-[12px] font-medium text-indigo-300 hover:bg-indigo-500/25 transition">
        Create ticket
      </button>
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
          <p className="text-[13px] font-semibold text-slate-100">{ticket.title}</p>
        </div>

        {expanded && (
          <div className="animate-slide-up">
            <dl className="mt-2 divide-y divide-border/50">
              {[
                { label: 'Customer', value: ticket.customer },
                { label: 'Email', value: ticket.email, mono: true },
                { label: 'Channel', value: ticket.channel },
                { label: 'Assignee', value: ticket.assignee },
                {
                  label: 'Priority',
                  valueEl: (
                    <span className={`font-semibold capitalize ${priorityColor[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  ),
                },
                {
                  label: 'SLA',
                  valueEl: (
                    <span className={ticket.status === 'resolved' ? 'text-emerald-400' : 'text-rose-400 font-semibold'}>
                      {ticket.sla}
                    </span>
                  ),
                },
                { label: 'Created', value: ticket.created },
              ].map(({ label, value, valueEl, mono }) => (
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
              {ticket.tags.map((tag) => (
                <span key={tag} className="rounded-md border border-border bg-slate-900/50 px-2 py-0.5 text-[10px] text-slate-400">
                  #{tag}
                </span>
              ))}
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
          {ticket.status !== 'resolved' ? (
            <button className="flex-1 rounded-lg bg-emerald-500/15 border border-emerald-500/20 py-1.5 text-[11px] font-medium text-emerald-400 transition hover:bg-emerald-500/25">
              Resolve ✓
            </button>
          ) : (
            <button className="flex-1 rounded-lg bg-amber-500/15 border border-amber-500/20 py-1.5 text-[11px] font-medium text-amber-400 transition hover:bg-amber-500/25">
              Re-open
            </button>
          )}
        </div>
      </div>

      {/* Customer summary */}
      <div className="rounded-xl border border-border bg-surface/50 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Customer</p>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white">
            {ticket.customer.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-[12px] font-medium text-slate-100">{ticket.customer}</p>
            <p className="text-[10px] font-mono text-slate-500">{ticket.email}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Tickets', val: '7' },
            { label: 'CSAT', val: '4.8' },
            { label: 'Since', val: '2023' },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-lg border border-border bg-background/50 py-1.5">
              <p className="text-[13px] font-bold text-slate-100">{val}</p>
              <p className="text-[10px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related tickets */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Related Tickets</p>
        <div className="space-y-1.5">
          {RELATED_TICKETS.map((t) => (
            <button
              key={t.id}
              className="flex w-full flex-col rounded-lg border border-border bg-surface/50 px-2.5 py-2 text-left transition hover:border-indigo-500/40 hover:bg-surfaceHover"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-slate-400">{t.id}</span>
                {statusBadge(t.status)}
              </div>
              <p className="mt-0.5 text-[11px] text-slate-300 truncate">{t.title}</p>
              <span className="mt-0.5 text-[10px] text-slate-500">{t.time}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
