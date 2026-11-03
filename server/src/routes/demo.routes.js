const express = require("express");

const router = express.Router();

const demoExamples = {
  "what-is-an-ai-api": {
    answer:
      "Una API de inteligencia artificial permite que una aplicación se comunique con un servicio de IA para enviar solicitudes y recibir resultados."
  },

  "what-is-a-prompt": {
    answer:
      "Un prompt es una instrucción o entrada que proporcionamos a un modelo de inteligencia artificial para orientar su respuesta."
  }
};

router.post("/", (req, res) => {
  if (process.env.DEMO_ENABLED !== "true") {
    return res.status(403).json({
      success: false,
      error: {
        code: "DEMO_DISABLED",
        message: "El modo demostración está deshabilitado."
      }
    });
  }

  const { exampleId } = req.body;

  if (typeof exampleId !== "string" || !exampleId.trim()) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_EXAMPLE_ID",
        message: "Debes proporcionar el identificador de un ejemplo."
      }
    });
  }

  const example = demoExamples[exampleId];

  if (!example) {
    return res.status(404).json({
      success: false,
      error: {
        code: "EXAMPLE_NOT_FOUND",
        message: "No se encontró el ejemplo solicitado."
      }
    });
  }

  return res.status(200).json({
    success: true,
    mode: "demo",
    answer: example.answer,
    source: "prepared_example"
  });
});

module.exports = router;