export interface RuntimeConfig {
  apiBaseUrl: string;
}

declare global {
  interface Window {
    __BM_RUNTIME_CONFIG__?: Partial<RuntimeConfig>;
  }
}

export function apiUrl(path: string): string {
  const base = (window.__BM_RUNTIME_CONFIG__?.apiBaseUrl ?? '').replace(/\/$/, '');
  return `${base}${path}`;
}
