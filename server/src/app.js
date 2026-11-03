require("dotenv").config();

const express = require("express");
const cors = require("cors");
const demoRoutes = require("./routes/demo.routes");
const createAiRouter = require("./routes/ai.routes");

const app = express();
const allowedOrigin =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Middleware para interpretar solicitudes JSON
app.use(express.json());

// Comprobar el estado del servidor
app.get("/api/health", (req, res) => {
res.status(200).json({
success: true,
message: "AI API Playground backend funcionando correctamente"
});
});

// Consultar la configuración
app.get("/api/config", (req, res) => {
res.status(200).json({
demoEnabled: process.env.DEMO_ENABLED === "true",
liveAIEnabled: process.env.AI_LIVE_ENABLED === "true",
streamingEnabled: process.env.STREAMING_ENABLED === "true"
});
});

// Rutas del modo demostración
app.use("/api/demo", demoRoutes);

// Rutas de IA real
app.use("/api/ai", createAiRouter());

// Middleware para rutas inexistentes
app.use((req, res) => {
res.status(404).json({
success: false,
error: {
code: "ROUTE_NOT_FOUND",
message: "La ruta solicitada no existe."
}
});
});

// Middleware global para errores
app.use((err, req, res, next) => {

  if (res.headersSent) {
    return next(err);
  }

  // JSON malformado enviado por el cliente
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "El cuerpo de la solicitud contiene un JSON inválido."
      }
    });
  }

  // Registrar errores realmente internos
  console.error("Error interno del servidor:", err.message);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocurrió un error interno en el servidor."
    }
  });
});

module.exports = app;
