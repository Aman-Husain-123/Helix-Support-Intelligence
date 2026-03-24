'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '../hooks/useUser';
import { useEffect } from 'react';
import { Shield, Briefcase, User as UserIcon, Zap } from 'lucide-react';

export default function GlobalPortalSelection() {
    const router = useRouter();
    const { user, loading } = useUser();

    useEffect(() => {
        if (!loading && user) {
            // If already logged in, redirect to their specific dashboard
            if (user.role === 'admin') router.push('/admin');
            else if (user.role === 'agent') router.push('/agent');
            else router.push('/customer');
        }
    }, [user, loading, router]);

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-surface-950 text-accent-500">
            <Zap className="animate-pulse" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-surface-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-500/10 blur-[100px] rounded-full -z-0" />

            <div className="max-w-2xl w-full text-center mb-12 relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-accent-600 to-accent-400 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent-500/30">
                        <Zap size={32} />
                    </div>
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    Welcome to Helix Core
                </h1>
                <p className="mt-3 text-lg text-surface-500">
                    Select your portal to sign in
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full relative z-10">
                {/* Admin Portal */}
                <button onClick={() => router.push('/login/admin')} className="bg-surface-900/50 backdrop-blur-sm p-8 rounded-[32px] border border-white/5 hover:border-purple-500/30 hover:-translate-y-1 transition-all text-left group">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all">
                        <Shield size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Admin Portal</h3>
                    <p className="text-surface-500 text-sm leading-relaxed">Centralized management for system config, agents, and workspace performance.</p>
                </button>

                {/* Agent Portal */}
                <button onClick={() => router.push('/login/agent')} className="bg-surface-900/50 backdrop-blur-sm p-8 rounded-[32px] border border-white/5 hover:border-blue-500/30 hover:-translate-y-1 transition-all text-left group">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Briefcase size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Agent Portal</h3>
                    <p className="text-surface-500 text-sm leading-relaxed">Collaborative workspace for real-time ticket triage and AI co-piloted support.</p>
                </button>

                {/* Customer Portal */}
                <button onClick={() => router.push('/login/customer')} className="bg-surface-900/50 backdrop-blur-sm p-8 rounded-[32px] border border-white/5 hover:border-accent-500/30 hover:-translate-y-1 transition-all text-left group">
                    <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center text-accent-400 mb-6 group-hover:bg-accent-600 group-hover:text-white transition-all">
                        <UserIcon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Customer Portal</h3>
                    <p className="text-surface-500 text-sm leading-relaxed">Direct support gateway for instant AI assistance and ticket history tracking.</p>
                </button>
            </div>

            <div className="mt-16 text-center text-surface-500 relative z-10 flex flex-col gap-4">
                <p>Don't have an account? <button onClick={() => router.push('/signup')} className="text-accent-400 font-semibold hover:text-accent-300 transition-all border-b border-accent-400/20">Create a workspace</button></p>
                <div className="flex items-center justify-center gap-6 mt-4 opacity-50">
                    <span className="text-[10px] uppercase font-bold tracking-widest">Multi-Tenant</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest">AI RAG Focused</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Helix ID v2.0</span>
                </div>
            </div>
        </div>
    );
}
