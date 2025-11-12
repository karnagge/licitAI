import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Test Utilities
 *
 * Provides helpers for testing React components with necessary providers.
 */

// Create a new QueryClient for each test
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllProvidersProps {
  children: React.ReactNode;
}

// Wrapper with all necessary providers
export function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Mock data factories
export const mockProject = {
  id: 'project-123',
  name: 'Pregão Eletrônico 001/2024',
  description: 'Aquisição de equipamentos de TI',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: {
    id: 'user-123',
    fullName: 'João Silva',
    email: 'joao@example.com',
  },
};

export const mockDocument = {
  id: 'doc-123',
  title: 'Edital 001/2024',
  projectId: 'project-123',
  currentVersion: 1,
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockSearchResult = {
  id: 'result-123',
  type: 'document' as const,
  title: 'Edital 001/2024',
  content: 'Pregão eletrônico para aquisição...',
  projectId: 'project-123',
  projectName: 'Pregão 001/2024',
  similarity: 0.85,
  createdAt: new Date().toISOString(),
  createdBy: 'João Silva',
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
