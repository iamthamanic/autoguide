/**
 * @iamthamanic/autoguide-react — AutoGuide drop-in component tests.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AutoGuide } from './AutoGuide.js';

vi.mock('@iamthamanic/autoguide-client', () => ({
  loadArtifactBundle: vi.fn(async () => ({
    baseUrl: '/autoguide',
    facts: [],
    pages: [
      {
        id: 'p1',
        route: '/home',
        title: 'Start',
        roleIds: [],
        elementIds: [],
        featureIds: [],
        flowIds: [],
        factIds: [],
        status: 'published',
      },
    ],
    flows: [],
    tours: [],
    reviews: [],
    reviewHistory: [],
    recommendations: [],
  })),
}));

describe('AutoGuide root component', () => {
  it('loads bundle and renders help widget', async () => {
    render(<AutoGuide appId="demo-app" bundleBase="/autoguide" />);
    await waitFor(() => {
      expect(screen.getByLabelText('Hilfe öffnen')).toBeTruthy();
    });
  });

  it('shows tour button after bundle load when tours feature is enabled', async () => {
    const { loadArtifactBundle } = await import('@iamthamanic/autoguide-client');
    vi.mocked(loadArtifactBundle).mockResolvedValueOnce({
      baseUrl: '/autoguide',
      facts: [],
      pages: [],
      flows: [],
      tours: [
        {
          id: 'tour-1',
          title: 'Demo Tour',
          description: 'Test',
          roleIds: [],
          status: 'published',
          steps: [{ id: 's1', title: 'Step', body: 'Body', action: 'observe' }],
        },
      ],
      reviews: [],
      reviewHistory: [],
      recommendations: [],
    });

    render(
      <AutoGuide
        appId="demo-app"
        mode="development"
        features={{ widget: true, inspector: true, tours: true }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Tour starten: Demo Tour')).toBeTruthy();
    });
  });

  it('shows German error when load fails', async () => {
    const { loadArtifactBundle } = await import('@iamthamanic/autoguide-client');
    vi.mocked(loadArtifactBundle).mockRejectedValueOnce(new Error('Netzwerkfehler'));

    render(<AutoGuide appId="demo-app" />);
    await waitFor(() => {
      expect(screen.getByLabelText('Hilfe öffnen')).toBeTruthy();
    });
    fireEvent.click(screen.getByLabelText('Hilfe öffnen'));
    await waitFor(() => {
      expect(screen.getByText(/Netzwerkfehler/)).toBeTruthy();
    });
  });
});
