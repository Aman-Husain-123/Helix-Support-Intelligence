'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Shield, Briefcase, User as UserIcon, Bot, Zap } from 'lucide-react';

export default function RoleSignupPage() {
    const router = useRouter();
    const params = useParams();
    const role = (params.role as string)?.toLowerCase();

    // Validate role path
    useEffect(() => {
        if (!['customer', 'agent', 'admin'].includes(role)) {
            router.push('/signup/customer');
        }
    }, [role, router]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role, tenant_id: tenantId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Signup failed');
            }

            // Immediately redirect to login for this role upon success
            router.push(`/login/${role}`);
        } catch (err: any) {
            setError(err.message === 'Failed to fetch' ? 'Backend server is unreachable. Ensure it is running on port 8000.' : err.message);
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
            <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] opacity-10 rounded-full blur-[120px] bg-gradient-to-br ${theme.gradient}`} />

            <div className="max-w-md w-full relative z-10 space-y-10 bg-surface-900 border border-surface-800 p-12 rounded-[48px] shadow-2xl backdrop-blur-3xl">
                <div className="flex flex-col items-center">
                    <div className={`w-20 h-20 bg-gradient-to-br ${theme.gradient} rounded-3xl flex items-center justify-center text-white shadow-2xl ${theme.shadow} mb-8 transform transition-transform hover:scale-105`}>
                        <RoleIcon size={36} className="fill-white/10" />
                    </div>
                    <h2 className="text-center text-4xl font-black text-white tracking-tighter capitalize">
                        Create {role} Account
                    </h2>
                    <p className="text-surface-500 text-sm mt-3 font-medium">Join the Helix workspace</p>
                </div>

                <form className="mt-10 space-y-7" onSubmit={handleSignup}>
                    {error && (
                        <div className={`text-sm text-center py-3 px-4 rounded-2xl font-bold border ${theme.bg} ${theme.border} ${theme.color}`}>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">Email Address</label>
                            <input
                                type="email"
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-5 py-4 bg-surface-950 border border-surface-800 rounded-[20px] text-white outline-none transition-all placeholder:text-surface-700 focus:ring-4 focus:ring-opacity-5 ring-current`}
                                placeholder="name@company.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">Organization (Tenant ID)</label>
                            <input
                                type="text"
                                required
                                onChange={(e) => setTenantId(e.target.value)}
                                className={`w-full px-5 py-4 bg-surface-950 border border-surface-800 rounded-[20px] text-white outline-none transition-all placeholder:text-surface-700 focus:ring-4 focus:ring-opacity-5 ring-current`}
                                placeholder="E.g. AcmeCorp"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">Password</label>
                            <input
                                type="password"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-5 py-4 bg-surface-950 border border-surface-800 rounded-[20px] text-white outline-none transition-all placeholder:text-surface-700 focus:ring-4 focus:ring-opacity-5 ring-current`}
                                placeholder="Minimum 8 characters"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 px-6 rounded-[24px] text-white bg-white/5 border border-white/10 hover:bg-white/10 font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50`}
                    >
                        {loading ? 'Creating Account...' : 'Complete Registration'}
                        {!loading && <Bot size={18} className="text-surface-400" />}
                    </button>

                    <div className="text-center">
                        <p className="text-surface-500 text-sm font-medium">
                            Already registered?
                            <button
                                type="button"
                                onClick={() => router.push(`/login/${role}`)}
                                className={`ml-2 font-black ${theme.color} hover:opacity-80 transition-opacity underline decoration-2 underline-offset-4`}
                            >
                                Log in instead
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
