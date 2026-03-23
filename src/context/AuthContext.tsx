import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Role = 'customer' | 'agent' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    tenantId: string;       // multi-tenant isolation — all queries scoped to this
    avatarInitials: string;
    avatarColor: string;
}

export interface TokenData {
    accessToken: string;    // expires in 60 min
    refreshToken: string;   // expires in 7 days
    expiresAt: number;      // ms timestamp
}

interface AuthState {
    user: User | null;
    token: TokenData | null;
    isLoading: boolean;
    error: string | null;
}

interface AuthContextValue extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    requireRole: (roles: Role[]) => boolean;
}

export interface SignupData {
    name: string;
    email: string;
    password: string;
    role: Role;
    tenantName: string;
}

// ── Mock user database (simulates backend) ────────────────────────────────────
// In production: passwords are hashed with bcrypt server-side; frontend never
// handles raw hashes.  JWT is issued by FastAPI and validated per request via
// require_role() dependency.

const MOCK_USERS: (User & { password: string })[] = [
    {
        id: 'u1', name: 'Alex Rivera', email: 'agent@helix.io', password: 'agent123',
        role: 'agent', tenantId: 'tenant_acme',
        avatarInitials: 'AR', avatarColor: 'from-indigo-500 to-sky-400',
    },
    {
        id: 'u2', name: 'Jordan Matthews', email: 'customer@example.com', password: 'customer123',
        role: 'customer', tenantId: 'tenant_acme',
        avatarInitials: 'JM', avatarColor: 'from-indigo-500 to-violet-600',
    },
    {
        id: 'u3', name: 'Aria Shah', email: 'admin@helix.io', password: 'admin123',
        role: 'admin', tenantId: 'tenant_acme',
        avatarInitials: 'AS', avatarColor: 'from-rose-500 to-pink-600',
    },
];

// ── JWT simulation ─────────────────────────────────────────────────────────────
// Real implementation: backend issues signed JWTs, frontend stores + sends them.
// Payload includes: sub (user id), role, tenant_id, exp.

const ACCESS_TOKEN_TTL = 60 * 60 * 1000;          // 60 minutes
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

function simulateJWT(user: User): TokenData {
    const now = Date.now();
    const accessPayload = { sub: user.id, role: user.role, tenant_id: user.tenantId, exp: now + ACCESS_TOKEN_TTL };
    const refreshPayload = { sub: user.id, exp: now + REFRESH_TOKEN_TTL };
    return {
        accessToken: `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(accessPayload))}`,
        refreshToken: `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(refreshPayload))}`,
        expiresAt: now + ACCESS_TOKEN_TTL,
    };
}

function decodeToken(token: string): Record<string, unknown> | null {
    try {
        const [, payload] = token.split('.');
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

// ── Slug helpers ───────────────────────────────────────────────────────────────

function toTenantId(name: string): string {
    return 'tenant_' + name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function initials(name: string): string {
    return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
    'from-indigo-500 to-sky-400',
    'from-violet-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-rose-500 to-pink-600',
    'from-sky-500 to-blue-600',
];

function pickColor(email: string): string {
    const idx = email.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

// ── Storage keys ───────────────────────────────────────────────────────────────

const LS_USER = 'helix_user';
const LS_TOKEN = 'helix_token';

// ── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
        error: null,
    });

    // Rehydrate from localStorage on mount
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem(LS_USER);
            const savedToken = localStorage.getItem(LS_TOKEN);
            if (savedUser && savedToken) {
                const user: User = JSON.parse(savedUser);
                const token: TokenData = JSON.parse(savedToken);
                const decoded = decodeToken(token.accessToken);
                // Refresh token still valid (7 days) — auto-reissue access token
                const refreshDecoded = decodeToken(token.refreshToken);
                if (refreshDecoded && (refreshDecoded.exp as number) > Date.now()) {
                    const freshToken = simulateJWT(user);
                    localStorage.setItem(LS_TOKEN, JSON.stringify(freshToken));
                    setState({ user, token: freshToken, isLoading: false, error: null });
                } else {
                    // Both expired — log out
                    localStorage.removeItem(LS_USER);
                    localStorage.removeItem(LS_TOKEN);
                    setState({ user: null, token: null, isLoading: false, error: null });
                }
                void decoded; // used for validation in real impl
            } else {
                setState((p) => ({ ...p, isLoading: false }));
            }
        } catch {
            setState((p) => ({ ...p, isLoading: false }));
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setState((p) => ({ ...p, isLoading: true, error: null }));
        // Simulate network latency
        await new Promise((r) => setTimeout(r, 900));

        const found = MOCK_USERS.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!found) {
            setState((p) => ({ ...p, isLoading: false, error: 'Invalid email or password.' }));
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...user } = found;
        const token = simulateJWT(user);
        localStorage.setItem(LS_USER, JSON.stringify(user));
        localStorage.setItem(LS_TOKEN, JSON.stringify(token));
        setState({ user, token, isLoading: false, error: null });
    }, []);

    const signup = useCallback(async (data: SignupData) => {
        setState((p) => ({ ...p, isLoading: true, error: null }));
        await new Promise((r) => setTimeout(r, 1000));

        const exists = MOCK_USERS.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
        if (exists) {
            setState((p) => ({ ...p, isLoading: false, error: 'An account with that email already exists.' }));
            return;
        }
        const user: User = {
            id: `u${Date.now()}`,
            name: data.name,
            email: data.email,
            role: data.role,
            tenantId: toTenantId(data.tenantName),
            avatarInitials: initials(data.name),
            avatarColor: pickColor(data.email),
        };
        MOCK_USERS.push({ ...user, password: data.password });
        const token = simulateJWT(user);
        localStorage.setItem(LS_USER, JSON.stringify(user));
        localStorage.setItem(LS_TOKEN, JSON.stringify(token));
        setState({ user, token, isLoading: false, error: null });
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(LS_USER);
        localStorage.removeItem(LS_TOKEN);
        setState({ user: null, token: null, isLoading: false, error: null });
    }, []);

    const clearError = useCallback(() => {
        setState((p) => ({ ...p, error: null }));
    }, []);

    /**
     * requireRole — frontend equivalent of FastAPI's require_role() dependency.
     * Returns true if the current user has one of the allowed roles.
     */
    const requireRole = useCallback(
        (roles: Role[]): boolean => {
            if (!state.user) return false;
            return roles.includes(state.user.role);
        },
        [state.user]
    );

    return (
        <AuthContext.Provider value={{ ...state, login, signup, logout, clearError, requireRole }}>
            {children}
        </AuthContext.Provider>
    );
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Primary hook — equivalent to useUser() in the spec */
export function useUser(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useUser must be used inside <AuthProvider>');
    return ctx;
}
