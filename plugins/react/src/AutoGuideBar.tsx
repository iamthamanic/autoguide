/**
 * @iamthamanic/autoguide-react — bottom-center dock: Hilfe + Tour; dev tools in settings menu.
 */

import { CircleHelp, ClipboardList, Crosshair, Route, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { agTokenCssVars } from '@iamthamanic/autoguide-ui';
import {
  AG_DOCK_STYLES,
  agDockActionsStyle,
  agDockShellStyle,
} from './bar-styles.js';
import { AutoGuideWidget } from './AutoGuideWidget.js';
import { BarButton } from './BarButton.js';
import type { AutoGuideFeatures } from './AutoGuide.js';
import { DockDevMenu } from './DockDevMenu.js';
import { InspectorOverlay } from './InspectorOverlay.js';
import { ReviewPanel, useReviewPendingCount } from './ReviewPanel.js';
import { TourRunner, usePrimaryTour } from './TourRunner.js';
import { useAutoGuide } from './context.js';

const ICON_SIZE = 16;

function dockIcon(IconComponent: LucideIcon, active: boolean) {
  return (
    <IconComponent
      size={ICON_SIZE}
      strokeWidth={active ? 2.25 : 1.75}
      aria-hidden
    />
  );
}

export interface AutoGuideBarProps {
  features?: AutoGuideFeatures;
  tourId?: string;
}

export function AutoGuideBar({ features = { widget: true }, tourId }: AutoGuideBarProps) {
  const { mode } = useAutoGuide();
  const [helpOpen, setHelpOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [inspectorActive, setInspectorActive] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [devMenuOpen, setDevMenuOpen] = useState(false);

  const showWidget = features.widget !== false;
  const showInspector = features.inspector === true && mode === 'development';
  const primaryTour = usePrimaryTour(tourId);
  const showTours = features.tours === true && primaryTour !== undefined;
  const reviewPending = useReviewPendingCount();
  const showReviewInMenu = mode === 'development';

  const devMenuItems = useMemo(() => {
    const items: Parameters<typeof DockDevMenu>[0]['items'] = [];
    if (showInspector) {
      items.push({
        id: 'inspect',
        label: 'Inspect',
        ariaLabel: 'Element inspizieren',
        icon: Crosshair,
        active: inspectorActive,
        onSelect: () => {
          setInspectorActive(true);
          setHelpOpen(false);
          setReviewOpen(false);
          setTourActive(false);
        },
      });
    }
    if (showReviewInMenu) {
      items.push({
        id: 'review',
        label: reviewPending > 0 ? `Review (${reviewPending})` : 'Review',
        ariaLabel:
          reviewPending > 0
            ? `Review-Warteschlange öffnen (${reviewPending} offen)`
            : 'Review-Warteschlange öffnen',
        icon: ClipboardList,
        active: reviewOpen,
        onSelect: () => {
          setReviewOpen(true);
          setHelpOpen(false);
          setInspectorActive(false);
          setTourActive(false);
        },
      });
    }
    return items;
  }, [inspectorActive, reviewOpen, reviewPending, showInspector, showReviewInMenu]);

  const showDevMenu = mode === 'development' && devMenuItems.length > 0;

  const closePanels = useCallback(() => {
    setHelpOpen(false);
    setReviewOpen(false);
    setInspectorActive(false);
    setTourActive(false);
    setDevMenuOpen(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (devMenuOpen) {
        setDevMenuOpen(false);
        return;
      }
      if (helpOpen || reviewOpen || inspectorActive || tourActive) {
        closePanels();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closePanels, devMenuOpen, helpOpen, inspectorActive, reviewOpen, tourActive]);

  const toggleHelp = () => {
    setDevMenuOpen(false);
    setHelpOpen((value) => {
      const next = !value;
      if (next) {
        setReviewOpen(false);
        setInspectorActive(false);
        setTourActive(false);
      }
      return next;
    });
  };

  const startTour = () => {
    setDevMenuOpen(false);
    setTourActive(true);
    setHelpOpen(false);
    setReviewOpen(false);
    setInspectorActive(false);
  };

  const hasBar = showWidget || showTours || showDevMenu;
  if (!hasBar) return null;

  return (
    <div style={agTokenCssVars()}>
      <style>{AG_DOCK_STYLES}</style>
      {showWidget ? <AutoGuideWidget open={helpOpen} onOpenChange={setHelpOpen} /> : null}
      {showReviewInMenu ? <ReviewPanel open={reviewOpen} onOpenChange={setReviewOpen} /> : null}
      {showInspector ? (
        <InspectorOverlay active={inspectorActive} onActiveChange={setInspectorActive} />
      ) : null}
      {showTours ? (
        <TourRunner tourId={tourId} active={tourActive} onActiveChange={setTourActive} />
      ) : null}

      <aside className="ag-dock" aria-label="AutoGuide" style={agDockShellStyle()}>
        <div className="ag-dock-header">
          <span className="ag-dock-header__side" aria-hidden />
          <p className="ag-dock-header__brand">AutoGuide</p>
          <span className="ag-dock-header__side">
            {showDevMenu ? (
              <DockDevMenu open={devMenuOpen} onOpenChange={setDevMenuOpen} items={devMenuItems} />
            ) : null}
          </span>
        </div>
        <nav role="toolbar" aria-label="AutoGuide Aktionen" style={agDockActionsStyle()}>
          {showWidget ? (
            <BarButton
              label="Hilfe"
              ariaLabel="Hilfe öffnen"
              active={helpOpen}
              onClick={toggleHelp}
              icon={dockIcon(CircleHelp, helpOpen)}
            />
          ) : null}
          {showTours && primaryTour ? (
            <BarButton
              label="Tour"
              ariaLabel={`Tour starten: ${primaryTour.title}`}
              active={tourActive}
              onClick={startTour}
              icon={dockIcon(Route, tourActive)}
            />
          ) : null}
        </nav>
      </aside>
    </div>
  );
}
