/**
 * @iamthamanic/autoguide-react — dock button with icon and label.
 */

import type { ReactNode } from 'react';

export interface BarButtonProps {
  label: string;
  icon: ReactNode;
  ariaLabel?: string;
  active?: boolean;
  onClick: () => void;
  variant?: 'default' | 'review';
}

export function BarButton({
  label,
  icon,
  ariaLabel,
  active = false,
  onClick,
  variant = 'default',
}: BarButtonProps) {
  const classes = [
    'ag-dock-btn',
    active ? 'ag-dock-btn--active' : '',
    variant === 'review' ? 'ag-dock-btn--review' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-label={ariaLabel ?? label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
    >
      <span className="ag-dock-btn__icon">{icon}</span>
      <span className="ag-dock-btn__label">{label}</span>
    </button>
  );
}
