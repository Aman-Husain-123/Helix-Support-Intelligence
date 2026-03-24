import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    sub: string; // email
    role: string;
    tenant_id: string;
}

export function useUser(requiredRole?: string) {
    const defaultRedirect = requiredRole ? `/login/${requiredRole}` : '/login/customer';

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            router.push(defaultRedirect);
            setLoading(false);
            return;
        }

        try {
            const payloadBase64 = token.split('.')[1];
            const payload: User = JSON.parse(atob(payloadBase64));

            // Role-based routing validation
            if (requiredRole) {
                if (payload.role !== requiredRole) {
                    // CRITICAL: Prevent role leakage. If hit wrong dashboard, redirect home based on role.
                    if (payload.role === 'admin') router.push('/admin');
                    else if (payload.role === 'agent') router.push('/agent');
                    else router.push('/customer');
                    return;
                }
            }

            // If we're here, either no role was required or role matches.
            setUser(payload);
        } catch (e) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            router.push(defaultRedirect);
        }

        setLoading(false);
    }, [requiredRole, defaultRedirect, router]);

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push(defaultRedirect);
    };

    return { user, loading, logout };
}
