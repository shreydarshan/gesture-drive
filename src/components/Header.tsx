import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="logo-badge">
          <svg
            className="logo-icon"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 0 1 2 2v4a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        </div>
        <div>
          <div className="title-row">
            <h1 className="app-title">GestureDrive</h1>
            <span className="phase-tag">Phase 4</span>
          </div>
          <p className="app-subtitle">Vehicle Control Engine</p>
        </div>
      </div>
    </header>
  );
};
