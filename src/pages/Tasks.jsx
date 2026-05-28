import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

const LEVELS = [1, 2, 3, 4, 5];

const LEVEL_COLORS = {
  1: { bg: '#d1fae5', color: '#065f46' },
  2: { bg: '#dbeafe', color: '#1e40af' },
  3: { bg: '#fef3c7', color: '#92400e' },
  4: { bg: '#ede9fe', color: '#5b21b6' },
  5: { bg: '#fee2e2', color: '#991b1b' },
};

function lvlBadgeStyle(lvl) {
  const c = LEVEL_COLORS[lvl] ?? LEVEL_COLORS[1];
  return { background: c.bg, color: c.color };
}

function SkeletonCard() {
  return (
    <div className="card task-card task-card--skeleton">
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--text" />
      <div className="skeleton skeleton--text skeleton--short" />
      <div className="skeleton skeleton--badge" />
    </div>
  );
}

// ─── Submit Solution Modal ────────────────────────────────────────────────────
function SolutionModal({ task, onClose, onSuccess }) {
  const { user, isAuthenticated, startDiscordLogin } = useAuth();
  const [discordId, setDiscordId] = useState(
    isAuthenticated && user?.id ? String(user.id) : ''
  );
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let file_id = null;
      if (file) {
        const uploaded = await api.uploadDrawio(file);
        file_id = uploaded?.file_id ?? uploaded?.id ?? null;
      }

      await api.submitSolution({
        discord_id: String(discordId),
        task_name: task.name,
        ...(file_id != null ? { file_id } : {}),
      });

      onSuccess?.(`Solution submitted for "${task.name}"!`);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Submit Solution</h3>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="text-muted">Task: <strong>{task.name}</strong></p>

        {!isAuthenticated && (
          <div className="modal-auth-notice">
            <p>Login with Discord to auto-fill your ID.</p>
            <button
              type="button"
              className="btn btn--discord btn--small"
              onClick={() => startDiscordLogin({ returnTo: '/tasks' })}
            >
              Login with Discord
            </button>
          </div>
        )}

        {error && <p className="text-danger">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-fields">
            <div className="form-field">
              <label htmlFor="sol-discord-id">Your Discord ID</label>
              <input
                id="sol-discord-id"
                type="number"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="123456789012345678"
                required
              />
            </div>
            <div className="form-field form-field--full">
              <label htmlFor="sol-file">Draw.io solution file</label>
              <input
                id="sol-file"
                type="file"
                accept=".drawio,.xml"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onSolve }) {
  const lvlStyle = lvlBadgeStyle(task.lvl);
  const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://api.flowjob.id.lv';

  return (
    <div className="card task-card">
      <div className="task-card__header">
        <span className="task-card__name">{task.name}</span>
        <span className="lvl-badge" style={lvlStyle}>LVL {task.lvl}</span>
      </div>
      <p className="task-card__text">{task.text}</p>
      <div className="task-card__footer">
        <span className="task-card__autor">by {task.autor}</span>
        <div className="task-card__actions">
          {task.file_id && (
            <a
              className="btn btn--small btn--ghost"
              href={`${API_BASE}/file/${task.file_id}`}
              target="_blank"
              rel="noreferrer"
            >
              📎 Open
            </a>
          )}
          <button
            type="button"
            className="btn btn--small"
            onClick={() => onSolve(task)}
          >
            Solve
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
function useTasks() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.getTasks()
      .then(setTasks)
      .catch((e) => setError(e.message ?? 'Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  return { tasks, loading, error, reload: load };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Tasks() {
  const { tasks, loading, error, reload } = useTasks();
  const [filter, setFilter]   = useState('all');
  const [sort, setSort]       = useState('name');
  const [query, setQuery]     = useState('');
  const [solving, setSolving] = useState(null);   // task being solved
  const [toast, setToast]     = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const displayed = tasks
    .filter((t) => filter === 'all' || String(t.lvl) === filter)
    .filter(
      (t) =>
        !query ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.autor.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'lvl') return a.lvl - b.lvl;
      if (sort === 'autor') return a.autor.localeCompare(b.autor);
      return a.name.localeCompare(b.name);
    });

  return (
    <div>
      <h1>Tasks</h1>
      <p>Browse and solve algorithmic challenges.</p>

      {toast && <div className="admin-toast">{toast}</div>}

      <div className="tasks-controls">
        <input
          className="tasks-search"
          type="text"
          placeholder="Search by name or author..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="tasks-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="name">Sort: Name</option>
          <option value="lvl">Sort: Level</option>
          <option value="autor">Sort: Author</option>
        </select>
      </div>

      <div className="tasks-filter">
        <button
          className={`tasks-filter__btn${filter === 'all' ? ' tasks-filter__btn--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {LEVELS.map((l) => (
          <button
            key={l}
            className={`tasks-filter__btn${filter === String(l) ? ' tasks-filter__btn--active' : ''}`}
            style={filter === String(l) ? lvlBadgeStyle(l) : {}}
            onClick={() => setFilter(String(l))}
          >
            LVL {l}
          </button>
        ))}
      </div>

      {error && (
        <div className="tasks-error">
          <span>{error}</span>
          <button className="btn" onClick={reload}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid page-grid">
          {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid page-grid">
          {displayed.map((t) => (
            <TaskCard key={t.name} task={t} onSolve={setSolving} />
          ))}
          {!displayed.length && !error && (
            <div className="card"><p>No tasks found.</p></div>
          )}
        </div>
      )}

      {solving && (
        <SolutionModal
          task={solving}
          onClose={() => setSolving(null)}
          onSuccess={showToast}
        />
      )}
    </div>
  );
}