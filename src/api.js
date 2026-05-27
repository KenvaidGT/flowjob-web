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
  } catch (err) {
    console.warn('Failed to parse stored session, clearing:', err.message);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function authHeaders() {
  const stored = loadStoredSession();
  return stored?.accessToken ? { Authorization: `Bearer ${stored.accessToken}` } : {};
}

/** Read response as text first, then try JSON parse */
async function parseResponse(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    console.warn(`Non-JSON from ${res.url} [${res.status}]:`, text.slice(0, 300));
    // If HTML came back — most likely the API_BASE is wrong (hitting frontend)
    if (text.trimStart().startsWith('<')) {
      throw new Error(
        `API returned HTML instead of JSON. Check VITE_API_BASE.\n` +
        `Currently pointing at: ${API_BASE}`
      );
    }
    throw new Error(`Unexpected response: ${text.slice(0, 150)}`);
  }
}

async function apiFetch(endpoint, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch (networkErr) {
    throw new Error(`Network error: ${networkErr.message}`);
  }

  if (res.status === 204) return null;

  const data = await parseResponse(res);

  if (!res.ok) {
    const detail =
      (typeof data?.detail === 'string' ? data.detail : null) ||
      (Array.isArray(data?.detail)
        ? data.detail.map((e) => `${e.loc?.join('.')}: ${e.msg}`).join('; ')
        : null) ||
      res.statusText ||
      `HTTP ${res.status}`;
    throw new Error(detail);
  }

  return data;
}

export const api = {
  getTasks: () => apiFetch('/tasks'),

  createTask: (body) =>
    apiFetch('/tasks', { method: 'POST', body: JSON.stringify(body) }),

  createUser: (body) =>
    apiFetch('/users', { method: 'POST', body: JSON.stringify(body) }),

  assignTask: (body) =>
    apiFetch('/assign-task', { method: 'POST', body: JSON.stringify(body) }),

  taskDone: (body) =>
    apiFetch('/task-done', { method: 'POST', body: JSON.stringify(body) }),

  submitSolution: (body) =>
    apiFetch('/solution', { method: 'POST', body: JSON.stringify(body) }),

  uploadDrawio: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    let res;
    try {
      res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { ...authHeaders() },
        body: formData,
      });
    } catch (networkErr) {
      throw new Error(`Network error: ${networkErr.message}`);
    }

    const data = await parseResponse(res);

    if (!res.ok) {
      const detail =
        (typeof data?.detail === 'string' ? data.detail : null) ||
        res.statusText;
      throw new Error(detail);
    }
    return data;
  },

  getFile: (fileId) => apiFetch(`/file/${fileId}`),
};