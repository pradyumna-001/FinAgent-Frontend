import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { useIsAuthenticated } from '@/stores/authStore';

export function LoginPage() {
    const isAuthenticated = useIsAuthenticated();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get('returnTo') ?? '/';

    if (isAuthenticated) {
        return <Navigate to={returnTo} replace />;
    }

    return (
        <div>
            <h1>Sign in</h1>
            <LoginForm onSuccess={() => navigate(returnTo, { replace: true })} />
        </div>
    );
}