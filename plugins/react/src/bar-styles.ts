/**
 * @iamthamanic/autoguide-react — slim dock layout + motion styles.
 */

import type { CSSProperties } from 'react';

export const AG_BAR_BOTTOM = 14;
/** Total dock height: brand row + action buttons with labels (px). */
export const AG_DOCK_HEIGHT = 52;
export const AG_BAR_GAP = 10;

/** Dock distance from viewport bottom (default gap + optional host bottom-nav offset). */
export function resolveDockBottom(bottomOffset = 0): number {
  const offset = Number.isFinite(bottomOffset) ? Math.max(0, bottomOffset) : 0;
  return AG_BAR_BOTTOM + offset;
}

const AG_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const AG_DOCK_STYLES = `
.ag-dock {
  font-family: var(--ag-font-ui);
  -webkit-font-smoothing: antialiased;
  animation: ag-dock-in 0.38s ${AG_EASE} both;
}
@keyframes ag-dock-in {
  from {
    opacity: 0;
    filter: blur(3px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}
.ag-dock-btn {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 38px;
  height: auto;
  padding: 2px 5px 2px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--ag-text);
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.22s ${AG_EASE},
    color 0.22s ${AG_EASE},
    box-shadow 0.22s ${AG_EASE},
    transform 0.18s ${AG_EASE};
}
.ag-dock-btn__icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-height: 16px;
  line-height: 0;
  opacity: 0.76;
  transition:
    opacity 0.22s ${AG_EASE},
    transform 0.22s ${AG_EASE};
}
.ag-dock-btn__icon svg {
  display: block;
}
.ag-dock-btn__label {
  font-size: 8px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.03em;
  opacity: 0.68;
  white-space: nowrap;
  transition: opacity 0.22s ${AG_EASE};
}
.ag-dock-btn:hover:not([aria-pressed="true"]) {
  background: rgba(255, 255, 255, 0.58);
  transform: translateY(-1px);
}
.ag-dock-btn:hover .ag-dock-btn__icon {
  opacity: 1;
  transform: translateY(-1px) scale(1.04);
}
.ag-dock-btn:hover .ag-dock-btn__label,
.ag-dock-btn--active .ag-dock-btn__label {
  opacity: 1;
}
.ag-dock-btn--active .ag-dock-btn__icon {
  opacity: 1;
  transform: scale(1.02);
}
.ag-dock-btn:active {
  transform: translateY(0) scale(0.96);
}
.ag-dock-btn:active .ag-dock-btn__icon {
  transform: scale(0.96);
}
.ag-dock-btn:focus-visible {
  outline: 2px solid var(--ag-primary);
  outline-offset: 1px;
}
.ag-dock-btn--active {
  background: rgba(255, 255, 255, 0.94) !important;
  color: var(--ag-primary) !important;
  box-shadow: inset 0 0 0 1px rgba(29, 78, 216, 0.18) !important;
  transform: translateY(-1px);
}
.ag-dock-btn--review:not([aria-pressed="true"]) {
  color: var(--ag-warning);
}
.ag-dock-header {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  min-height: 16px;
}
.ag-dock-header__side {
  flex: 0 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ag-dock-header__brand {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  font-size: 8px;
  font-weight: 650;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--ag-text-muted);
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  text-align: center;
}
.ag-dock-scan-toast {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 8px 12px;
  max-width: min(280px, 90vw);
  border-radius: 10px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  font-size: 12px;
  line-height: 1.4;
  color: var(--ag-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  z-index: 1;
}
.ag-dock-dev {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ag-dock-settings-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--ag-text-muted);
  cursor: pointer;
  transition:
    background 0.22s ${AG_EASE},
    color 0.22s ${AG_EASE},
    transform 0.22s ${AG_EASE};
}
.ag-dock-settings-btn svg {
  transition: transform 0.28s ${AG_EASE};
}
.ag-dock-settings-btn:hover {
  background: rgba(255, 255, 255, 0.62);
  color: var(--ag-text);
  transform: rotate(-12deg);
}
.ag-dock-settings-btn:focus-visible {
  outline: 2px solid var(--ag-primary);
  outline-offset: 1px;
}
.ag-dock-settings-btn[aria-expanded="true"] {
  background: rgba(255, 255, 255, 0.9);
  color: var(--ag-primary);
}
.ag-dock-settings-btn[aria-expanded="true"] svg {
  transform: rotate(90deg);
}
.ag-dock-menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 5px);
  min-width: 136px;
  margin: 0;
  padding: 3px;
  list-style: none;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid var(--ag-border-strong);
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.11);
  z-index: 10001;
  transform-origin: bottom right;
  animation: ag-menu-in 0.24s ${AG_EASE} both;
}
@keyframes ag-menu-in {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.ag-dock-menu__item {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--ag-text);
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ${AG_EASE}, color 0.18s ${AG_EASE};
}
.ag-dock-menu__item:hover {
  background: rgba(29, 78, 216, 0.07);
}
.ag-dock-menu__item--active {
  background: rgba(29, 78, 216, 0.1);
  color: var(--ag-primary);
}
.ag-dock-menu__item:focus-visible {
  outline: 2px solid var(--ag-primary);
  outline-offset: -1px;
}
.ag-panel-input:focus {
  outline: none;
  border-color: rgba(29, 78, 216, 0.4);
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
}
@media (prefers-reduced-motion: reduce) {
  .ag-dock,
  .ag-dock-menu {
    animation: none;
  }
  .ag-dock-btn,
  .ag-dock-btn__icon,
  .ag-dock-btn__label,
  .ag-dock-settings-btn,
  .ag-dock-settings-btn svg,
  .ag-dock-menu__item {
    transition: none;
  }
  .ag-dock-btn:hover,
  .ag-dock-btn--active,
  .ag-dock-btn:active,
  .ag-dock-btn:hover .ag-dock-btn__icon,
  .ag-dock-btn--active .ag-dock-btn__icon,
  .ag-dock-settings-btn:hover {
    transform: none;
  }
}
`;

export function agDockShellStyle(bottomOffset = 0): CSSProperties {
  return {
    position: 'fixed',
    bottom: resolveDockBottom(bottomOffset),
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    minWidth: 0,
    maxWidth: 'min(94vw, 280px)',
    padding: '4px 6px 4px',
    borderRadius: 10,
    background: 'rgba(255, 255, 255, 0.84)',
    backdropFilter: 'blur(12px) saturate(150%)',
    WebkitBackdropFilter: 'blur(12px) saturate(150%)',
    border: '1px solid var(--ag-border-strong)',
    boxShadow:
      '0 3px 18px rgba(15, 23, 42, 0.09), inset 0 1px 0 rgba(255, 255, 255, 0.82)',
    zIndex: 9999,
    color: 'var(--ag-text)',
  };
}

export function agDockBrandStyle(): CSSProperties {
  return {
    margin: 0,
    padding: 0,
    fontSize: 8,
    fontWeight: 650,
    letterSpacing: '0.13em',
    textTransform: 'uppercase',
    color: 'var(--ag-text-muted)',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    textAlign: 'center',
  };
}

export function agDockHeaderStyle(): CSSProperties {
  return {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 16,
    paddingRight: 0,
  };
}

export function agDockDividerStyle(): CSSProperties {
  return {
    width: 1,
    height: 28,
    alignSelf: 'center',
    background: 'rgba(15, 23, 42, 0.08)',
    flexShrink: 0,
  };
}

export function agDockActionsStyle(): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    padding: 0,
  };
}

export function agPanelAboveBarStyle(width = 360, bottomOffset = 0): CSSProperties {
  return {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: resolveDockBottom(bottomOffset) + AG_DOCK_HEIGHT + AG_BAR_GAP,
    width,
    maxWidth: 'min(94vw, 400px)',
    background: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(18px) saturate(150%)',
    WebkitBackdropFilter: 'blur(18px) saturate(150%)',
    border: '1px solid rgba(15, 23, 42, 0.07)',
    borderRadius: 14,
    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    padding: '12px 14px',
    zIndex: 9999,
    color: 'var(--ag-text)',
    fontFamily: 'var(--ag-font-ui)',
  };
}

/** @deprecated use agDockShellStyle */
export function agBarShellStyle(): CSSProperties {
  return agDockShellStyle();
}
