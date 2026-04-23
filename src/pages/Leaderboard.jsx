import React from 'react';

const SKELETON_ROWS = Array.from({ length: 8 }, (_, i) => i);

function SkeletonRow() {
  return (
    <tr className="leaderboard-skeleton">
      <td><div className="skeleton skeleton--cell" /></td>
      <td><div className="skeleton skeleton--cell" /></td>
      <td><div className="skeleton skeleton--cell" /></td>
      <td><div className="skeleton skeleton--cell" /></td>
    </tr>
  );
}

export default function Leaderboard() {
  return (
    <div>
      <h1>Leaderboard</h1>
      <p>Compare results with other users.</p>

      <div className="card">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>XP</th>
              <th>Tasks Solved</th>
            </tr>
          </thead>
          <tbody>
            {SKELETON_ROWS.map((i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
        <p className="leaderboard-note">
          Leaderboard data will be available once the backend endpoint is ready.
        </p>
      </div>
    </div>
  );
}