import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    sub: string; // email
    role: string;
    tenant_id: string;
}

export function useUser(requiredRole?: string, redirectUrl: string = '/login') {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            if (requiredRole) router.push(redirectUrl);
            setLoading(false);
            return;
        }

        try {
            const payloadBase64 = token.split('.')[1];
            const payload: User = JSON.parse(atob(payloadBase64));

            // Role-based routing validation
            if (requiredRole && payload.role !== requiredRole) {
                // Auto-redirect to correct dashboard based on actual role
                if (payload.role === 'admin') router.push('/admin');
                else if (payload.role === 'agent') router.push('/agent');
                else router.push('/');
            } else {
                setUser(payload);
            }
        } catch (e) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            if (requiredRole) router.push(redirectUrl);
        }

        setLoading(false);
    }, [requiredRole, redirectUrl, router]);

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push('/login');
    };

    return { user, loading, logout };
}
