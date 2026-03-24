'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
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
            const res = await fetch('http://localhost:8000/api/auth/login', {
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

            if (payload.role === 'admin') router.push('/admin');
            else if (payload.role === 'agent') router.push('/agent');
            else router.push('/'); // Customer chat dashboard

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
                    <h2 className="text-center text-3xl font-extrabold text-surface-900 tracking-tight">Sign in to Helix</h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium">{error}</div>}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-surface-700">Email Address</label>
                            <input type="email" required onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-surface-400"
                                placeholder="bob@acme.com" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-surface-700">Password</label>
                            <input type="password" required onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="••••••••" />
                        </div>
                    </div>

                    <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all shadow-lg shadow-brand-500/30 text-lg">
                        Log in
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-surface-500">Don't have an account? </span>
                        <button type="button" onClick={() => router.push('/signup')} className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">Sign up</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
