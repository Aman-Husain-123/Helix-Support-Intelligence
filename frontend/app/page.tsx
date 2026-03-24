'use client';

import React, { useState } from 'react';
import {
    MessageSquare, User, Bell, Settings, Search,
    MoreHorizontal, Phone, Video, Info, Paperclip,
    Send, Bot, Ticket, Star, Clock, Plus
} from 'lucide-react';

export default function PlatformDashboard() {
    const [activeTab, setActiveTab] = useState('inbox');
    const [activeChat, setActiveChat] = useState(1);

    const chats = [
        { id: 1, name: 'Alice Freeman', role: 'Customer', preview: 'Is it possible to upgrade my current plan?', time: '10:42 AM', unread: 2, status: 'online' },
        { id: 2, name: 'Support Team', role: 'Internal', preview: 'Hey, I can take over the scaling issue ticket.', time: '09:15 AM', unread: 0, status: 'away' },
        { id: 3, name: 'Tech Solutions Inc.', role: 'Enterprise Client', preview: 'The API integration is failing with error 403.', time: 'Yesterday', unread: 1, status: 'offline' },
        { id: 4, name: 'Marketing Dept', role: 'Internal Group', preview: 'Can we configure automated email responses?', time: 'Yesterday', unread: 0, status: 'online' },
    ];

    return (
        <div className="flex h-screen bg-surface-50">
            {/* 1. Global Navigation Sidebar */}
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
                    <NavItem icon={<Settings size={22} />} />
                    <div className="relative mt-2">
                        <img
                            src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0"
                            alt="User profile"
                            className="w-10 h-10 rounded-full border-2 border-surface-700 cursor-pointer object-cover transition-transform hover:scale-105"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-500 border-2 border-surface-900 rounded-full"></span>
                    </div>
                </div>
            </nav>

            {/* 2. List Panel */}
            <aside className="w-[320px] bg-white border-r border-surface-200 flex flex-col shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] relative">
                <div className="p-5 border-b border-surface-100 flex flex-col gap-4 bg-white/50 backdrop-blur-md sticky top-0">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold text-surface-900 tracking-tight">Inbox</h1>
                        <button className="p-2bg-surface-100 rounded-full hover:bg-surface-200 transition-colors text-surface-600">
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search messages, tickets..."
                            className="w-full pl-10 pr-4 py-2 bg-surface-100 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setActiveChat(chat.id)}
                            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group ${activeChat === chat.id
                                    ? 'bg-brand-50 border border-brand-100'
                                    : 'hover:bg-surface-50 border border-transparent'
                                }`}
                        >
                            <div className="flex gap-3">
                                <div className="relative shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium shadow-sm transition-transform group-hover:scale-105 ${activeChat === chat.id ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white' : 'bg-surface-200 text-surface-600'
                                        }`}>
                                        {chat.name.charAt(0)}
                                    </div>
                                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${chat.status === 'online' ? 'bg-green-500' : chat.status === 'away' ? 'bg-yellow-400' : 'bg-surface-300'
                                        }`}></span>
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`font-semibold text-sm truncate ${activeChat === chat.id ? 'text-brand-900' : 'text-surface-900'}`}>
                                            {chat.name}
                                        </h3>
                                        <span className="text-xs text-surface-400 whitespace-nowrap ml-2">{chat.time}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-sm truncate mr-2 ${activeChat === chat.id ? 'text-brand-700' : 'text-surface-500'} ${chat.unread > 0 ? 'font-medium text-surface-800' : ''}`}>
                                            {chat.preview}
                                        </p>
                                        {chat.unread > 0 && (
                                            <span className="px-1.5 py-0.5 min-w-[20px] text-center bg-brand-500 text-white text-[10px] font-bold rounded-full shadow-sm shadow-brand-500/30">
                                                {chat.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* 3. Main Chat View */}
            <main className="flex-1 flex flex-col bg-surface-50/50 backdrop-blur-3xl min-w-0 relative">
                {/* Header */}
                <header className="h-[72px] px-6 border-b border-surface-200 bg-white/80 backdrop-blur-md flex justify-between items-center shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-surface-900">Alice Freeman</h2>
                            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 w-max mt-0.5">
                                <Ticket size={10} /> Ticket #4829
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
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex justify-center my-6">
                        <span className="text-xs font-medium text-surface-400 bg-surface-200/50 backdrop-blur px-3 py-1 rounded-full">
                            Today, 10:24 AM
                        </span>
                    </div>

                    {/* Assistant auto-response message */}
                    <div className="flex max-w-[85%] mb-4 gap-3 items-end">
                        <div className="w-8 h-8 rounded-full bg-surface-800 text-white flex items-center justify-center shrink-0 mb-1 shadow-md">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-bl-sm border border-surface-200 shadow-sm">
                            <p className="text-sm text-surface-800 leading-relaxed">
                                Hi Alice! I'm Euron, your AI support assistant. I see you're asking about upgrading your current plan. I've analyzed your account and prepared some options for you.
                            </p>
                            <div className="mt-3 bg-surface-50 p-3 rounded-xl border border-surface-100 flex gap-3 items-center">
                                <div className="bg-brand-100 text-brand-600 p-2 rounded-lg">
                                    <Star size={16} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-surface-900">Pro Plan (Recommended)</h4>
                                    <p className="text-xs text-surface-500">$29/mo • Includes API access</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Message */}
                    <div className="flex max-w-[85%] mb-4 gap-3 items-end">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-medium shrink-0 mb-1 shadow-md shadow-brand-500/20">
                            A
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-bl-sm border border-surface-200 shadow-sm group relative">
                            <p className="text-sm text-surface-800">
                                Yes, that looks perfect! How do I proceed with the upgrade? Will there be any downtime?
                            </p>
                            <span className="absolute -right-12 bottom-2 text-[10px] text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                10:42 AM
                            </span>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-surface-200 shrink-0">
                    <div className="flex items-end gap-2 bg-surface-100 rounded-2xl p-2 border border-surface-200 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all shadow-inner">
                        <button className="p-2.5 text-surface-400 hover:text-brand-500 hover:bg-white rounded-xl transition-all h-[42px] mt-auto">
                            <Plus size={20} />
                        </button>
                        <textarea
                            placeholder="Type your reply, or type / to use AI commands..."
                            className="flex-1 max-h-[120px] min-h-[42px] bg-transparent resize-none outline-none py-2.5 px-2 text-sm text-surface-800 placeholder:text-surface-400"
                            rows={1}
                        />
                        <button className="p-2.5 text-surface-400 hover:text-surface-600 hover:bg-white rounded-xl transition-all h-[42px] mt-auto">
                            <Paperclip size={18} />
                        </button>
                        <button className="p-2.5 bg-brand-500 text-white hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 rounded-xl transition-all h-[42px] mt-auto flex items-center justify-center">
                            <Send size={18} className="translate-x-0.5" />
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-2">
                        <p className="text-[10px] text-surface-400 font-medium tracking-wide uppercase">
                            <span className="text-brand-500 mr-1">✦</span> AI Suggestions enabled
                        </p>
                        <p className="text-[10px] text-surface-400">Press Enter to send, Shift+Enter for new line</p>
                    </div>
                </div>
            </main>

            {/* 4. Right Side Panel (Customer/Context) */}
            <aside className="w-[280px] bg-white border-l border-surface-200 flex flex-col shrink-0 overflow-y-auto">
                {/* Profile Card */}
                <div className="p-6 border-b border-surface-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-xl shadow-brand-500/20 ring-4 ring-white relative">
                        A
                        <div className="absolute bottom-0 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <h2 className="text-lg font-bold text-surface-900">Alice Freeman</h2>
                    <p className="text-sm text-surface-500">alice.f@example.com</p>

                    <div className="flex gap-2 mt-4 w-full">
                        <button className="flex-1 text-xs font-semibold bg-surface-100 hover:bg-surface-200 text-surface-700 py-2 rounded-lg transition-colors border border-surface-200 text-center">
                            View Profile
                        </button>
                        <button className="flex-1 text-xs font-semibold bg-surface-900 hover:bg-surface-800 text-white py-2 rounded-lg transition-colors shadow-md text-center">
                            Create Task
                        </button>
                    </div>
                </div>

                {/* Context Stats */}
                <div className="p-5 border-b border-surface-100">
                    <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-4">Customer Intelligence</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-surface-600">
                                <div className="w-7 h-7 rounded bg-brand-50 text-brand-600 flex items-center justify-center"><Star size={14} /></div>
                                <span className="text-sm font-medium">Sentiment</span>
                            </div>
                            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">Positive</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-surface-600">
                                <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center"><Clock size={14} /></div>
                                <span className="text-sm font-medium">Time Zone</span>
                            </div>
                            <span className="text-sm font-medium text-surface-900">EST (10:42 AM)</span>
                        </div>
                    </div>
                </div>

                {/* AI Summary */}
                <div className="p-5 border-b border-surface-100 bg-surface-50/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Bot size={16} className="text-brand-500" />
                        <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider">AI Summary</h3>
                    </div>
                    <p className="text-sm text-surface-600 leading-relaxed border border-surface-200 bg-white p-3 rounded-xl shadow-sm">
                        Customer is currently on basic tier, inquiring about feature limitations and upgrade paths. Has 3 previous tickets, all resolved with positive feedback.
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

// Missing Inbox Icon placeholder since Lucide Inbox might need specific import if not available
function InboxIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
        </svg>
    );
}
