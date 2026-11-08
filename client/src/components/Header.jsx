function Header({ connectionStatus }) {

  const statusText = {
    checking: "Checking API...",
    connected: "API Connected",
    disconnected: "API Disconnected"
  };

  return (
    <header className="main-header">
      <div className="header-title">
        <h1>Playground</h1>
        <p>Experiment with AI models and prompts.</p>
      </div>

      <div className="header-actions">
        <div className="connection-status">
          <span className={`status-dot ${connectionStatus}`}></span>
          <span>{statusText[connectionStatus]}</span>
        </div>

        <div className="user-avatar">EM</div>
      </div>
    </header>
  );
}

export default Header;