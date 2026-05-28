import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

const ADMIN_IDS = (import.meta.env.VITE_ADMIN_IDS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map(Number);

function AdminGuard({ children }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user?.id) return null;
  if (!ADMIN_IDS.length || ADMIN_IDS.includes(Number(user.id))) return children;
  return (
    <div className="card">
      <h3>Admin access denied</h3>
      <p>Your Discord account is not authorized to access the admin panel.</p>
    </div>
  );
}

// ─── Create User ────────────────────────────────────────────────────────────
function CreateUserForm({ onSuccess }) {
  const [discordId, setDiscordId] = useState('');
  const [username, setUsername] = useState('');
  const [group, setGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.createUser({ discord_id: String(discordId), username, group_name: group });
      setDiscordId(''); setUsername(''); setGroup('');
      onSuccess?.('User created successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>Create User</h3>
      {error && <p className="text-danger">{error}</p>}
      <div className="form-fields">
        <div className="form-field">
          <label htmlFor="cu-discord-id">Discord ID</label>
          <input id="cu-discord-id" type="number" value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            placeholder="123456789012345678" required />
        </div>
        <div className="form-field">
          <label htmlFor="cu-username">Username</label>
          <input id="cu-username" type="text" value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username" required />
        </div>
        <div className="form-field">
          <label htmlFor="cu-group">Group</label>
          <input id="cu-group" type="text" value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="e.g. K33402" maxLength={5} required />
        </div>
      </div>
      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}

// ─── Create Task ─────────────────────────────────────────────────────────────
function CreateTaskForm({ onSuccess, onTaskCreated }) {
  const [name, setName]       = useState('');
  const [text, setText]       = useState('');
  const [lvl, setLvl]         = useState('1');
  const [autor, setAutor]     = useState('');
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
      await api.createTask({
        name,
        text,
        lvl: Number(lvl),
        autor,
        ...(file_id != null ? { file_id } : {}),
      });
      setName(''); setText(''); setLvl('1'); setAutor(''); setFile(null);
      onSuccess?.('Task created successfully.');
      onTaskCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>Create Task</h3>
      {error && <p className="text-danger">{error}</p>}
      <div className="form-fields">
        <div className="form-field">
          <label htmlFor="ct-name">Task Name</label>
          <input id="ct-name" type="text" value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Unique task name" required />
        </div>
        <div className="form-field">
          <label htmlFor="ct-autor">Author</label>
          <input id="ct-autor" type="text" value={autor}
            onChange={(e) => setAutor(e.target.value)}
            placeholder="Author name" required />
        </div>
        <div className="form-field">
          <label htmlFor="ct-lvl">Level</label>
          <select id="ct-lvl" value={lvl} onChange={(e) => setLvl(e.target.value)}>
            {[1, 2, 3, 4, 5].map((l) => (
              <option key={l} value={l}>Level {l}</option>
            ))}
          </select>
        </div>
        <div className="form-field form-field--full">
          <label htmlFor="ct-text">Description</label>
          <textarea id="ct-text" value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Task description..." rows={3} required />
        </div>
        <div className="form-field form-field--full">
          <label htmlFor="ct-file">Draw.io file (optional)</label>
          <input id="ct-file" type="file" accept=".drawio,.xml"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
      </div>
      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}

// ─── Assign Task ─────────────────────────────────────────────────────────────
function AssignTaskForm({ tasks, onSuccess }) {
  const [discordId, setDiscordId] = useState('');
  const [taskName, setTaskName]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.assignTask({ discord_id: String(discordId), task_name: taskName });
      setDiscordId(''); setTaskName('');
      onSuccess?.('Task assigned successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>Assign Task</h3>
      {error && <p className="text-danger">{error}</p>}
      <div className="form-fields">
        <div className="form-field">
          <label htmlFor="at-discord-id">Discord ID</label>
          <input id="at-discord-id" type="number" value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            placeholder="123456789012345678" required />
        </div>
        <div className="form-field">
          <label htmlFor="at-task">Task</label>
          <select id="at-task" value={taskName}
            onChange={(e) => setTaskName(e.target.value)} required>
            <option value="">Select task...</option>
            {tasks.map((t) => (
              <option key={t.name} value={t.name}>
                [{t.lvl}] {t.name} — by {t.autor}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="btn" disabled={loading || !tasks.length}>
        {loading ? 'Assigning...' : 'Assign Task'}
      </button>
    </form>
  );
}

// ─── Task Done ────────────────────────────────────────────────────────────────
function TaskDoneForm({ tasks, onSuccess }) {
  const [discordId, setDiscordId] = useState('');
  const [taskName, setTaskName]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.taskDone({ discord_id: String(discordId), task_name: taskName });
      setDiscordId(''); setTaskName('');
      onSuccess?.('Task marked as done.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>Mark Task Done</h3>
      {error && <p className="text-danger">{error}</p>}
      <div className="form-fields">
        <div className="form-field">
          <label htmlFor="td-discord-id">Discord ID</label>
          <input id="td-discord-id" type="number" value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            placeholder="123456789012345678" required />
        </div>
        <div className="form-field">
          <label htmlFor="td-task">Task</label>
          <select id="td-task" value={taskName}
            onChange={(e) => setTaskName(e.target.value)} required>
            <option value="">Select task...</option>
            {tasks.map((t) => (
              <option key={t.name} value={t.name}>
                [{t.lvl}] {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="btn" disabled={loading || !tasks.length}>
        {loading ? 'Saving...' : 'Mark as Done'}
      </button>
    </form>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
function useTasks() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = () => {
    setLoading(true);
    api.getTasks()
      .then(setTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  return { tasks, loading, error, reload: load };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Admin() {
  const { tasks, loading, error, reload } = useTasks();
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <AdminGuard>
      <div>
        <h1>Admin Panel</h1>
        <p>Manage users, assign tasks, and oversee the platform.</p>

        {toast && <div className="admin-toast">{toast}</div>}
        {error && (
          <div className="card">
            <p className="text-danger">Failed to load tasks: {error}</p>
          </div>
        )}

        <div className="admin-grid">
          <CreateUserForm onSuccess={showToast} />
          <CreateTaskForm onSuccess={showToast} onTaskCreated={reload} />
          <AssignTaskForm tasks={tasks} onSuccess={showToast} />
          <TaskDoneForm tasks={tasks} onSuccess={showToast} />
        </div>

        <div className="admin-section">
          <h2>Task Catalog</h2>
          {loading ? (
            <p>Loading tasks...</p>
          ) : (
            <div className="admin-task-list">
              {tasks.length === 0 && <p className="text-muted">No tasks yet.</p>}
              {tasks.map((t) => (
                <div key={t.name} className="card admin-task-row">
                  <span className="lvl-badge">LVL {t.lvl}</span>
                  <strong>{t.name}</strong>
                  <span className="text-muted">by {t.autor}</span>
                  {t.file_id && (
                    <a
                      className="btn btn--small btn--ghost"
                      href={`${import.meta.env.VITE_API_BASE ?? 'https://api.flowjob.id.lv'}/file/${t.file_id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📎 File
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}