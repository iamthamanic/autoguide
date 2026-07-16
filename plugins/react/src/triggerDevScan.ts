/**
 * @iamthamanic/autoguide-react — trigger dev scan via Vite middleware (development only).
 */

export interface DevScanResult {
  ok: boolean;
  message: string;
}

export async function triggerDevScan(
  url: string,
  options?: { runtime?: boolean },
): Promise<DevScanResult> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ runtime: options?.runtime ?? true }),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      message?: string;
      error?: string;
    };

    if (!response.ok) {
      return {
        ok: false,
        message: payload.error ?? payload.message ?? `Scan fehlgeschlagen (${response.status}).`,
      };
    }

    return {
      ok: payload.ok !== false,
      message: payload.message ?? 'Scan abgeschlossen.',
    };
  } catch {
    return {
      ok: false,
      message:
        'Scan-Endpunkt nicht erreichbar. Vite-Plugin aktiv? Alternativ: autoguide scan in der CLI.',
    };
  }
}
