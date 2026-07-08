import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import type { Fact } from '@autoguide/core';
import { AutoGuideProvider, AutoGuideWidget, FlowStepList, ReviewBadge } from './index.js';

const sampleFacts: Fact[] = [
  {
    id: 'f1',
    entityId: 'btn-save',
    key: 'action',
    value: 'Speichern',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.6,
    provenance: [{ source: 'runtime_dom', confidence: 0.6, observedAt: '2026-01-01T00:00:00.000Z' }],
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
            steps: [
              { order: 1, title: 'Antrag öffnen', factIds: [] },
              { order: 2, title: 'Absenden', factIds: [] },
            ],
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
    expect(wrapper.text()).toContain('Antrag öffnen');
    expect(wrapper.text()).toContain('2');
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

  it('shows loading skeleton with aria-busy', async () => {
    const wrapper = mount(AutoGuideProvider, {
      props: { appId: 'demo', loading: true },
      slots: { default: () => h(AutoGuideWidget) },
    });
    await wrapper.find('[aria-label="Hilfe öffnen"]').trigger('click');
    expect(wrapper.find('[role="dialog"]').attributes('aria-busy')).toBe('true');
  });

  it('shows error state with retry', async () => {
    const onRetry = vi.fn();
    const wrapper = mount(AutoGuideProvider, {
      props: { appId: 'demo', error: 'Dokumentation konnte nicht geladen werden.', onRetry },
      slots: { default: () => h(AutoGuideWidget) },
    });
    await wrapper.find('[aria-label="Hilfe öffnen"]').trigger('click');
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    const retryBtn = wrapper.findAll('button').find((btn) => btn.text() === 'Erneut versuchen');
    await retryBtn?.trigger('click');
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('closes panel on Escape', async () => {
    const wrapper = mount(AutoGuideProvider, {
      props: { appId: 'demo' },
      slots: { default: () => h(AutoGuideWidget) },
    });
    await wrapper.find('[aria-label="Hilfe öffnen"]').trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('renders ReviewBadge in development mode', () => {
    const wrapper = mount(ReviewBadge, {
      props: { fact: sampleFacts[0]!, mode: 'development' },
    });
    expect(wrapper.text()).toContain('Prüfen');
  });

  it('renders FlowStepList with ordered steps', () => {
    const wrapper = mount(FlowStepList, {
      props: {
        flow: {
          id: 'fl1',
          title: 'Test',
          steps: [
            { order: 2, title: 'Zweiter Schritt', factIds: [] },
            { order: 1, title: 'Erster Schritt', factIds: [] },
          ],
          roleIds: [],
          pageIds: [],
          factIds: [],
          status: 'draft',
        },
      },
    });
    const text = wrapper.text();
    expect(text.indexOf('Erster')).toBeLessThan(text.indexOf('Zweiter'));
  });
});
