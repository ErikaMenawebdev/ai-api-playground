import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ResultPanel({ response, loading, error }) {
  const [copied, setCopied] = useState(false);

  // Copiar la respuesta al portapapeles
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (err) {
      console.error("Error copying response:", err);
    }
  };

  return (
    <section className="result-panel">
      <div className="result-heading">
        <div>
          <h2>AI Response</h2>
          <p>Your generated output will appear here.</p>
        </div>

        <span className="result-status">
          {loading
            ? "Generating..."
            : error
              ? "Error"
              : response
                ? "Response generated"
                : "Waiting for input"}
        </span>
      </div>

      <div className="result-content">
        {loading ? (
          <div className="empty-state">
            <h3>Generating response...</h3>
            <p>Please wait while AI processes your request.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        ) : response ? (
          <div className="response-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {response}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <h3>No response yet</h3>
            <p>
              Write a prompt and click Generate response
              to see the AI output here.
            </p>
          </div>
        )}
      </div>

      <div className="result-footer">
        <span>Powered by AI API Playground</span>

        <button
          type="button"
          className="copy-button"
          onClick={handleCopy}
          disabled={!response || loading}
        >
          {copied ? "Copied!" : "Copy response"}
        </button>
      </div>
    </section>
  );
}

export default ResultPanel;