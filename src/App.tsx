import { useAuth } from './providers/useAuth';
import { useTheme } from './providers/useTheme';

export default function App() {
  const { accessToken } = useAuth();
  const { resolvedTheme } = useTheme();
  const isAuthenticated = accessToken !== null;

  return (
    <main>
      <h1>FinAgent</h1>
      <p>Authenticated: {String(isAuthenticated)}</p>
      <p>Theme: {resolvedTheme}</p>
    </main>
  );
}
