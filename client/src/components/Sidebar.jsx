function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">AI</div>

        <div className="brand-info">
          <h2>AI Playground</h2>
          <span>API Workspace</span>
        </div>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-label">WORKSPACE</span>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activePage === "playground" ? "active" : ""}`}
            onClick={() => onNavigate("playground")}
          >
            <span className="nav-icon">⌘</span>
            <span>Playground</span>
          </button>

          <button
            className={`nav-item ${activePage === "history" ? "active" : ""}`}
            onClick={() => onNavigate("history")}
          >
            <span className="nav-icon">◷</span>
            <span>History</span>
          </button>

          <button
            className={`nav-item ${activePage === "documentation" ? "active" : ""}`}
            onClick={() => onNavigate("documentation")}
          >
            <span className="nav-icon">▤</span>
            <span>Documentation</span>
          </button>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="status-dot"></span>
          <span>API Workspace</span>
        </div>

        <span className="sidebar-version">Version 1.0.0</span>
      </div>
    </aside>
  );
}

export default Sidebar;