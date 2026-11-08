function PromptEditor({
prompt,
setPrompt,
mode,
setMode,
onGenerate,
loading
}) {
const MAX_CHARACTERS = 4000;

const handlePromptChange = (event) => {
setPrompt(event.target.value);
};

const handleModeChange = (event) => {
setMode(event.target.value);
};

const handleGenerate = () => {
if (!prompt.trim() || loading) return;


onGenerate(prompt, mode);


};

const handleNewPrompt = () => {
setPrompt("");
};

const isPromptInvalid =
!prompt.trim() || prompt.length > MAX_CHARACTERS;

return ( <section className="prompt-editor"> <div className="editor-heading"> <div> <h2>Prompt Editor</h2> <p>Write your instructions and interact with AI.</p> </div>


    <button
      type="button"
      className="editor-badge"
      onClick={handleNewPrompt}
      disabled={loading || !prompt}
    >
      NEW PROMPT
    </button>
  </div>

  <div className="prompt-field">
    <label htmlFor="prompt">Your prompt</label>

    <textarea
      id="prompt"
      value={prompt}
      onChange={handlePromptChange}
      placeholder="Write your prompt here... For example: Explain how artificial intelligence works."
      rows="8"
      maxLength={MAX_CHARACTERS}
      disabled={loading}
    />

    <div className="prompt-footer">
      <span>Be clear and specific with your instructions.</span>

      <span>
        {prompt.length}/{MAX_CHARACTERS} characters
      </span>
    </div>
  </div>

  <div className="editor-controls">
    <div className="mode-selector">
      <label htmlFor="mode">Execution mode</label>

      <select
        id="mode"
        value={mode}
        onChange={handleModeChange}
        disabled={loading}
      >
        <option value="demo">Demo Mode</option>
        <option value="live">Live Mode</option>
      </select>
    </div>

    <button
      type="button"
      className="generate-button"
      onClick={handleGenerate}
      disabled={isPromptInvalid || loading}
    >
      {loading ? "Generating..." : "Generate response"}
      {!loading && <span>→</span>}
    </button>
  </div>
</section>


);
}

export default PromptEditor;
