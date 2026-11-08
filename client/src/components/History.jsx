import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function History({
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearHistory
}) {
  return (
    <section className="history-panel">
      <div className="history-heading">
        <div>
          <h2>Query History</h2>
          <p>Review your previous AI interactions.</p>
        </div>

        <div className="history-actions">
          <span>{history.length} queries</span>

          {history.length > 0 && (
            <button
              className="clear-history-button"
              onClick={onClearHistory}
            >
              Clear History
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <h3>No history yet</h3>
          <p>Your previous queries will appear here.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <article className="history-card" key={item.id}>
              <div className="history-card-header">
                <span>{item.mode.toUpperCase()}</span>

                <time>
                  {new Date(item.createdAt).toLocaleString()}
                </time>
              </div>

              <h3>{item.prompt}</h3>

              <div className="history-preview">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {item.response}
                </ReactMarkdown>
              </div>

              <div className="history-card-footer">
                <span>{item.model}</span>

                <div className="history-card-actions">
                  <button
                    onClick={() => onSelectHistory(item)}
                  >
                    View response
                  </button>

                  <button
                    className="delete-history-button"
                    onClick={() => onDeleteHistory(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default History;
