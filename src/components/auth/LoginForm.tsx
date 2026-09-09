import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/schemas/login'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore';
import axios from 'axios';

export function LoginForm() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });
    const login = useAuthStore((state) => state.login);
    const addToast = useUIStore((state) => state.addToast);

    const onSubmit = handleSubmit(async (values) => {
        try {
            await login(values.email, values.password);
        } catch (error) {
            const message =
                axios.isAxiosError(error) && error.response?.data?.message
                    ? error.response.data.message
                    : 'Sign in failed';
            addToast('error', message);
        }
    });

    return (
        <form onSubmit={onSubmit} noValidate>
            <div>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" {...register('email')} disabled={isSubmitting} />
                {errors.email && <p role="alert">{errors.email.message}</p>}
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" {...register('password')} disabled={isSubmitting} />
                {errors.password && <p role="alert">{errors.password.message}</p>}
            </div>
            <button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
        </form>
    );
}