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
      await api.createUser({
        discord_id: Number(discordId),
        username,
        group_name: group,
      });
      setDiscordId('');
      setUsername('');
      setGroup('');
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
          <label htmlFor="du-discord-id">Discord ID</label>
          <input
            id="du-discord-id"
            type="number"
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            placeholder="123456789012345678"
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="du-username">Username</label>
          <input
            id="du-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="du-group">Group</label>
          <input
            id="du-group"
            type="text"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="e.g. K33402"
            maxLength={5}
            required
          />
        </div>
      </div>
      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}

function AssignTaskForm({ tasks, onSuccess }) {
  const [discordId, setDiscordId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.assignTask({ discord_id: Number(discordId), task_name: taskName });
      setDiscordId('');
      setTaskName('');
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
          <input
            id="at-discord-id"
            type="number"
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            placeholder="123456789012345678"
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="at-task">Task</label>
          <select
            id="at-task"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
          >
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

function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api.getTasks()
      .then(setTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  return { tasks, loading, error };
}

export default function Admin() {
  const { tasks, loading, error } = useTasks();
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

        {toast && (
          <div className="admin-toast">{toast}</div>
        )}

        {error && (
          <div className="card">
            <p className="text-danger">Failed to load tasks: {error}</p>
          </div>
        )}

        <div className="admin-grid">
          <CreateUserForm onSuccess={showToast} />
          <AssignTaskForm tasks={tasks} onSuccess={showToast} />
        </div>

        <div className="admin-section">
          <h2>Task Catalog</h2>
          {loading ? (
            <p>Loading tasks...</p>
          ) : (
            <div className="admin-task-list">
              {tasks.map((t) => (
                <div key={t.name} className="card admin-task-row">
                  <span className="lvl-badge">LVL {t.lvl}</span>
                  <strong>{t.name}</strong>
                  <span className="text-muted">by {t.autor}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}