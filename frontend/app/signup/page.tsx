'use client';

import { useRouter } from 'next/navigation';
import { Bot, Shield, Briefcase, User as UserIcon, Zap, ArrowLeft } from 'lucide-react';

export default function GlobalSignupDirectory() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-surface-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-500/10 blur-[100px] rounded-full -z-0" />

            <div className="max-w-2xl w-full text-center mb-12 relative z-10">
                <button
                    onClick={() => router.push('/')}
                    className="mb-8 inline-flex items-center gap-2 text-surface-500 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Back to Home
                </button>
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-accent-600 to-accent-400 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent-500/30">
                        <Zap size={32} />
                    </div>
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    Join the Helix Core
                </h1>
                <p className="mt-3 text-lg text-surface-500">
                    Choose the type of account you need to create
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full relative z-10">
                {/* Admin Account Signup */}
                <button onClick={() => router.push('/signup/admin')} className="bg-surface-900/50 backdrop-blur-sm p-8 rounded-[32px] border border-white/5 hover:border-purple-500/30 hover:-translate-y-1 transition-all text-left group">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <Shield size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Admin Account</h3>
                    <p className="text-surface-500 text-sm leading-relaxed">Create a new workspace, configure models, and manage agents.</p>
                </button>

                {/* Agent Account Signup */}
                <button onClick={() => router.push('/signup/agent')} className="bg-surface-900/50 backdrop-blur-sm p-8 rounded-[32px] border border-white/5 hover:border-blue-500/30 hover:-translate-y-1 transition-all text-left group">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Briefcase size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Agent Account</h3>
                    <p className="text-surface-500 text-sm leading-relaxed">Join an existing workspace to support customers alongside AI.</p>
                </button>

                {/* Customer Account Signup */}
                <button onClick={() => router.push('/signup/customer')} className="bg-surface-900/50 backdrop-blur-sm p-8 rounded-[32px] border border-white/5 hover:border-accent-500/30 hover:-translate-y-1 transition-all text-left group">
                    <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center text-accent-400 mb-6 group-hover:bg-accent-600 group-hover:text-white transition-all">
                        <UserIcon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Customer Account</h3>
                    <p className="text-surface-500 text-sm leading-relaxed">Register to receive instant AI help and track your support history.</p>
                </button>
            </div>

            <div className="mt-16 text-center text-surface-500 relative z-10">
                Already have an account? <button onClick={() => router.push('/login')} className="text-accent-400 font-semibold hover:text-accent-300 transition-all border-b border-accent-400/20">Sign in to your portal</button>
            </div>
        </div>
    );
}
