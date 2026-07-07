import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AutoGuideProvider, AutoGuideWidget } from './index.js';

describe('@autoguide/react', () => {
  it('renders widget without throwing when docs are missing', () => {
    render(
      <AutoGuideProvider appId="demo">
        <AutoGuideWidget />
      </AutoGuideProvider>,
    );
    expect(screen.getByLabelText('Hilfe öffnen')).toBeTruthy();
  });
});
