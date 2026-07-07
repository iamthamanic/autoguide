/**
 * Vue 3 example — mirrors @autoguide/example-react-vite for adapter parity checks.
 */

import { createApp, defineComponent, h, ref } from 'vue';
import {
  AutoGuideProvider,
  AutoGuideWidget,
  InspectorOverlay,
} from '@autoguide/vue';

const App = defineComponent({
  name: 'App',
  setup() {
    const page = ref<'home' | 'settings'>('home');
    return () =>
      h('main', { style: { fontFamily: 'system-ui, sans-serif', padding: '24px' } }, [
        h('h1', 'AutoGuide Vue Beispiel-App'),
        h('nav', { style: { display: 'flex', gap: '8px', marginBottom: '16px' } }, [
          h('button', { type: 'button', onClick: () => (page.value = 'home') }, 'Start'),
          h(
            'button',
            { type: 'button', onClick: () => (page.value = 'settings') },
            'Einstellungen',
          ),
        ]),
        page.value === 'home'
          ? h('section', [
              h('p', 'Willkommen in der Vue-Referenz-App für AutoGuide.'),
              h('button', { type: 'button' }, 'Aktion speichern'),
            ])
          : h('section', [h('p', 'Einstellungen — zweite Route für Kontext-Tests.')]),
      ]);
  },
});

createApp({
  render: () =>
    h(
      AutoGuideProvider,
      { appId: 'example-vue-vite', userRole: 'Admin' },
      {
        default: () => [h(App), h(AutoGuideWidget), h(InspectorOverlay)],
      },
    ),
}).mount('#app');
