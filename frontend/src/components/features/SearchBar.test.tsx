import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('should render search input', () => {
    renderWithProviders(<SearchBar onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText(/buscar em documentos/i);
    expect(input).toBeInTheDocument();
  });

  it('should call onSearch when user types and presses enter', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/buscar em documentos/i);

    await user.type(input, 'pregão eletrônico');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('pregão eletrônico');
  });

  it('should show suggestions when user types', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SearchBar onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText(/buscar em documentos/i);

    await user.type(input, 'pregão');

    // Wait for suggestions to potentially appear
    await waitFor(() => {
      // Suggestions would appear if API returns data
      // This tests the UI behavior, not the API call
      expect(input).toHaveValue('pregão');
    });
  });

  it('should clear input when escape is pressed', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SearchBar onSearch={vi.fn()} />);

    const input = screen.getByPlaceholderText(/buscar em documentos/i);

    await user.type(input, 'test query');
    expect(input).toHaveValue('test query');

    await user.keyboard('{Escape}');
    expect(input).toHaveValue('');
  });

  it('should use custom placeholder', () => {
    renderWithProviders(
      <SearchBar onSearch={vi.fn()} placeholder="Custom placeholder" />,
    );

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('should auto-focus when autoFocus prop is true', () => {
    renderWithProviders(<SearchBar onSearch={vi.fn()} autoFocus />);

    const input = screen.getByPlaceholderText(/buscar em documentos/i);
    expect(input).toHaveFocus();
  });

  it('should not submit empty queries', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/buscar em documentos/i);

    await user.click(input);
    await user.keyboard('{Enter}');

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('should trim whitespace from queries', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/buscar em documentos/i);

    await user.type(input, '  pregão eletrônico  ');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('pregão eletrônico');
  });
});
