/**
 * @iamthamanic/autoguide-react — track SPA pathname for Help context.
 */

import { useEffect, useState } from 'react';

function readPathname(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname;
}

export function useSpaRoute(initialRoute?: string): string {
  const [route, setRoute] = useState(initialRoute ?? readPathname);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sync = () => {
      const next = readPathname();
      setRoute((prev) => (prev !== next ? next : prev));
    };

    const { pushState, replaceState } = history;
    history.pushState = function (...args) {
      pushState.apply(history, args as Parameters<History['pushState']>);
      sync();
    };
    history.replaceState = function (...args) {
      replaceState.apply(history, args as Parameters<History['replaceState']>);
      sync();
    };

    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);

    return () => {
      history.pushState = pushState;
      history.replaceState = replaceState;
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  return route;
}
