import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

function StatCard({ label, value, icon }) {
  return (
    <div className="card stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__value">{value ?? '—'}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="card stat-card">
      <div className="skeleton skeleton--icon" />
      <div className="skeleton skeleton--value" />
      <div className="skeleton skeleton--label" />
    </div>
  );
}

function RecentCard({ title, subtitle, time }) {
  return (
    <div className="card recent-card">
      <div className="recent-card__title">{title}</div>
      <div className="recent-card__meta">
        {subtitle && <span>{subtitle}</span>}
        {time && <span>{time}</span>}
      </div>
    </div>
  );
}

function useTaskCount() {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.getTasks().then((tasks) => {
      setCount(tasks.length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  return { count, loading };
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { count: totalTasks, loading: tasksLoading } = useTaskCount();

  const displayName = user?.global_name || user?.username || 'Guest';

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, {displayName}.</p>

      <div className="grid page-grid">
        <StatCard
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
          label="Tasks Available"
          value={tasksLoading ? null : totalTasks}
        />
        <StatCard
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
          label="Your XP"
          value={isAuthenticated ? '—' : null}
        />
        <StatCard
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
          label="Group"
          value={isAuthenticated ? '—' : null}
        />
      </div>

      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        <div className="grid page-grid">
          <div className="card">
            <h3>Coming soon</h3>
            <p>Your solved tasks and recent activity will appear here once the backend endpoint is ready.</p>
          </div>
          <div className="card">
            <h3>Your Tasks</h3>
            <p>Assigned tasks will appear here once the backend endpoint is ready.</p>
          </div>
        </div>
      </div>
    </div>
  );
}