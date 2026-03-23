import React from 'react';

export interface Message {
  id: number;
  from: 'customer' | 'agent' | 'ai' | 'system';
  name: string;
  initials: string;
  time: string;
  text: string;
  status?: 'sent' | 'delivered' | 'read';
  reactions?: { emoji: string; count: number }[];
}

interface MessageBubbleProps extends Message {
  onReact: (id: number, emoji: string) => void;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😄', '🎯', '✅'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  id, from, name, initials, time, text, status, reactions, onReact,
}) => {
  const isSelf = from === 'agent';
  const isAI = from === 'ai';
  const isSystem = from === 'system';
  const [showReactionPicker, setShowReactionPicker] = React.useState(false);

  const avatarGradient =
    isAI
      ? 'from-indigo-500 via-violet-500 to-cyan-400'
      : isSelf
        ? 'from-indigo-500 to-sky-400'
        : 'from-slate-600 to-slate-700';

  const bubbleClass = isAI
    ? 'bg-gradient-to-br from-slate-900 to-indigo-950/80 border border-indigo-500/30 shadow-lg shadow-indigo-500/5 text-slate-100'
    : isSystem
      ? 'bg-slate-900/50 border border-border text-slate-400 font-mono text-center text-[10px]'
      : isSelf
        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-700/20'
        : 'bg-slate-800/80 text-slate-100 border border-border';

  return (
    <div className={`group flex gap-3 animate-slide-up ${isSelf ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <div className={`mt-0.5 h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient} text-[11px] font-bold text-white shadow-md`}>
          {isAI ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          ) : initials}
        </div>
      </div>

      {/* Content */}
      <div className={`relative flex max-w-[72%] flex-col gap-1 ${isSelf ? 'items-end' : ''}`}>
        {/* Name + time */}
        <div className={`flex items-center gap-2 text-[11px] ${isSelf ? 'flex-row-reverse' : ''}`}>
          <span className={`font-semibold ${isAI ? 'ai-shimmer' : 'text-slate-300'}`}>{name}</span>
          {isAI && (
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-indigo-300">
              AI
            </span>
          )}
          <span className="text-slate-500">{time}</span>
        </div>

        {/* Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${bubbleClass} ${isSelf ? 'rounded-tr-sm' : 'rounded-tl-sm'
            }`}
        >
          {isAI && (
            <div className="absolute -top-px left-4 h-px w-16 bg-gradient-to-r from-indigo-400/60 to-transparent" />
          )}
          {text}
          {/* Reaction picker trigger */}
          <button
            onClick={() => setShowReactionPicker((p) => !p)}
            className={`absolute -top-3 opacity-0 group-hover:opacity-100 transition ${isSelf ? 'right-2' : 'left-2'
              } flex h-6 items-center gap-0.5 rounded-full border border-border bg-surface px-1.5 text-[11px] shadow-md`}
          >
            <span>+</span>
            <span>😊</span>
          </button>
          {showReactionPicker && (
            <div className={`absolute -top-10 z-10 flex gap-1 rounded-full border border-border bg-surface px-2 py-1 shadow-xl animate-fade-in ${isSelf ? 'right-0' : 'left-0'
              }`}>
              {EMOJI_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { onReact(id, emoji); setShowReactionPicker(false); }}
                  className="text-base hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reactions */}
        {reactions && reactions.length > 0 && (
          <div className={`flex gap-1 ${isSelf ? 'justify-end' : ''}`}>
            {reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact(id, r.emoji)}
                className="flex items-center gap-1 rounded-full border border-border bg-surface px-1.5 py-0.5 text-[11px] hover:border-indigo-500/40 transition"
              >
                <span>{r.emoji}</span>
                <span className="text-slate-400">{r.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Status ticks (agent only) */}
        {isSelf && !isAI && status && (
          <div className="flex items-center gap-0.5 text-[10px] text-slate-500 mt-0.5">
            {status === 'read' ? (
              <span className="text-cyan-400 flex items-center gap-0.5">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
                Read
              </span>
            ) : status === 'delivered' ? (
              <span>Delivered</span>
            ) : (
              <span>Sent</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
