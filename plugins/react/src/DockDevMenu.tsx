/**
 * @iamthamanic/autoguide-react — dev-only settings dropdown on the dock (Scan, Inspect, Review, …).
 */

import { ClipboardList, Crosshair, Settings, type LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

export interface DockDevMenuItem {
  id: string;
  label: string;
  ariaLabel?: string;
  icon: LucideIcon;
  active?: boolean;
  onSelect: () => void;
}

export interface DockDevMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DockDevMenuItem[];
}

export function DockDevMenu({ open, onOpenChange, items }: DockDevMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, onOpenChange]);

  if (items.length === 0) return null;

  return (
    <div ref={rootRef} className="ag-dock-dev">
      <button
        type="button"
        className="ag-dock-settings-btn"
        aria-label="Entwickler-Menü"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Entwickler"
        onClick={() => onOpenChange(!open)}
      >
        <Settings size={12} strokeWidth={1.75} aria-hidden />
      </button>
      {open ? (
        <ul className="ag-dock-menu" role="menu" aria-label="Entwickler-Funktionen">
          {items.map((item) => (
            <li key={item.id} role="none">
              <button
                type="button"
                role="menuitem"
                className={`ag-dock-menu__item${item.active ? ' ag-dock-menu__item--active' : ''}`}
                aria-label={item.ariaLabel ?? item.label}
                onClick={() => {
                  item.onSelect();
                  onOpenChange(false);
                }}
              >
                <item.icon size={14} strokeWidth={1.75} aria-hidden />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
