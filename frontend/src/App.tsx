import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <main className="container mx-auto p-8">
            <h1 className="text-4xl font-bold">licitAI</h1>
            <p className="mt-4 text-muted-foreground">
              Plataforma de Geração Inteligente de Documentos Licitatórios
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Fase 1 completa. Fase 2 (Infraestrutura Foundational) iniciará em breve.
            </p>
          </main>
        </div>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
