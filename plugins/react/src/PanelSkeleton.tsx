/**
 * @iamthamanic/autoguide-react — loading skeleton for Help Widget panel.
 */

export function PanelSkeleton() {
  const line = (width: string) => (
    <div
      style={{
        height: 12,
        width,
        borderRadius: 4,
        background: 'var(--ag-surface-muted)',
        marginBottom: 10,
      }}
    />
  );

  return (
    <div aria-hidden>
      {line('70%')}
      {line('100%')}
      {line('85%')}
    </div>
  );
}
