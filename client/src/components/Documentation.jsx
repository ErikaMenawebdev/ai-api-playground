function Documentation() {
  return (
    <section className="documentation-panel">

      {/* Encabezado */}
      <div className="documentation-heading">
        <h2>Technical Documentation</h2>
        <p>
          Learn how AI Playground works and explore
          its architecture, technologies and API.
        </p>
      </div>

      {/* Project Overview */}
      <article className="documentation-card">
        <h3>01. Project Overview</h3>

        <p>
          AI Playground is a web application designed
          to experiment with artificial intelligence
          models through a REST API.
        </p>

        <p>
          Users can submit prompts, receive AI-generated
          responses, compare execution modes and review
          their previous interactions.
        </p>
      </article>

      {/* Architecture */}
      <article className="documentation-card">
        <h3>02. System Architecture</h3>

        <p>
          The application follows a client-server
          architecture with three main layers:
        </p>

        <div className="architecture-grid">
          <div className="architecture-item">
            <h4>Frontend</h4>
            <span>React + Vite</span>
            <p>User interface and interaction.</p>
          </div>

          <div className="architecture-item">
            <h4>Backend</h4>
            <span>Node.js + Express</span>
            <p>REST API and business logic.</p>
          </div>

          <div className="architecture-item">
            <h4>AI Service</h4>
            <span>OpenAI API</span>
            <p>Real AI response generation.</p>
          </div>
        </div>
      </article>

      {/* Technology Stack */}
      <article className="documentation-card">
        <h3>03. Technology Stack</h3>

        <div className="technology-list">
          <div>
            <strong>React</strong>
            <span>Frontend development</span>
          </div>

          <div>
            <strong>Vite</strong>
            <span>Frontend development server and build tool</span>
          </div>

          <div>
            <strong>Node.js</strong>
            <span>Backend runtime environment</span>
          </div>

          <div>
            <strong>Express.js</strong>
            <span>REST API development</span>
          </div>

          <div>
            <strong>OpenAI API</strong>
            <span>Artificial intelligence integration</span>
          </div>

          <div>
            <strong>LocalStorage</strong>
            <span>Local query history persistence</span>
          </div>

          <div>
            <strong>React Markdown</strong>
            <span>AI response formatting</span>
          </div>

          <div>
            <strong>CSS3</strong>
            <span>Interface styling and responsive design</span>
          </div>
        </div>
      </article>

      {/* API Endpoints */}
      <article className="documentation-card">
        <h3>04. API Endpoints</h3>

        <div className="endpoint-list">

          <div className="endpoint-item">
            <span className="method get">GET</span>
            <code>/api/health</code>
            <p>Check backend server status.</p>
          </div>

          <div className="endpoint-item">
            <span className="method get">GET</span>
            <code>/api/config</code>
            <p>Retrieve application configuration.</p>
          </div>

          <div className="endpoint-item">
            <span className="method post">POST</span>
            <code>/api/demo</code>
            <p>Generate a simulated AI response.</p>
          </div>

          <div className="endpoint-item">
            <span className="method post">POST</span>
            <code>/api/ai/generate</code>
            <p>Generate a real AI response using OpenAI.</p>
          </div>

        </div>
      </article>

      {/* Execution Modes */}
      <article className="documentation-card">
        <h3>05. Execution Modes</h3>

        <div className="execution-grid">
          <div>
            <h4>Demo Mode</h4>
            <p>
              Generates simulated responses without
              consuming external AI services.
            </p>
          </div>

          <div>
            <h4>Live Mode</h4>
            <p>
              Connects to the OpenAI API to generate
              real AI responses.
            </p>
          </div>
        </div>
      </article>

            {/* Installation & Setup */}
      <article className="documentation-card">
        <h3>06. Installation & Setup</h3>

        <p>
          Follow these steps to install and run AI Playground locally.
        </p>

        <div className="setup-step">
          <h4>Step 1. Clone the repository</h4>
          <pre>
            <code>
              git clone https://github.com/ErikaMenawebdev/ai-api-playground.git
            </code>
          </pre>
        </div>

        <div className="setup-step">
          <h4>Step 2. Install backend dependencies</h4>
          <pre>
            <code>
              cd ai-api-playground/server{"\n"}
              npm install
            </code>
          </pre>
        </div>

        <div className="setup-step">
          <h4>Step 3. Install frontend dependencies</h4>
          <pre>
            <code>
              cd ../client{"\n"}
              npm install
            </code>
          </pre>
        </div>

        <div className="setup-step">
          <h4>Step 4. Configure environment variables</h4>
          <p>
            Create a .env file inside the server directory
            and configure the required variables.
          </p>
        </div>
      </article>

      {/* Environment Variables */}
      <article className="documentation-card">
        <h3>07. Environment Variables</h3>

        <p>
          The backend uses environment variables to control
          application configuration and AI execution.
        </p>

        <div className="environment-list">
          <div>
            <code>PORT</code>
            <span>Backend server port.</span>
          </div>

          <div>
            <code>DEMO_ENABLED</code>
            <span>Enables or disables Demo Mode.</span>
          </div>

          <div>
            <code>AI_LIVE_ENABLED</code>
            <span>Controls real AI integration.</span>
          </div>

          <div>
            <code>STREAMING_ENABLED</code>
            <span>Controls AI response streaming configuration.</span>
          </div>

          <div>
            <code>FRONTEND_URL</code>
            <span>Defines the frontend origin allowed by CORS.</span>
          </div>

          <div>
            <code>OPENAI_API_KEY</code>
            <span>Secret key used by the backend to authenticate with OpenAI.</span>
          </div>
        </div>

        <p className="documentation-note">
          Never expose secret API keys in frontend code or public repositories.
        </p>
      </article>

      {/* Testing */}
      <article className="documentation-card">
        <h3>08. Testing</h3>

        <p>
          The backend includes automated tests to verify
          API functionality, input validation and error handling.
        </p>

        <div className="setup-step">
          <h4>Run backend tests</h4>

          <pre>
            <code>
              cd server{"\n"}
              npm test
            </code>
          </pre>
        </div>

        <div className="testing-info">
          <strong>Test coverage includes:</strong>

          <ul>
            <li>API route validation.</li>
            <li>Application behavior.</li>
            <li>OpenAI error classification.</li>
            <li>OpenAI service behavior.</li>
            <li>Request cancellation handling.</li>
          </ul>
        </div>
      </article>

      {/* Error Handling & Security */}
      <article className="documentation-card">
        <h3>09. Error Handling & Security</h3>

        <p>
          AI Playground implements validation and error handling
          mechanisms to improve application reliability.
        </p>

        <div className="security-grid">
          <div>
            <h4>Input Validation</h4>
            <p>
              Validates prompt type, empty values and maximum length.
            </p>
          </div>

          <div>
            <h4>Error Handling</h4>
            <p>
              Uses structured error responses and centralized
              error classification.
            </p>
          </div>

          <div>
            <h4>API Key Protection</h4>
            <p>
              Keeps OpenAI credentials on the backend using
              environment variables.
            </p>
          </div>

          <div>
            <h4>CORS Configuration</h4>
            <p>
              Restricts cross-origin requests to the configured
              frontend origin.
            </p>
          </div>
        </div>
      </article>

    </section>
  );
}

export default Documentation;