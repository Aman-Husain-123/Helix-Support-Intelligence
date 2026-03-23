import React, { useState } from 'react';
import { TicketTab } from './TicketTab';
import { AssistantTab } from './AssistantTab';
import { TimelineTab } from './TimelineTab';

interface RightPanelProps {
  conversationId: string;
}

const TABS = [
  {
    id: 'assistant',
    label: 'AI Assistant',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    id: 'ticket',
    label: 'Ticket',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

export const RightPanel: React.FC<RightPanelProps> = ({ conversationId }) => {
  const [activeTab, setActiveTab] = useState<TabId>('assistant');

  return (
    <aside className="hidden w-[22rem] flex-col border-l border-border bg-sidebar/90 backdrop-blur-xl md:flex flex-shrink-0">
      {/* ── Tab bar ── */}
      <header className="flex-shrink-0 border-b border-border">
        <nav className="flex gap-0.5 px-2 pt-2">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-t-lg px-2 py-2 text-[11px] font-medium transition ${isActive
                  ? 'bg-surface text-slate-100 border border-border border-b-surface -mb-px z-10'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                  }`}
              >
                <span className={isActive ? (tab.id === 'assistant' ? 'text-indigo-300' : 'text-slate-300') : ''}>
                  {tab.icon}
                </span>
                {tab.label}
                {isActive && tab.id === 'assistant' && (
                  <span className="absolute -top-px inset-x-4 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {activeTab === 'assistant' && <AssistantTab conversationId={conversationId} />}
        {activeTab === 'ticket' && <TicketTab conversationId={conversationId} />}
        {activeTab === 'timeline' && <TimelineTab conversationId={conversationId} />}
      </div>
    </aside>
  );
};
