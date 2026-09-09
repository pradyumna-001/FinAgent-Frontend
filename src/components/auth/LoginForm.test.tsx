import { render, screen, waitFor }  from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { LoginForm } from './LoginForm';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/api/auth', () => ({
    login: vi.fn(),
    getMe: vi.fn()
}));

import { login as apiLogin } from '@/api/auth';

beforeEach(() => {
    sessionStorage.clear();
    useAuthStore.setState({ accessToken: null, manager: null, isLoading: false });
    vi.clearAllMocks();
})


describe('LoginForm', () => {

    it('renders email and password fields and a submit button', () => {
        render(<LoginForm />);
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    
    it('shows validation errors when submitting an empty form', async () => {
        const user = userEvent.setup();
        render(<LoginForm />);
        await user.click(screen.getByRole('button', { name: /sign in/i }));
        expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
        expect(apiLogin).not.toHaveBeenCalled();
    });


    it('calls login with email and password on success', async () => {
        const user = userEvent.setup();
        (apiLogin as ReturnType<typeof vi.fn>).mockResolvedValue({
            access_token: 'tok',
            manager: { id: 1, name: 'P', email: 'a@b.co' },
        });
        render(<LoginForm />);
        await user.type(screen.getByLabelText(/email/i), 'a@b.co');
        await user.type(screen.getByLabelText(/password/i), 'secret');
        await user.click(screen.getByRole('button', { name: /sign in/i }));
        expect(apiLogin).toHaveBeenCalledWith('a@b.co', 'secret');
        await waitFor(() =>
            expect(useAuthStore.getState().accessToken).toBe('tok')
        );
    });


    it('on login failure, does not crash and keeps the same state', async () => {
        const user = userEvent.setup();
        (apiLogin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('bad creds'));
        render(<LoginForm />);
        await user.type(screen.getByLabelText(/email/i), 'a@b.co');
        await user.type(screen.getByLabelText(/password/i), 'wrong');
        await user.click(screen.getByRole('button', { name: /sign in/i }));
        await waitFor(() => expect(apiLogin).toHaveBeenCalled());
        expect(useAuthStore.getState().accessToken).toBeNull();
    });


})