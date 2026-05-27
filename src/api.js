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

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...authHeaders(),
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
  // Tasks
  getTasks: () => apiFetch('/tasks'),

  createTask: (body) =>
    apiFetch('/tasks', { method: 'POST', body: JSON.stringify(body) }),

  // Users
  createUser: (body) =>
    apiFetch('/users', { method: 'POST', body: JSON.stringify(body) }),

  // Task management
  assignTask: (body) =>
    apiFetch('/assign-task', { method: 'POST', body: JSON.stringify(body) }),

  taskDone: (body) =>
    apiFetch('/task-done', { method: 'POST', body: JSON.stringify(body) }),

  // Solutions
  submitSolution: (body) =>
    apiFetch('/solution', { method: 'POST', body: JSON.stringify(body) }),

  // Files (draw.io)
  uploadDrawio: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { ...authHeaders() },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? 'Upload failed');
    }
    return res.json();
  },

  getFile: (fileId) => apiFetch(`/file/${fileId}`),
};
