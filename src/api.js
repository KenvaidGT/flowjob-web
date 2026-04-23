import { API_BASE } from './config.js';

const STORAGE_KEY = 'flowjob.auth';

function loadStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.accessToken || !parsed?.expiresAt) return null;
    if (Date.now() >= parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function apiFetch(endpoint, options = {}) {
  const stored = loadStoredSession();
  const accessToken = stored?.accessToken;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? 'API error');
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getTasks: () => apiFetch('/tasks'),

  createUser: (body) =>
    apiFetch('/users', { method: 'POST', body: JSON.stringify(body) }),

  assignTask: (body) =>
    apiFetch('/assign-task', { method: 'POST', body: JSON.stringify(body) }),

  submitSolution: (body) =>
    apiFetch('/solution', { method: 'POST', body: JSON.stringify(body) }),
};
