'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, User, Shield, Briefcase } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [role, setRole] = useState('customer'); // default
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
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Signup failed');
            }

            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-surface-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-brand-500/10 border border-surface-100">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 mb-4">
                        <Bot size={32} />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-surface-900 tracking-tight">Create your account</h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    {error && <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium">{error}</div>}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-surface-700">Email Address</label>
                            <input type="email" required onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-surface-400"
                                placeholder="alice@company.com" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-surface-700">Organization (Tenant ID)</label>
                            <input type="text" required onChange={(e) => setTenantId(e.target.value)}
                                className="mt-1 w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-surface-400"
                                placeholder="acme-corp" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-surface-700">Password</label>
                            <input type="password" required onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-surface-700 mb-2 block">Select Role</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button type="button" onClick={() => setRole('customer')} className={`flex flex-col items-center p-3 rounded-xl border transition-all ${role === 'customer' ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-md shadow-brand-500/10' : 'border-surface-200 text-surface-500 hover:bg-surface-50'}`}>
                                    <User size={20} className="mb-1" /> <span className="text-xs font-semibold uppercase">Customer</span>
                                </button>
                                <button type="button" onClick={() => setRole('agent')} className={`flex flex-col items-center p-3 rounded-xl border transition-all ${role === 'agent' ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-md shadow-brand-500/10' : 'border-surface-200 text-surface-500 hover:bg-surface-50'}`}>
                                    <Briefcase size={20} className="mb-1" /> <span className="text-xs font-semibold uppercase">Agent</span>
                                </button>
                                <button type="button" onClick={() => setRole('admin')} className={`flex flex-col items-center p-3 rounded-xl border transition-all ${role === 'admin' ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-md shadow-brand-500/10' : 'border-surface-200 text-surface-500 hover:bg-surface-50'}`}>
                                    <Shield size={20} className="mb-1" /> <span className="text-xs font-semibold uppercase">Admin</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all shadow-lg shadow-brand-500/30">
                        Sign up
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-surface-500">Already have an account? </span>
                        <button type="button" onClick={() => router.push('/login')} className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">Log in</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
