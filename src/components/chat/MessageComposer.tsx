import React, { useRef, useState, useLayoutEffect } from 'react';

interface MessageComposerProps {
  onSend: (text: string) => void;
  aiDraftText?: string;
  onInsertDraft?: () => void;
}

type FormatType = 'bold' | 'italic' | 'code' | 'link';

const formatActions: { type: FormatType; icon: React.ReactNode; label: string }[] = [
  {
    type: 'bold',
    label: 'Bold',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h8a4 4 0 000-8H6v8zm0 0h9a4 4 0 010 8H6v-8z" />
      </svg>
    ),
  },
  {
    type: 'italic',
    label: 'Italic',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 5h4M8 19h4M14 5l-4 14" />
      </svg>
    ),
  },
  {
    type: 'code',
    label: 'Code',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    type: 'link',
    label: 'Link',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
];

export const MessageComposer: React.FC<MessageComposerProps> = ({ onSend, aiDraftText, onInsertDraft }) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'reply' | 'note' | 'email'>('reply');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleInsert = () => {
    if (aiDraftText) {
      setText(aiDraftText);
      onInsertDraft?.();
      textareaRef.current?.focus();
    }
  };

  const modeClass = (m: typeof mode) =>
    mode === m
      ? 'bg-surface text-slate-100 border border-border'
      : 'text-slate-500 hover:text-slate-300';

  return (
    <div className="flex-shrink-0 border-t border-border bg-sidebar/90 backdrop-blur-xl px-4 py-3 space-y-2">
      {/* Mode tabs */}
      <div className="flex items-center gap-1">
        {(['reply', 'note', 'email'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1 text-[11px] font-medium capitalize transition ${modeClass(m)}`}
          >
            {m === 'note' ? '📝 Note' : m === 'email' ? '✉️ Email' : '💬 Reply'}
          </button>
        ))}

        {aiDraftText && (
          <button
            onClick={handleInsert}
            className="ml-auto flex items-center gap-1.5 rounded-md border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-300 transition hover:border-indigo-400 hover:bg-indigo-500/20"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Insert AI draft
          </button>
        )}
      </div>

      {/* Composer box */}
      <div className={`relative rounded-xl border ${mode === 'note'
          ? 'border-amber-500/30 bg-amber-500/5'
          : mode === 'email'
            ? 'border-violet-500/30 bg-violet-500/5'
            : 'border-border bg-surface'
        } transition focus-within:border-indigo-500/60 focus-within:shadow-sm focus-within:shadow-indigo-500/10`}>
        {/* Formatting toolbar */}
        <div className="flex items-center gap-0.5 border-b border-border/50 px-3 py-1.5">
          {formatActions.map((fa) => (
            <button
              key={fa.type}
              title={fa.label}
              className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition hover:bg-slate-700/50 hover:text-slate-200"
            >
              {fa.icon}
            </button>
          ))}
          <div className="mx-1 h-3.5 w-px bg-border" />
          <button title="Emoji" className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition hover:bg-slate-700/50 hover:text-slate-200 text-sm">
            😊
          </button>
          <button title="Attach file" className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition hover:bg-slate-700/50 hover:text-slate-200">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder={
            mode === 'note'
              ? 'Add an internal note (not visible to customer)…'
              : mode === 'email'
                ? 'Compose email reply…'
                : 'Reply to the customer…'
          }
          className="block w-full resize-none bg-transparent px-3 py-2.5 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none min-h-[56px] max-h-40"
          style={{ overflow: 'hidden' }}
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[10px] text-slate-500">
            {mode === 'note' ? 'Only agents can see internal notes' : 'Enter to send · Shift+Enter for new line'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600">{text.length > 0 ? `${text.length} chars` : ''}</span>
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] font-semibold text-white transition ${text.trim()
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-700 cursor-not-allowed opacity-50'
                }`}
            >
              Send
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
