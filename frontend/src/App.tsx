import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { queryClient } from './services/queryClient';

// Placeholder pages (will be implemented in Phase 3)
function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8">Login - licitAI</h1>
        <p className="text-center text-gray-600">
          Página de login será implementada na Phase 3
        </p>
      </div>
    </div>
  );
}

function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8">Registro - licitAI</h1>
        <p className="text-center text-gray-600">
          Página de registro será implementada na Phase 3
        </p>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-gray-600">
        Dashboard será implementado na Phase 3 - User Story 1
      </p>
    </div>
  );
}

/**
 * Main App Component
 * Configures routing, authentication, and query client
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<DashboardPage />} />
              <Route path="/templates" element={<DashboardPage />} />
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 - Redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
