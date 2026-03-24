'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Bot, Shield, Briefcase, User as UserIcon, Zap } from 'lucide-react';

export default function RoleLoginPage() {
    const router = useRouter();
    const params = useParams();
    const role = (params.role as string)?.toLowerCase();

    // Validate role path
    useEffect(() => {
        if (!['customer', 'agent', 'admin'].includes(role)) {
            router.push('/login/customer');
        }
    }, [role, router]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        try {
            const res = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Incorrect credentials');
            }

            const data = await res.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            // Decode JWT to get role and redirect
            const payloadBase64 = data.access_token.split('.')[1];
            const payload = JSON.parse(atob(payloadBase64));

            if (payload.role !== role) {
                if (payload.role === 'admin') router.push('/admin');
                else if (payload.role === 'agent') router.push('/agent');
                else router.push('/customer');
            } else {
                router.push(`/${role}`);
            }

        } catch (err: any) {
            setError(err.message === 'Failed to fetch' ? 'Backend server is not responding. Please check if it is running on port 8000.' : err.message);
        } finally {
            setLoading(false);
        }
    };

    const RoleIcon = role === 'admin' ? Shield : role === 'agent' ? Briefcase : UserIcon;
    const theme = {
        admin: { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', gradient: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-500/20' },
        agent: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', gradient: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/20' },
        customer: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' }
    }[role] || { color: 'text-surface-400', bg: 'bg-surface-800', border: 'border-surface-700', gradient: 'from-surface-600 to-surface-400', shadow: 'shadow-none' };

    return (
        <div className="min-h-screen bg-surface-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-surface-800">
            {/* Background blur effects */}
            <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 opacity-10 rounded-full blur-[120px] bg-gradient-to-br ${theme.gradient}`} />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 opacity-5 rounded-full blur-[100px] bg-blue-500" />

            <div className="max-w-md w-full relative z-10 space-y-10 bg-surface-900 border border-surface-800 p-12 rounded-[48px] shadow-2xl backdrop-blur-3xl">
                <div className="flex flex-col items-center">
                    <div className={`w-20 h-20 bg-gradient-to-br ${theme.gradient} rounded-3xl flex items-center justify-center text-white shadow-2xl ${theme.shadow} mb-8 transform transition-transform hover:scale-105`}>
                        <RoleIcon size={36} className="fill-white/10" />
                    </div>
                    <h2 className="text-center text-4xl font-black text-white tracking-tighter capitalize">
                        {role} Login
                    </h2>
                    <p className="text-surface-500 text-sm mt-3 font-medium">Access your secure portal</p>
                </div>

                <form className="mt-10 space-y-8" onSubmit={handleLogin}>
                    {error && (
                        <div className={`text-sm text-center py-3 px-4 rounded-2xl font-bold flex flex-col gap-1 border ${theme.bg} ${theme.border} ${theme.color}`}>
                            <span className="opacity-70 text-[10px] uppercase tracking-widest">Error Details</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">Email Address</label>
                            <input
                                type="email"
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-5 py-4 bg-surface-950 border border-surface-800 rounded-[20px] text-white outline-none focus:border-opacity-50 transition-all placeholder:text-surface-700 focus:ring-4 focus:ring-opacity-5 ring-current`}
                                style={{ borderColor: email ? 'rgba(var(--current-color), 0.2)' : undefined }}
                                placeholder={`yourname@${role}.com`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">Password</label>
                            <input
                                type="password"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-5 py-4 bg-surface-950 border border-surface-800 rounded-[20px] text-white outline-none focus:border-opacity-50 transition-all placeholder:text-surface-700 focus:ring-4 focus:ring-opacity-5 ring-current`}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 px-6 rounded-[24px] text-white bg-white/5 border border-white/10 hover:bg-white/10 font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? 'Authenticating...' : `Enter ${role} Portal`}
                        {!loading && <Zap size={18} className="text-surface-400 group-hover:text-white" />}
                    </button>

                    <div className="text-center">
                        <p className="text-surface-500 text-sm font-medium">
                            Need a {role} account?
                            <button
                                type="button"
                                onClick={() => router.push(`/signup/${role}`)}
                                className={`ml-2 font-black ${theme.color} hover:opacity-80 transition-opacity underline decoration-2 underline-offset-4`}
                            >
                                Sign up here
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
