import { useState, useEffect} from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import PromptEditor from "./components/PromptEditor";
import ResultPanel from "./components/ResultPanel";
import UsageStats from "./components/UsageStats";
import { generateAIResponse } from "./services/aiService";
import History from "./components/History";
import Documentation from "./components/Documentation";

const getTimestamp = () => performance.now();

function App() {
// Estados principales de la aplicación
const [prompt, setPrompt] = useState("");
const [mode, setMode] = useState("demo");
const [response, setResponse] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [activePage, setActivePage] = useState("playground");
// Estado de conexión con el backend
const [connectionStatus, setConnectionStatus] = useState("checking");
// Verificar conexión con el backend
useEffect(() => {

  let isMounted = true;

  const checkBackendConnection = async () => {

    try {
      const response = await fetch("http://localhost:3000/api/health");

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Backend health check failed");
      }

      if (isMounted) {
        setConnectionStatus("connected");
      }

    } catch {

      if (isMounted) {
        setConnectionStatus("disconnected");
      }

    }
  };

  // Primera comprobación
  checkBackendConnection();

  // Comprobar cada 5 segundos
  const intervalId = setInterval(
    checkBackendConnection,
    5000
  );

  // Limpiar el intervalo al desmontar el componente
  return () => {
    isMounted = false;
    clearInterval(intervalId);
  };

}, []);

// Estado de las métricas
const [metrics, setMetrics] = useState({
model: "--",
responseTime: "--",
tokens: "--",
mode: "demo"
});

// Función para generar respuestas
const handleGenerate = async (promptValue, modeValue) => {
if (!promptValue.trim()) {
setError("Please enter a prompt before generating a response.");
setResponse("");
return;
}


setLoading(true);
setResponse("");
setError("");

try {
  const startTime = getTimestamp();

  // Solicitar respuesta al backend
  const data = await generateAIResponse(promptValue, modeValue);

  const endTime = getTimestamp();

  // Calcular tiempo total de la solicitud
  const responseTime = Math.round(endTime - startTime);

  // Guardar respuesta
  setResponse(data.answer);

  // Crear registro del historial
const historyEntry = {
  id: crypto.randomUUID(),
  prompt: promptValue,
  response: data.answer,
  mode: data.mode,
  model: data.model || "--",
  responseTime: data.latencyMs ?? responseTime,
  tokens: data.usage?.total_tokens ?? "N/A",
  createdAt: new Date().toISOString()
};

// Actualizar historial
setHistory((previousHistory) => {
  const updatedHistory = [historyEntry, ...previousHistory];

  // Guardar en localStorage
  localStorage.setItem(
    "ai-playground-history",
    JSON.stringify(updatedHistory)
  );

  return updatedHistory;
});

  // Actualizar métricas
  setMetrics({
    model: data.model || "--",
    responseTime: data.latencyMs ?? responseTime,
    tokens: data.usage?.total_tokens ?? "N/A",
    mode: data.mode
  });

} catch (err) {
  setError(err.message || "An unexpected error occurred.");

} finally {
  setLoading(false);
}


};

// Recuperar una consulta del historial
const handleSelectHistory = (item) => {
  setPrompt(item.prompt);
  setResponse(item.response);
  setMode(item.mode);
  setError("");

  setMetrics({
    model: item.model,
    responseTime: item.responseTime,
    tokens: item.tokens,
    mode: item.mode
  });

  setActivePage("playground");
};

// Eliminar una consulta del historial
const handleDeleteHistory = (id) => {
  setHistory((previousHistory) => {
    const updatedHistory = previousHistory.filter(
      (item) => item.id !== id
    );

    localStorage.setItem(
      "ai-playground-history",
      JSON.stringify(updatedHistory)
    );

    return updatedHistory;
  });
};

// Eliminar todo el historial
const handleClearHistory = () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete all history?"
  );

  if (!confirmed) return;

  setHistory([]);
  localStorage.removeItem("ai-playground-history");
};

// Estado del historial de consultas
const [history, setHistory] = useState(() => {
  try {
    const savedHistory = localStorage.getItem("ai-playground-history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error("Error loading history:", error);
    return [];
  }
});
return ( <div className="app-container">
<Sidebar
  activePage={activePage}
  onNavigate={setActivePage}/>
  <main className="main-content">
    <Header
    connectionStatus={connectionStatus} />
    <div className="workspace">
  {activePage === "playground" && (
    <>
      <PromptEditor
        prompt={prompt}
        setPrompt={setPrompt}
        mode={mode}
        setMode={setMode}
        onGenerate={handleGenerate}
        loading={loading}
      />

      <ResultPanel
        response={response}
        loading={loading}
        error={error}
      />

      <UsageStats metrics={metrics} />
    </>
  )}

  {activePage === "history" && (
  <History
    history={history}
    onSelectHistory={handleSelectHistory}
    onDeleteHistory={handleDeleteHistory}
    onClearHistory={handleClearHistory}
  />
)}

  {activePage === "documentation" && (
  <Documentation />
)}
</div>
  </main>
</div>


);
}

export default App;
