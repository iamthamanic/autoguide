import { describe, expect, it, vi } from 'vitest';
import { scanDom } from './scanner.js';
import { createSnapshotRecorder, observeRouteChanges } from './route-observer.js';

describe('@iamthamanic/autoguide-runtime', () => {
  it('detects interactive elements with accessible names', () => {
    document.body.innerHTML = `
      <button data-testid="save">Speichern</button>
      <a href="/settings">Einstellungen</a>
    `;
    const snapshot = scanDom(document, '/');
    expect(snapshot.elements.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.elements[0]?.label).toBe('Speichern');
    expect(snapshot.elements[0]?.entityId).toContain('runtime:');
  });

  it('redacts PII from runtime labels and text regions', () => {
    document.body.innerHTML = `
      <button>Mail an support@example.com</button>
      <p>Telefon +49 30 12345678</p>
    `;
    const snapshot = scanDom(document, '/');
    const labels = snapshot.elements.map((element) => element.label).join(' ');
    const text = snapshot.textRegions.map((region) => region.text).join(' ');
    expect(labels).not.toContain('support@example.com');
    expect(text).not.toContain('12345678');
  });

  it('captures forms, dialogs, disabled state, and text regions', () => {
    document.body.innerHTML = `
      <main>
        <h1>Dashboard</h1>
        <form id="profile-form">
          <label for="name">Name</label>
          <input id="name" name="name" required />
          <button type="submit" disabled>Speichern</button>
        </form>
        <div role="dialog" aria-modal="true" aria-label="Bestätigen">Wirklich löschen?</div>
      </main>
    `;
    const snapshot = scanDom(document, '/dashboard');
    expect(snapshot.forms.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.forms[0]?.label).toBe('Name');
    expect(snapshot.dialogs.length).toBe(1);
    expect(snapshot.dialogs[0]?.open).toBe(true);
    expect(snapshot.textRegions.some((region) => region.text.includes('Dashboard'))).toBe(true);
    const submit = snapshot.elements.find((element) => element.label === 'Speichern');
    expect(submit?.disabled).toBe(true);
  });

  it('records navigation history on route change', () => {
    document.body.innerHTML = '<main>Start</main>';
    let route = '/start';
    const getRoute = () => route;

    const recorder = createSnapshotRecorder(document, getRoute, { pollMs: 20 });
    expect(recorder.getSnapshot().route).toBe('/start');

    route = '/next';
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const snapshot = recorder.getSnapshot();
        expect(snapshot.route).toBe('/next');
        expect(snapshot.navigation.some((event) => event.route === '/next')).toBe(true);
        recorder.stop();
        resolve();
      }, 50);
    });
  });

  it('observeRouteChanges invokes callback on route update', () => {
    let route = '/a';
    const onChange = vi.fn();
    const stop = observeRouteChanges(() => route, onChange, { pollMs: 15 });
    route = '/b';
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(onChange).toHaveBeenCalledWith('/b');
        stop();
        resolve();
      }, 40);
    });
  });
});
