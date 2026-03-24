'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Bot, Shield, Briefcase, User as UserIcon } from 'lucide-react';

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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const formData = new URLSearchParams();
        formData.append('username', email); // OAuth2 expects username
        formData.append('password', password);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Incorrect credentials');
            }

            const data = await res.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            // Decode JWT to get role and redirect
            const payloadBase64 = data.access_token.split('.')[1];
            const payload = JSON.parse(atob(payloadBase64));

            if (payload.role !== role) {
                // If they logged in from wrong portal but credentials are valid, 
                // we push them to their CORRECT dashboard anyway.
                if (payload.role === 'admin') router.push('/admin');
                else if (payload.role === 'agent') router.push('/agent');
                else router.push('/customer');
            } else {
                router.push(`/${role}`);
            }

        } catch (err: any) {
            setError(err.message);
        }
    };

    const RoleIcon = role === 'admin' ? Shield : role === 'agent' ? Briefcase : UserIcon;
    const roleColors = {
        admin: 'from-purple-600 to-indigo-600 shadow-purple-500/30 text-purple-700',
        agent: 'from-blue-600 to-cyan-600 shadow-blue-500/30 text-blue-700',
        customer: 'from-brand-600 to-brand-400 shadow-brand-500/30 text-brand-700'
    }[role] || 'from-surface-600 to-surface-400 text-surface-700';

    return (
        <div className="min-h-screen bg-surface-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-surface-500/5 border border-surface-100">
                <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 bg-gradient-to-tr ${roleColors.split(' ')[0]} ${roleColors.split(' ')[1]} rounded-2xl flex items-center justify-center text-white shadow-lg ${roleColors.split(' ')[2]} mb-4`}>
                        <RoleIcon size={32} />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-surface-900 tracking-tight capitalize">
                        {role} Login
                    </h2>
                    <p className="text-surface-500 text-sm mt-2">Access your specific secure portal</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium">{error}</div>}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-surface-700">Email Address</label>
                            <input type="email" required onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-surface-400"
                                placeholder={`example@${role}.com`} />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-surface-700">Password</label>
                            <input type="password" required onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="••••••••" />
                        </div>
                    </div>

                    <button type="submit" className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-surface-900 hover:bg-surface-800 transition-all shadow-lg text-lg`}>
                        Enter Portal
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-surface-500">Need a specific {role} account? </span>
                        <button type="button" onClick={() => router.push(`/signup/${role}`)} className={`font-semibold ${roleColors.split(' ')[3]} hover:opacity-80 transition-colors`}>Sign up here</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
