export interface CatalogManifest {
  sourceUpdated: string;
  recordCount: number;
  shards: {url: string; count: number; bytes: number}[];
}
export function prepareCatalog(dataDir: string, fetcher?: typeof fetch): Promise<CatalogManifest>;