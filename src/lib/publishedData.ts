const DATA_MIRROR = "https://raw.githubusercontent.com/RabbitHour/poke-pulse-ticker/market-data/";
/** Fall back to published data when the host omits it; prefer a fresher release. */
export async function readPublishedData<T>(name: string, valid: (data: unknown) => boolean): Promise<T> {
  if (!/^[a-z0-9-]+\.json$/.test(name)) throw new Error("Invalid data file");
  let fallback: T | undefined;
  let fallbackDate = -Infinity;
  for (const url of ["/data/" + name, DATA_MIRROR + name]) {
    try {
      const response = await fetch(url, { cache: "no-cache", signal: AbortSignal.timeout(20000) });
      if (!response.ok) continue;
      const data: unknown = await response.json();
      if (!valid(data)) continue;
      const date = Date.parse((data as {sourceUpdated?:string}).sourceUpdated ?? "");
      if (fallback === undefined || (Number.isFinite(date) && date > fallbackDate)) {
        fallback = data as T; fallbackDate = Number.isFinite(date) ? date : -Infinity;
      }
      if (Number.isFinite(date) && Date.now() - date <= 36 * 3600000 && date <= Date.now() + 3600000) return data as T;
    } catch { /* Try the independent public data mirror. */ }
  }
  if (fallback !== undefined) return fallback;
  throw new Error("Published market data is unavailable. Please retry.");
}
