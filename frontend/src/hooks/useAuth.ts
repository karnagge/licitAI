/**
 * Re-export useAuth hook from AuthContext
 * Must be used within AuthProvider
 *
 * @returns Authentication context with user, login, logout, register functions
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={() => login(email, password)}>Login</button>;
 *   }
 *
 *   return <div>Welcome {user?.fullName}</div>;
 * }
 * ```
 */
export { useAuth } from '../contexts/AuthContext';
