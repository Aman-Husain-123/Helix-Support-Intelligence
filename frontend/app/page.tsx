'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare, User, Bell, Settings, Search,
    MoreHorizontal, Phone, Video, Info, Paperclip,
    Send, Bot, Ticket, Star, Clock, Plus, Wifi, WifiOff
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useChat } from '../hooks/useChat';

export default function PlatformDashboard() {
    const { user, loading, logout } = useUser(); // Protected route
    const { messages, sendMessage, isTyping, isConnected } = useChat(user?.sub || 'anonymous');

    const [inputText, setInputText] = useState('');
    const [activeTab, setActiveTab] = useState('inbox');
    const [activeChat, setActiveChat] = useState(1);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        sendMessage(inputText);
        setInputText('');
    };

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-surface-50">
            <Bot className="animate-bounce text-brand-500" size={48} />
        </div>
    );

    return (
        <div className="flex h-screen bg-surface-50">
            {/* Global Navigation Sidebar */}
            <nav className="w-16 bg-surface-900 flex flex-col items-center py-6 text-surface-400 gap-8 shrink-0 relative z-20 shadow-xl">
                <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                    <Bot size={22} className="drop-shadow-sm" />
                </div>

                <div className="flex flex-col gap-5 flex-1 w-full items-center">
                    <NavItem icon={<InboxIcon />} active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} />
                    <NavItem icon={<Ticket size={22} />} active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} />
                    <NavItem icon={<MessageSquare size={22} />} active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
                    <NavItem icon={<User size={22} />} active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
                </div>

                <div className="flex flex-col gap-5 w-full items-center mt-auto">
                    <button onClick={logout} className="text-surface-500 hover:text-white mb-2"><Settings size={20} /></button>
                    <div className="relative mt-2">
                        <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.sub || 'Felix'}&backgroundColor=e2e8f0`}
                            alt="User profile"
                            className="w-10 h-10 rounded-full border-2 border-surface-700 cursor-pointer object-cover transition-transform hover:scale-105"
                        />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'} border-2 border-surface-900 rounded-full`}></span>
                    </div>
                </div>
            </nav>

            {/* List Panel */}
            <aside className="w-[320px] bg-white border-r border-surface-200 flex flex-col shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] relative">
                <div className="p-5 border-b border-surface-100 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold text-surface-900 tracking-tight">Support Chat</h1>
                        <div className={`p-1 px-2 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${isConnected ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />} {isConnected ? 'Online' : 'Disconnected'}
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-brand-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 bg-surface-100 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                    <div className="p-3 rounded-xl bg-brand-50 border border-brand-100">
                        <div className="flex gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center shadow-md font-bold text-lg">H</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-sm text-brand-900">Helix AI Support</h3>
                                    <span className="text-[10px] text-surface-400">Live</span>
                                </div>
                                <p className="text-xs text-brand-700 truncate capitalize font-medium">Organization: {user?.tenant_id || 'Personal'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat View */}
            <main className="flex-1 flex flex-col bg-surface-50/50 backdrop-blur-3xl min-w-0 relative">
                {/* Header */}
                <header className="h-[72px] px-6 border-b border-surface-200 bg-white/80 backdrop-blur-md flex justify-between items-center shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-surface-900">AI Support Agent</h2>
                            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 w-max mt-0.5">
                                <Bot size={10} /> Active Conversation
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <HeaderIconButton icon={<Phone size={18} />} />
                        <HeaderIconButton icon={<Video size={18} />} />
                        <div className="w-px h-6 bg-surface-200 mx-2"></div>
                        <HeaderIconButton icon={<MoreHorizontal size={18} />} />
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4 opacity-70">
                            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center text-surface-400">
                                <MessageSquare size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-surface-900">Start a conversation</h3>
                                <p className="text-sm text-surface-500">How can I help you today? I have access to your documentation and tickets.</p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex max-w-[85%] mb-4 gap-3 items-end ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mb-1 shadow-md ${msg.sender === 'ai' ? 'bg-surface-800 text-white' : 'bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-xs'
                                }`}>
                                {msg.sender === 'ai' ? <Bot size={16} /> : user?.sub.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className={`p-4 rounded-2xl shadow-sm border ${msg.sender === 'ai'
                                    ? 'bg-white rounded-bl-sm border-surface-200 text-surface-800'
                                    : 'bg-brand-600 rounded-br-sm border-brand-500 text-white'
                                }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-surface-100">
                                        <span className="text-[10px] uppercase font-bold text-surface-400 w-full mb-1">Sources Reference:</span>
                                        {msg.sources.map((s, i) => (
                                            <span key={i} className="text-[10px] bg-surface-50 text-surface-600 px-2 py-0.5 rounded border border-surface-200 flex items-center gap-1">
                                                <Info size={10} /> {s}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {msg.type === 'escalation' && (
                                    <div className="mt-3 flex justify-end">
                                        <button className="text-xs font-bold bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors">
                                            Connect with Human Agent
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex max-w-[85%] gap-3 items-end">
                            <div className="w-8 h-8 rounded-full bg-surface-800 text-white flex items-center justify-center shrink-0 mb-1">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white p-3 px-4 rounded-2xl rounded-bl-sm border border-surface-200 shadow-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-surface-200 shrink-0">
                    <div className="flex items-end gap-2 bg-surface-100 rounded-2xl p-2 border border-surface-200 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all shadow-inner">
                        <button type="button" className="p-2.5 text-surface-400 hover:text-brand-500 hover:bg-white rounded-xl transition-all h-[42px]">
                            <Plus size={20} />
                        </button>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Ask anything..."
                            className="flex-1 max-h-[120px] min-h-[42px] bg-transparent resize-none outline-none py-2.5 px-2 text-sm text-surface-800 placeholder:text-surface-400"
                            rows={1}
                        />
                        <button type="button" className="p-2.5 text-surface-400 hover:text-surface-600 hover:bg-white rounded-xl h-[42px]">
                            <Paperclip size={18} />
                        </button>
                        <button
                            type="submit"
                            disabled={!isConnected || !inputText.trim()}
                            className="p-2.5 bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:bg-surface-400 rounded-xl transition-all h-[42px] flex items-center justify-center"
                        >
                            <Send size={18} className="translate-x-0.5" />
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-2">
                        <p className="text-[10px] text-surface-400 font-medium tracking-wide uppercase">
                            <span className="text-brand-500 mr-1">✦</span> {isConnected ? 'AI RAG Pipeline Connected' : 'Waiting for connection...'}
                        </p>
                        <p className="text-[10px] text-surface-400">Shift+Enter for new line</p>
                    </div>
                </form>
            </main>

            {/* Right Side Panel */}
            <aside className="w-[280px] bg-white border-l border-surface-200 flex flex-col shrink-0 overflow-y-auto">
                <div className="p-6 border-b border-surface-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-xl shadow-brand-500/20 ring-4 ring-white relative">
                        {user?.sub.charAt(0).toUpperCase() || 'U'}
                        <div className={`absolute bottom-0 right-1 w-4 h-4 ${isConnected ? 'bg-green-500' : 'bg-red-500'} rounded-full border-2 border-white`}></div>
                    </div>
                    <h2 className="text-lg font-bold text-surface-900 truncate w-full px-4">{user?.sub || 'User'}</h2>
                    <p className="text-xs text-brand-600 font-bold bg-brand-50 px-3 py-1 rounded-full mt-2 uppercase tracking-wide">
                        {user?.role || 'Customer'}
                    </p>
                </div>

                <div className="p-5 border-b border-surface-100">
                    <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-4">Instance Info</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-surface-500">Tenant ID</span>
                            <span className="text-xs font-bold text-surface-900">{user?.tenant_id || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-surface-500">Session Type</span>
                            <span className="text-xs font-bold text-brand-600">WebSocket</span>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-b border-surface-100 bg-surface-50/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Bot size={16} className="text-brand-500" />
                        <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider">AI Insight</h3>
                    </div>
                    <p className="text-[11px] text-surface-500 leading-relaxed border border-surface-200 bg-white p-3 rounded-xl shadow-sm italic">
                        "Retrieval is active. All answers are being grounded in the {user?.tenant_id} workspace library."
                    </p>
                </div>
            </aside>
        </div>
    );
}

// Subcomponents
function NavItem({ icon, active, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 relative group
        ${active
                    ? 'bg-surface-800 text-white shadow-md'
                    : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200'}`}
        >
            <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
            </div>
            {active && (
                <span className="absolute -left-4 w-1 h-8 bg-brand-500 rounded-r-lg shadow-[0_0_10px_rgba(20,184,166,0.5)]"></span>
            )}
        </button>
    );
}

function HeaderIconButton({ icon }: { icon: React.ReactNode }) {
    return (
        <button className="w-9 h-9 flex items-center justify-center text-surface-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
            {icon}
        </button>
    );
}

function InboxIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
        </svg>
    );
}
