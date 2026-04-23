import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

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

function TaskCard({ task }) {
  const lvlStyle = lvlBadgeStyle(task.lvl);
  return (
    <div className="card task-card">
      <div className="task-card__header">
        <span className="task-card__name">{task.name}</span>
        <span className="lvl-badge" style={lvlStyle}>
          LVL {task.lvl}
        </span>
      </div>
      <p className="task-card__text">{task.text}</p>
      <div className="task-card__footer">
        <span className="task-card__autor">by {task.autor}</span>
      </div>
    </div>
  );
}

function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .getTasks()
      .then(setTasks)
      .catch((e) => setError(e.message ?? 'Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return { tasks, loading, error, reload: load };
}

export default function Tasks() {
  const { tasks, loading, error, reload } = useTasks();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [query, setQuery] = useState('');

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
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid page-grid">
          {displayed.map((t) => (
            <TaskCard key={t.name} task={t} />
          ))}
          {!displayed.length && !error && (
            <div className="card">
              <p>No tasks found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}