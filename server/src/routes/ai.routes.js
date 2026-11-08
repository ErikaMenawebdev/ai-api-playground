const express = require("express");


const { generateText } = require("../services/openai.service");
const { classifyOpenAIError } = require("../services/openai-error.service");

function createAiRouter(
  generateTextFunction = generateText
) {
  const router = express.Router();

const MAX_PROMPT_LENGTH = 4000;
const DEFAULT_MAX_OUTPUT_TOKENS = 500;
const MAX_OUTPUT_TOKENS = 1000;

router.post("/generate", async (req, res) => {
  // 1. Comprobar si la IA real está habilitada
  if (process.env.AI_LIVE_ENABLED !== "true") {
    return res.status(503).json({
      success: false,
      error: {
        code: "LIVE_AI_DISABLED",
        message:
          "La IA real está deshabilitada. Puedes seleccionar el modo demostración."
      }
    });
  }

  // 2. Comprobar que prompt exista y sea una cadena
  const { prompt } = req.body ?? {};

  if (typeof prompt !== "string") {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PROMPT",
        message: "El campo prompt es obligatorio y debe ser texto."
      }
    });
  }

  // 3. Comprobar que prompt no esté vacío
  if (!prompt.trim()) {
    return res.status(400).json({
      success: false,
      error: {
        code: "EMPTY_PROMPT",
        message: "El prompt no puede estar vacío."
      }
    });
  }

  // 4. Comprobar la longitud máxima
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      success: false,
      error: {
        code: "PROMPT_TOO_LONG",
        message: `El prompt no puede superar los ${MAX_PROMPT_LENGTH} caracteres.`
      }
    });
  }

   // 5. Validar maxOutputTokens
  const { maxOutputTokens } = req.body;

  let outputTokens = DEFAULT_MAX_OUTPUT_TOKENS;

  if (maxOutputTokens !== undefined) {
    if (
      typeof maxOutputTokens !== "number" ||
      !Number.isInteger(maxOutputTokens)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_MAX_OUTPUT_TOKENS",
          message: "maxOutputTokens debe ser un número entero."
        }
      });
    }

    if (maxOutputTokens < 1 || maxOutputTokens > MAX_OUTPUT_TOKENS) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MAX_OUTPUT_TOKENS_OUT_OF_RANGE",
          message: `maxOutputTokens debe estar entre 1 y ${MAX_OUTPUT_TOKENS}.`
        }
      });
    }

    outputTokens = maxOutputTokens;
  }


  // 6. Generar una respuesta utilizando el servicio de IA
const startTime = Date.now();

try {
  const result = await generateTextFunction(prompt, outputTokens);
 

  const latencyMs = Date.now() - startTime;

  return res.status(200).json({
    success: true,
    mode: "live",
    answer: result.answer,
    model: result.model,
    status: result.status,
    incompleteDetails: result.incompleteDetails,
    latencyMs,
    usage: result.usage
    
  });
    

} catch (error) {
  const classifiedError = classifyOpenAIError(error);

  // Registrar información técnica sin exponerla al cliente.
  console.error("Error al generar respuesta con OpenAI:", {
    name: error.name,
    status: error.status,
    code: error.code,
    mappedCode: classifiedError.code
  });

  return res.status(classifiedError.status).json({
    success: false,
    mode: "live",
    error: {
      code: classifiedError.code,
      message: classifiedError.message
    }
  });
}
});
return router;
}
module.exports = createAiRouter;

