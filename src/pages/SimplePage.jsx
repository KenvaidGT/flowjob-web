import React from 'react'

export default function SimplePage({ title, description }) {
  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="grid page-grid">
        <div className="card">Placeholder block</div>
        <div className="card">Placeholder block</div>
        <div className="card">Placeholder block</div>
      </div>
    </div>
  )
}
