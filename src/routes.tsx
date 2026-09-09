import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireGuest } from '@/components/auth/RequireGuest';
import { LoginPage } from '@/pages/LoginPage';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <RequireGuest />,
        children: [{ index: true, element: <LoginPage /> }],
    },
    {
        path: '/',
        element: <RequireAuth />,
        children: [
            { index: true, element: <div>Dashboard</div> },
        ],
    },
]);