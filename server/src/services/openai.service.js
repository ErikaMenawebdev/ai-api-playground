const OpenAI = require("openai");

let openai;

const MODEL = "gpt-6-luna";

const REQUEST_TIMEOUT_MS = 30_000;
const GLOBAL_TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 500;
const MAX_RETRY_AFTER_MS = 5_000;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const error = new Error(
      "Falta configurar OPENAI_API_KEY en el archivo .env"
    );

    error.code = "OPENAI_API_KEY_MISSING";
    throw error;
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey,
      timeout: REQUEST_TIMEOUT_MS,
      maxRetries: 0
    });
  }

  return openai;
}

function isRetryableError(error) {
  if (error.code === "OPENAI_API_KEY_MISSING") {
    return false;
  }

  if (
    error.name === "APIConnectionError" ||
    error.name === "APIConnectionTimeoutError"
  ) {
    return true;
  }

  const status = error.status;

  if (status === 408 || status === 409) {
    return true;
  }

  if (status === 429) {
    // Una cuota agotada no se resuelve repitiendo la solicitud.
    return error.code !== "insufficient_quota";
  }

  return [500, 502, 503, 504].includes(status);
}

function getRetryDelay(error, attempt) {
  if (error.status === 429) {
    const retryAfter = error.headers?.get?.("retry-after");

    if (retryAfter !== undefined && retryAfter !== null) {
      const seconds = Number(retryAfter);

      if (Number.isFinite(seconds) && seconds >= 0) {
        const delayMs = seconds * 1000;

        // No esperamos indefinidamente ni excedemos nuestro máximo.
        if (delayMs > MAX_RETRY_AFTER_MS) {
          return null;
        }

        return delayMs;
      }

      const retryDate = Date.parse(retryAfter);

      if (!Number.isNaN(retryDate)) {
        const delayMs = Math.max(0, retryDate - Date.now());

        if (delayMs > MAX_RETRY_AFTER_MS) {
          return null;
        }

        return delayMs;
      }
    }
  }

  return INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1);
}

function wait(milliseconds, signal) {
  return new Promise((resolve, reject) => {

    // 1. Comprobar si la operación ya fue cancelada
    if (signal?.aborted) {
      return reject(
        signal.reason ?? createGlobalTimeoutError()
      );
    }

    // 2. Crear el temporizador de espera
    const timeout = setTimeout(() => {
      cleanup();
      resolve();
    }, milliseconds);

    // 3. Función para limpiar los recursos
    function cleanup() {
      clearTimeout(timeout);

      signal?.removeEventListener("abort", handleAbort);
    }

    // 4. Manejar la cancelación
    function handleAbort() {
      cleanup();

      reject(
        signal.reason ?? createGlobalTimeoutError()
      );
    }

    // 5. Escuchar la señal de cancelación
    signal?.addEventListener("abort", handleAbort, {
      once: true
    });
  });
}

async function generateText(
  prompt,
  maxOutputTokens,
  clientOverride,
  options = {}
) {
  const client = clientOverride ?? getClient();

  // 1. Establecer el límite global
 const globalTimeoutMs =
  options.globalTimeoutMs ?? GLOBAL_TIMEOUT_MS;

const startTime = Date.now();
const deadline = startTime + globalTimeoutMs;

  // 2. Crear un controlador para toda la operación
  const controller = new AbortController();

  // 3. Programar la cancelación global
 const globalTimeout = setTimeout(() => {
  controller.abort(createGlobalTimeoutError());
}, globalTimeoutMs);

  try {
    // 4. Ejecutar los intentos
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const remainingTime = deadline - Date.now();

      if (remainingTime <= 0 || controller.signal.aborted) {
        throw createGlobalTimeoutError();
      }

      try {
        // 5. Solicitar la generación a OpenAI
        const response = await client.responses.create(
          {
            model: MODEL,
            input: prompt,
            max_output_tokens: maxOutputTokens
          },
          {
            timeout: Math.min(
              REQUEST_TIMEOUT_MS,
              remainingTime
            ),
            signal: controller.signal
          }
        );

        // 6. Comprobar que la operación terminó dentro del plazo
        if (
          controller.signal.aborted ||
          Date.now() >= deadline
        ) {
          throw createGlobalTimeoutError();
        }

        // 7. Devolver la respuesta
        return {
          answer: response.output_text,
          model: response.model,
          status: response.status,
          incompleteDetails: response.incomplete_details,
          usage: response.usage
        };

      } catch (error) {

        // 8. No reintentar si se agotó el tiempo global
        if (
          controller.signal.aborted ||
          error.code === "GLOBAL_TIMEOUT" ||
          Date.now() >= deadline
        ) {
          throw createGlobalTimeoutError();
        }

        // 9. Comprobar si el error permite otro intento
        const canRetry =
          isRetryableError(error) &&
          attempt < MAX_ATTEMPTS;

        if (!canRetry) {
          throw error;
        }

        // 10. Calcular el tiempo de espera
        const delayMs = getRetryDelay(error, attempt);

        if (delayMs === null) {
          throw error;
        }

        // 11. Comprobar si queda tiempo suficiente
        const timeRemaining = deadline - Date.now();

        if (timeRemaining <= delayMs) {
          throw createGlobalTimeoutError();
        }

        // 12. Esperar antes del siguiente intento
        await wait(delayMs, controller.signal);

        if (
          controller.signal.aborted ||
          Date.now() >= deadline
        ) {
          throw createGlobalTimeoutError();
        }
      }
    }

    throw createGlobalTimeoutError();

  } finally {
    // 13. Limpiar el temporizador independientemente del resultado
    clearTimeout(globalTimeout);
  }
}  

function createGlobalTimeoutError() {
  const error = new Error(
    "Se agotó el tiempo máximo de la operación."
  );

  error.code = "GLOBAL_TIMEOUT";
  error.name = "GlobalTimeoutError";

  return error;
}


module.exports = {
  generateText
};

