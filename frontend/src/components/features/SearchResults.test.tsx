import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, userEvent, mockSearchResult } from '../../test/test-utils';
import { SearchResults } from './SearchResults';

describe('SearchResults', () => {
  const documentResult = {
    ...mockSearchResult,
    type: 'document' as const,
    title: 'Edital 001/2024',
  };

  const messageResult = {
    ...mockSearchResult,
    id: 'msg-123',
    type: 'message' as const,
    title: undefined,
    content: 'Como gerar um edital de licitação?',
  };

  it('should render loading state', () => {
    renderWithProviders(
      <SearchResults results={[]} query="test" isLoading={true} />,
    );

    expect(screen.getByText(/buscando/i)).toBeInTheDocument();
  });

  it('should render empty state when no results', () => {
    renderWithProviders(<SearchResults results={[]} query="test query" />);

    expect(screen.getByText(/nenhum resultado encontrado/i)).toBeInTheDocument();
    expect(screen.getByText(/test query/i)).toBeInTheDocument();
  });

  it('should render search results', () => {
    renderWithProviders(
      <SearchResults results={[documentResult]} query="pregão" />,
    );

    expect(screen.getByText('Edital 001/2024')).toBeInTheDocument();
    expect(screen.getByText(/1 resultado encontrado/i)).toBeInTheDocument();
  });

  it('should render multiple results grouped by type', () => {
    renderWithProviders(
      <SearchResults
        results={[documentResult, messageResult]}
        query="licitação"
      />,
    );

    expect(screen.getByText(/documentos \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/conversas \(1\)/i)).toBeInTheDocument();
  });

  it('should highlight search query in content', () => {
    renderWithProviders(
      <SearchResults results={[documentResult]} query="pregão" />,
    );

    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
  });

  it('should display similarity score', () => {
    renderWithProviders(
      <SearchResults results={[documentResult]} query="test" />,
    );

    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText(/relevante/i)).toBeInTheDocument();
  });

  it('should call onResultClick when result is clicked', async () => {
    const onResultClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <SearchResults
        results={[documentResult]}
        query="test"
        onResultClick={onResultClick}
      />,
    );

    const resultButton = screen.getByRole('button');
    await user.click(resultButton);

    expect(onResultClick).toHaveBeenCalledWith(documentResult);
  });

  it('should show correct result count', () => {
    const results = [documentResult, messageResult];

    renderWithProviders(<SearchResults results={results} query="test" />);

    expect(screen.getByText(/2 resultados encontrados/i)).toBeInTheDocument();
  });

  it('should display document type badge', () => {
    renderWithProviders(
      <SearchResults results={[documentResult]} query="test" />,
    );

    expect(screen.getByText('Documento')).toBeInTheDocument();
  });

  it('should display message type badge', () => {
    renderWithProviders(
      <SearchResults results={[messageResult]} query="test" />,
    );

    expect(screen.getByText('Conversa')).toBeInTheDocument();
  });

  it('should truncate long content snippets', () => {
    const longContentResult = {
      ...documentResult,
      content: 'A'.repeat(300),
    };

    renderWithProviders(
      <SearchResults results={[longContentResult]} query="test" />,
    );

    const content = screen.getByText(/A+\.\.\./);
    expect(content.textContent?.length).toBeLessThanOrEqual(210); // 200 chars + "..."
  });

  it('should display project name when available', () => {
    renderWithProviders(
      <SearchResults results={[documentResult]} query="test" />,
    );

    expect(screen.getByText(documentResult.projectName!)).toBeInTheDocument();
  });

  it('should display metadata (author and date)', () => {
    renderWithProviders(
      <SearchResults results={[documentResult]} query="test" />,
    );

    expect(screen.getByText(/João Silva/i)).toBeInTheDocument();
    expect(screen.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument(); // Date format
  });
});
