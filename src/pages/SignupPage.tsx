import React, { useState } from 'react';
import { useUser, type Role } from '../context/AuthContext';

interface SignupPageProps {
    onNavigateLogin: () => void;
}

const ROLES: { value: Role; label: string; desc: string; icon: string; color: string }[] = [
    {
        value: 'customer',
        label: 'Customer',
        desc: 'Chat with AI, create & view tickets, browse help center',
        icon: '💬',
        color: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
    },
    {
        value: 'agent',
        label: 'Agent',
        desc: 'Manage assigned tickets, use AI copilot, handle escalations',
        icon: '🎧',
        color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
    },
    {
        value: 'admin',
        label: 'Admin',
        desc: 'Manage agents, configure AI, upload knowledge base, view analytics',
        icon: '⚙️',
        color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    },
];

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigateLogin }) => {
    const { signup, isLoading, error, clearError } = useUser();
    const [step, setStep] = useState<1 | 2>(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<Role>('agent');
    const [tenantName, setTenantName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setLocalError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setLocalError('Password must be at least 8 characters.');
            return;
        }
        setLocalError('');
        clearError();
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantName.trim()) {
            setLocalError('Company / workspace name is required.');
            return;
        }
        setLocalError('');
        await signup({ name, email, password, role, tenantName });
    };

    const displayError = localError || error;

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background bg-grid-pattern overflow-hidden">
            {/* Glow blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
                <div className="absolute bottom-0 right-1/3 h-60 w-60 rounded-full bg-indigo-500/8 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md px-4 animate-slide-up">
                {/* Logo */}
                <div className="mb-7 flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30 animate-glow">
                        <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6 text-white">
                            <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M3 6l7 4 7-4M10 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Create your account</h1>
                        <p className="mt-1 text-sm text-slate-400">Join Helix Support Intelligence</p>
                    </div>
                </div>

                {/* Step indicator */}
                <div className="mb-5 flex items-center gap-2 px-2">
                    {[1, 2].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${step === s
                                    ? 'bg-indigo-500 text-white'
                                    : step > s
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-800 text-slate-500'
                                }`}>
                                {step > s ? '✓' : s}
                            </div>
                            <span className={`text-[11px] font-medium ${step === s ? 'text-slate-200' : step > s ? 'text-emerald-400' : 'text-slate-600'}`}>
                                {s === 1 ? 'Personal info' : 'Role & workspace'}
                            </span>
                            {s < 2 && <div className={`flex-1 h-px ${step > 1 ? 'bg-emerald-500/40' : 'bg-border'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border bg-surface/80 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl">

                    {/* Error */}
                    {displayError && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 animate-fade-in">
                            <svg className="h-4 w-4 flex-shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[12px] text-rose-300">{displayError}</span>
                        </div>
                    )}

                    {/* ── Step 1: Personal info ── */}
                    {step === 1 && (
                        <form onSubmit={handleStep1} className="space-y-4 animate-fade-in">
                            <div>
                                <label className="mb-1.5 block text-[12px] font-medium text-slate-300" htmlFor="signup-name">Full name</label>
                                <input id="signup-name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder="Alex Rivera"
                                    className="w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[12px] font-medium text-slate-300" htmlFor="signup-email">Email address</label>
                                <input id="signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[12px] font-medium text-slate-300" htmlFor="signup-pass">Password</label>
                                <div className="relative">
                                    <input id="signup-pass" type={showPassword ? 'text' : 'password'} required minLength={8}
                                        value={password} onChange={(e) => { setLocalError(''); setPassword(e.target.value); }}
                                        placeholder="Min 8 characters"
                                        className="w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 pr-10 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition" />
                                    <button type="button" onClick={() => setShowPassword((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[12px] font-medium text-slate-300" htmlFor="signup-confirm">Confirm password</label>
                                <input id="signup-confirm" type="password" required value={confirmPassword}
                                    onChange={(e) => { setLocalError(''); setConfirmPassword(e.target.value); }}
                                    placeholder="Repeat your password"
                                    className="w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition" />
                            </div>
                            <button type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-indigo-500">
                                Continue →
                            </button>
                        </form>
                    )}

                    {/* ── Step 2: Role & workspace ── */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                            <div>
                                <p className="mb-2 text-[12px] font-semibold text-slate-300">Select your role</p>
                                <div className="space-y-2">
                                    {ROLES.map((r) => (
                                        <label key={r.value}
                                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${role === r.value ? r.color : 'border-border bg-background/40 hover:border-slate-600'
                                                }`}
                                        >
                                            <input type="radio" name="role" value={r.value} checked={role === r.value}
                                                onChange={() => setRole(r.value)} className="sr-only" />
                                            <span className="text-xl leading-none mt-0.5">{r.icon}</span>
                                            <div>
                                                <p className="text-[12px] font-semibold text-slate-200">{r.label}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{r.desc}</p>
                                            </div>
                                            {role === r.value && (
                                                <svg className="ml-auto h-4 w-4 flex-shrink-0 text-indigo-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-[12px] font-medium text-slate-300" htmlFor="signup-tenant">
                                    Company / Workspace name
                                </label>
                                <input id="signup-tenant" type="text" required value={tenantName}
                                    onChange={(e) => { setLocalError(''); setTenantName(e.target.value); }}
                                    placeholder="Acme Inc."
                                    className="w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition" />
                                <p className="mt-1 text-[10px] font-mono text-slate-600">
                                    {tenantName ? `tenant_id: tenant_${tenantName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}` : 'All your data is scoped to this tenant'}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button type="button" onClick={() => { setStep(1); setLocalError(''); clearError(); }}
                                    className="flex-1 rounded-xl border border-border bg-surface py-2.5 text-[13px] font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100">
                                    ← Back
                                </button>
                                <button type="submit" disabled={isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-60">
                                    {isLoading ? (
                                        <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" /></svg>Creating…</>
                                    ) : 'Create account'}
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="mt-5 text-center text-[12px] text-slate-500">
                        Already have an account?{' '}
                        <button onClick={onNavigateLogin} className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
