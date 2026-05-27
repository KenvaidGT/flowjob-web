// Priority: VITE_API_BASE env var → production default → dev fallback
export const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV ? 'https://api.flowjob.id.lv' : '/api');
