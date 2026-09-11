import { Component, type ErrorInfo, type ReactNode } from 'react';
import { log } from '@/services/errorService';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        log(error, info.componentStack ?? undefined);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div role='alert'>
                    <p>Something went wrong</p>
                    <button type='button' onClick={() => window.location.reload()}>
                        Refresh Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
