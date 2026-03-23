import React, { useState } from 'react';
import { useUser, type Role } from '../context/AuthContext';

const DEMO_CREDENTIALS: { role: Role; email: string; password: string; label: string; color: string }[] = [
    { role: 'agent', email: 'agent@helix.io', password: 'agent123', label: 'Agent', color: 'from-indigo-500 to-sky-400' },
    { role: 'customer', email: 'customer@example.com', password: 'customer123', label: 'Customer', color: 'from-violet-500 to-pink-500' },
    { role: 'admin', email: 'admin@helix.io', password: 'admin123', label: 'Admin', color: 'from-rose-500 to-pink-600' },
];

interface LoginPageProps {
    onNavigateSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateSignup }) => {
    const { login, isLoading, error, clearError } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    const fillDemo = (cred: typeof DEMO_CREDENTIALS[number]) => {
        clearError();
        setEmail(cred.email);
        setPassword(cred.password);
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background bg-grid-pattern overflow-hidden">
            {/* Background glow blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-cyan-500/8 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-violet-500/8 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md px-4 animate-slide-up">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-xl shadow-indigo-500/30 animate-glow">
                        <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6 text-white">
                            <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M3 6l7 4 7-4M10 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Welcome back</h1>
                        <p className="mt-1 text-sm text-slate-400">Sign in to Helix Support Intelligence</p>
                    </div>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border bg-surface/80 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl">

                    {/* Demo quick-fill */}
                    <div className="mb-5">
                        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                            Demo accounts — click to fill
                        </p>
                        <div className="flex gap-2">
                            {DEMO_CREDENTIALS.map((cred) => (
                                <button
                                    key={cred.role}
                                    type="button"
                                    onClick={() => fillDemo(cred)}
                                    className={`flex-1 rounded-xl border border-border bg-background/60 py-2 text-center transition hover:border-indigo-500/40 hover:bg-indigo-500/10
                    ${email === cred.email ? 'border-indigo-500/60 bg-indigo-500/15' : ''}`}
                                >
                                    <div className={`mx-auto mb-1 h-7 w-7 rounded-full bg-gradient-to-br ${cred.color} flex items-center justify-center text-[10px] font-bold text-white`}>
                                        {cred.label[0]}
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-300">{cred.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex-1 border-t border-border" />
                        <span className="text-[10px] text-slate-600">or sign in manually</span>
                        <div className="flex-1 border-t border-border" />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 animate-fade-in">
                            <svg className="h-4 w-4 flex-shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[12px] text-rose-300">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-[12px] font-medium text-slate-300" htmlFor="login-email">
                                Email address
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <input
                                    id="login-email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => { clearError(); setEmail(e.target.value); }}
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-border bg-background/70 py-2.5 pl-10 pr-4 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="text-[12px] font-medium text-slate-300" htmlFor="login-password">
                                    Password
                                </label>
                                <button type="button" className="text-[11px] text-indigo-400 hover:text-indigo-300 transition">
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => { clearError(); setPassword(e.target.value); }}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-border bg-background/70 py-2.5 pl-10 pr-10 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                                >
                                    {showPassword ? (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                                    </svg>
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-5 text-center text-[12px] text-slate-500">
                        Don't have an account?{' '}
                        <button onClick={onNavigateSignup} className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                            Create one
                        </button>
                    </p>
                </div>

                {/* JWT info footer */}
                <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1">
                        <svg className="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        bcrypt password hashing
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span>JWT · 60min access + 7d refresh</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span>Multi-tenant isolation</span>
                </div>
            </div>
        </div>
    );
};
