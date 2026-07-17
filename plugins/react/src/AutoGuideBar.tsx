/**
 * @iamthamanic/autoguide-react — bottom-center dock: Hilfe + Tour; dev tools in settings menu.
 */

import {
  CircleHelp,
  ClipboardList,
  Crosshair,
  GripVertical,
  Route,
  ScanSearch,
  type LucideIcon,
} from 'lucide-react';
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
import { triggerDevScan } from './triggerDevScan.js';
import { useAutoGuide } from './context.js';
import { applyCustomDockPosition, useDockPosition } from './useDockPosition.js';

const ICON_SIZE = 16;
const SCAN_TOAST_DISMISS_MS = 5000;

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
  const { appId, mode, devScanUrl, onRetry, dockBottomOffset = 0 } = useAutoGuide();
  const { dockRef, handleProps, position, dragging } = useDockPosition(appId);
  const [helpOpen, setHelpOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [inspectorActive, setInspectorActive] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scanBusy, setScanBusy] = useState(false);

  const showWidget = features.widget !== false;
  const showInspector = features.inspector === true && mode === 'development';
  const primaryTour = usePrimaryTour(tourId);
  const showTours = features.tours === true && primaryTour !== undefined;
  const reviewPending = useReviewPendingCount();
  const showReviewInMenu = mode === 'development';
  const showScanInMenu = mode === 'development' && devScanUrl !== false && Boolean(devScanUrl);

  const dismissScanToast = useCallback(() => {
    setScanMessage(null);
  }, []);

  const runDevScan = useCallback(async () => {
    if (!devScanUrl || scanBusy) return;
    setScanBusy(true);
    setScanMessage('Scan läuft…');
    const result = await triggerDevScan(devScanUrl);
    setScanBusy(false);
    setScanMessage(result.message);
    if (result.ok && onRetry) onRetry();
  }, [devScanUrl, onRetry, scanBusy]);

  // Auto-dismiss completed scan toast; clear on unmount / new message while busy.
  useEffect(() => {
    if (!scanMessage || scanBusy) return;
    const timer = window.setTimeout(() => {
      setScanMessage(null);
    }, SCAN_TOAST_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [scanMessage, scanBusy]);

  const devMenuItems = useMemo(() => {
    const items: Parameters<typeof DockDevMenu>[0]['items'] = [];
    if (showScanInMenu) {
      items.push({
        id: 'scan',
        label: scanBusy ? 'Scan…' : 'Scan',
        ariaLabel: 'Dokumentation neu scannen',
        icon: ScanSearch,
        onSelect: () => {
          void runDevScan();
        },
      });
    }
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
  }, [inspectorActive, reviewOpen, reviewPending, runDevScan, scanBusy, showInspector, showReviewInMenu, showScanInMenu]);

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

  const dockShellStyle = applyCustomDockPosition(agDockShellStyle(dockBottomOffset), position);
  const dockClassName = dragging ? 'ag-dock ag-dock--dragging' : 'ag-dock';

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

      <aside
        ref={(el) => {
          dockRef.current = el;
        }}
        className={dockClassName}
        aria-label="AutoGuide"
        style={dockShellStyle}
      >
        {scanMessage ? (
          <button
            type="button"
            className="ag-dock-scan-toast"
            role="status"
            aria-live="polite"
            title="Klicken zum Schließen"
            onClick={dismissScanToast}
          >
            {scanMessage}
          </button>
        ) : null}
        <div className="ag-dock-header">
          <span className="ag-dock-header__side" aria-hidden />
          <button
            type="button"
            className="ag-dock-drag-handle"
            data-dragging={dragging ? 'true' : undefined}
            {...handleProps}
          >
            <GripVertical className="ag-dock-drag-handle__grip" size={12} strokeWidth={2.25} aria-hidden />
            <span className="ag-dock-drag-handle__label">AutoGuide</span>
          </button>
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
