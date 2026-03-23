import React, { useRef, useState, useLayoutEffect } from 'react';

interface AiMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

interface AssistantTabProps {
  conversationId: number;
}

const DRAFT_REPLY_BY_CONV: Record<number, string> = {
  1: "Hi Jordan, your latest invoice is higher because your workspace was upgraded from the Standard plan to the Growth plan on March 1st, which added prorated charges for the remaining billing period. I'd be happy to send you a detailed cost breakdown!",
  2: "Hi, I'm investigating the API timeout issue. Could you confirm which endpoint is failing and share the exact error message or HTTP status code you're seeing?",
  3: "Hi Sarah, I can help you reset your 2FA. For security, I'll need to verify your identity first. Could you confirm the email address on your account and the last 4 digits of the phone number you registered?",
  4: "Hi, I've flagged your enterprise request as urgent and looped in our contracts team. You should hear from them within the next 30 minutes.",
  5: "That's great to hear! The engineering team pushed a fix for the export pagination bug at 07:20 AM today. Let us know if you run into anything else!",
};

const QUICK_PROMPTS = [
  'Summarize this conversation',
  'Draft a refund policy explanation',
  'Translate reply to Spanish',
  'Suggest a retention offer',
  'Search knowledge base',
  'Generate CRM note',
];

const CITATIONS_BY_CONV: Record<number, { title: string; path: string }[]> = {
  1: [
    { title: 'Pricing · Plan changes & proration', path: 'Docs / billing/plan-changes.md' },
    { title: 'SLA for billing tickets', path: 'Runbooks / billing/sla.md' },
    { title: 'Refund policy', path: 'Docs / billing/refunds.md' },
  ],
  2: [
    { title: 'API rate limits & timeouts', path: 'Docs / api/limits.md' },
    { title: 'Integration troubleshooting guide', path: 'Runbooks / api/troubleshoot.md' },
  ],
  3: [
    { title: '2FA reset process', path: 'Runbooks / security/2fa-reset.md' },
    { title: 'Account verification steps', path: 'Docs / accounts/verification.md' },
  ],
  4: [
    { title: 'Enterprise contract process', path: 'Docs / sales/enterprise.md' },
    { title: 'SLA for enterprise tickets', path: 'Runbooks / enterprise/sla.md' },
  ],
  5: [
    { title: 'Export feature documentation', path: 'Docs / features/export.md' },
  ],
};

const AI_RESPONSES: string[] = [
  'Based on the conversation context and our knowledge base, here\'s what I found: the plan upgrade from Standard to Growth triggers immediate prorated billing for the current billing cycle. This is documented in our pricing FAQ.',
  'I\'ve analyzed the ticket history for this customer. They\'ve been with us since 2023 and have a CSAT score of 4.8 — low churn risk. Recommended approach: explain prorated billing clearly and offer a one-time billing credit as a goodwill gesture.',
  'Here\'s a summary: Customer is confused about $48 charge after upgrading their plan. The charge is valid per our pricing policy. Consider offering to waive the prorated fee given their high CSAT and loyalty.',
];

export const AssistantTab: React.FC<AssistantTabProps> = ({ conversationId }) => {
  const [chatMessages, setChatMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const draft = DRAFT_REPLY_BY_CONV[conversationId] ?? '';
  const citations = CITATIONS_BY_CONV[conversationId] ?? [];

  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [input]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAsk = () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    const userMsg: AiMessage = {
      id: Date.now(),
      role: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    setTimeout(() => {
      const aiMsg: AiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
      setTimeout(scrollToBottom, 50);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Draft reply */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 to-slate-950/80 overflow-hidden shadow-lg shadow-indigo-500/5">
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-indigo-500/20">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/20">
              <svg className="h-3 w-3 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-widest">AI Draft Reply</span>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded font-mono">GPT-4o · RAG</span>
        </div>

        <p className="px-3 py-2.5 text-[13px] leading-relaxed text-slate-100">{draft}</p>

        <div className="flex gap-2 border-t border-indigo-500/15 px-3 py-2">
          <button className="flex-1 rounded-lg bg-indigo-500 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-indigo-500/30 transition hover:bg-indigo-400">
            Insert into reply
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-500"
          >
            {copied ? (
              <><svg className="h-3 w-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-emerald-400">Copied!</span></>
            ) : (
              <><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>Copy</>
            )}
          </button>
          <button className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-500">
            ↺
          </button>
        </div>
      </div>

      {/* Quick prompts */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Quick Prompts</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-indigo-200"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Citations */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Knowledge Sources</p>
        <div className="space-y-1.5">
          {citations.map((c) => (
            <button
              key={c.path}
              className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface/50 px-2.5 py-2 text-left transition hover:border-indigo-500/40 hover:bg-surfaceHover"
            >
              <svg className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-200 truncate">{c.title}</p>
                <p className="text-[10px] font-mono text-slate-500 truncate">{c.path}</p>
              </div>
              <svg className="ml-auto h-3 w-3 flex-shrink-0 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Chat history with AI */}
      {chatMessages.length > 0 && (
        <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
          <div className="max-h-48 overflow-y-auto space-y-2 px-3 py-2.5">
            {chatMessages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${m.role === 'assistant'
                    ? 'bg-gradient-to-br from-indigo-500 to-cyan-400 text-white'
                    : 'bg-slate-700 text-slate-200'
                  }`}>
                  {m.role === 'assistant' ? '✦' : 'A'}
                </div>
                <div className={`max-w-[80%] rounded-xl px-2.5 py-1.5 text-[12px] leading-relaxed ${m.role === 'assistant'
                    ? 'bg-indigo-950/50 border border-indigo-500/20 text-slate-100 rounded-tl-sm'
                    : 'bg-slate-800 text-slate-200 rounded-tr-sm'
                  }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-[10px] text-white">✦</div>
                <div className="flex items-center gap-1 rounded-xl border border-indigo-500/20 bg-indigo-950/50 px-3 py-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-indigo-400"
                      style={{ animation: `typing 1.4s infinite ease-in-out ${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      )}

      {/* Ask Helix input */}
      <div className="rounded-xl border border-border bg-surface focus-within:border-indigo-500/50 transition overflow-hidden">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Ask Helix AI to analyze, draft, translate, or search…"
          className="block w-full resize-none bg-transparent px-3 py-2.5 text-[12px] text-slate-200 placeholder:text-slate-500 outline-none min-h-[52px] max-h-32"
          style={{ overflow: 'hidden' }}
        />
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/50">
          <span className="text-[10px] text-slate-500">Enter to send · Uses RAG + Vector DB</span>
          <button
            onClick={handleAsk}
            disabled={!input.trim() || isThinking}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition ${input.trim() && !isThinking
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 shadow-md shadow-indigo-500/20'
                : 'bg-slate-700 opacity-50 cursor-not-allowed'
              }`}
          >
            {isThinking ? 'Thinking…' : 'Ask AI'}
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
