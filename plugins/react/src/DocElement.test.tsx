import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AutoGuideProvider } from './AutoGuideProvider.js';
import { DocElement } from './DocElement.js';
import { useAutoGuide } from './context.js';

function DocElementProbe() {
  const { docElements } = useAutoGuide();
  return <span data-testid="doc-count">{docElements.length}</span>;
}

describe('DocElement', () => {
  it('sets data-doc-* on the child element', () => {
    render(
      <AutoGuideProvider appId="demo">
        <DocElement id="action.save" title="Speichern" description="Speichert Daten">
          <button type="button">Speichern</button>
        </DocElement>
      </AutoGuideProvider>,
    );

    const button = screen.getByRole('button', { name: 'Speichern' });
    expect(button.getAttribute('data-doc-id')).toBe('action.save');
    expect(button.getAttribute('data-doc-title')).toBe('Speichern');
    expect(button.getAttribute('data-doc-description')).toBe('Speichert Daten');
  });

  it('registers metadata with the provider', async () => {
    render(
      <AutoGuideProvider appId="demo">
        <DocElement id="action.save" title="Speichern" roles={['Admin']}>
          <button type="button">Speichern</button>
        </DocElement>
        <DocElementProbe />
      </AutoGuideProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('doc-count').textContent).toBe('1');
    });
  });
});
