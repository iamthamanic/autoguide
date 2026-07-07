import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { Fact } from '@autoguide/core';
import { AutoGuideProvider, AutoGuideWidget } from './index.js';

const sampleFacts: Fact[] = [
  {
    id: 'f1',
    entityId: 'btn-save',
    key: 'action',
    value: 'Speichern',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.6,
    provenance: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'f2',
    entityId: 'btn-export',
    key: 'action',
    value: 'Exportieren',
    status: 'verified',
    reviewStatus: 'approved',
    confidence: 0.92,
    provenance: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('@autoguide/vue', () => {
  it('renders widget without throwing when docs are missing', () => {
    const wrapper = mount(AutoGuideProvider, {
      props: { appId: 'demo' },
      slots: { default: () => h(AutoGuideWidget) },
    });
    expect(wrapper.find('[aria-label="Hilfe öffnen"]').exists()).toBe(true);
  });

  it('resolves route context in help panel title', async () => {
    const wrapper = mount(AutoGuideProvider, {
      props: {
        appId: 'demo',
        route: '/vacation',
        pages: [
          {
            id: 'p1',
            route: '/vacation',
            title: 'Urlaub',
            roleIds: [],
            elementIds: [],
            featureIds: [],
            flowIds: [],
            factIds: [],
            status: 'draft',
          },
        ],
        flows: [
          {
            id: 'fl1',
            title: 'Urlaub beantragen',
            steps: [{ order: 1, title: 'Antrag öffnen', factIds: [] }],
            roleIds: [],
            pageIds: ['p1'],
            factIds: [],
            status: 'draft',
          },
        ],
      },
      slots: { default: () => h(AutoGuideWidget) },
    });
    await wrapper.find('[aria-label="Hilfe öffnen"]').trigger('click');
    expect(wrapper.text()).toContain('Hilfe: Urlaub');
    expect(wrapper.text()).toContain('Urlaub beantragen');
  });

  it('shows uncertain facts only in published mode', async () => {
    const wrapper = mount(AutoGuideProvider, {
      props: { appId: 'demo', mode: 'published', facts: sampleFacts },
      slots: { default: () => h(AutoGuideWidget) },
    });
    await wrapper.find('[aria-label="Hilfe öffnen"]').trigger('click');
    expect(wrapper.text()).toContain('Exportieren');
    expect(wrapper.text()).not.toContain('Speichern');
  });
});
