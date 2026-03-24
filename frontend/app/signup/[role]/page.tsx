'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Shield, Briefcase, User as UserIcon } from 'lucide-react';

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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://127.0.0.1:8000/api/auth/signup', {
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
            setError(err.message);
        }
    };

    const RoleIcon = role === 'admin' ? Shield : role === 'agent' ? Briefcase : UserIcon;
    const roleColors = {
        admin: 'from-purple-600 to-indigo-600 shadow-purple-500/30 text-purple-700 focus:ring-purple-500',
        agent: 'from-blue-600 to-cyan-600 shadow-blue-500/30 text-blue-700 focus:ring-blue-500',
        customer: 'from-brand-600 to-brand-400 shadow-brand-500/30 text-brand-700 focus:ring-brand-500'
    }[role] || 'from-surface-600 to-surface-400 text-surface-700 focus:ring-surface-500';

    return (
        <div className="min-h-screen bg-surface-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-surface-500/5 border border-surface-100">
                <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 bg-gradient-to-tr ${roleColors.split(' ')[0]} ${roleColors.split(' ')[1]} rounded-2xl flex items-center justify-center text-white shadow-lg ${roleColors.split(' ')[2]} mb-4`}>
                        <RoleIcon size={32} />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-surface-900 tracking-tight capitalize">
                        Register Profile ({role})
                    </h2>
                    <p className="text-surface-500 text-sm mt-2">Create a secure Helix workspace account</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    {error && <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium">{error}</div>}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-surface-700">Email Address</label>
                            <input type="email" required onChange={(e) => setEmail(e.target.value)}
                                className={`mt-1 w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 outline-none transition-all placeholder:text-surface-400 ${roleColors.split(' ')[4]}`}
                                placeholder={`you@${role}.com`} />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-surface-700">Organization (Tenant ID)</label>
                            <input type="text" required onChange={(e) => setTenantId(e.target.value)}
                                className={`mt-1 w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 outline-none transition-all ${roleColors.split(' ')[4]}`}
                                placeholder="E.g. Acme Corp" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-surface-700">Password</label>
                            <input type="password" required onChange={(e) => setPassword(e.target.value)}
                                className={`mt-1 w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 outline-none transition-all ${roleColors.split(' ')[4]}`}
                                placeholder="••••••••" />
                        </div>
                    </div>

                    <button type="submit" className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-surface-900 hover:bg-surface-800 transition-all shadow-lg text-lg`}>
                        Complete Registration
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-surface-500">Already registered? </span>
                        <button type="button" onClick={() => router.push(`/login/${role}`)} className={`font-semibold ${roleColors.split(' ')[3]} hover:opacity-80 transition-colors`}>Log in here</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
