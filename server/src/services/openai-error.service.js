function classifyOpenAIError(error) {
  // 1. Error de configuración local
  if (error.code === "OPENAI_API_KEY_MISSING") {
    return {
      status: 500,
      code: "AI_CONFIGURATION_ERROR",
      message: "El servicio de IA no está configurado correctamente."
    };
  }

  // 2. Tiempo de espera agotado
  if (
    error.code === "GLOBAL_TIMEOUT" ||
    error.name === "GlobalTimeoutError" ||
    error.name === "APIConnectionTimeoutError" ||
    error.code === "ETIMEDOUT"
  ) {
    return {
      status: 504,
      code: "AI_TIMEOUT",
      message: "El proveedor de IA tardó demasiado en responder."
    };
  }

  // 3. Problemas de conexión
  if (
    error.name === "APIConnectionError" ||
    error.code === "ECONNRESET" ||
    error.code === "ECONNREFUSED" ||
    error.code === "ENOTFOUND"
  ) {
    return {
      status: 503,
      code: "AI_PROVIDER_UNAVAILABLE",
      message: "No fue posible establecer conexión con el proveedor de IA."
    };
  }

  // 4. Errores HTTP devueltos por OpenAI
  switch (error.status) {
    case 400:
      return {
        status: 400,
        code: "AI_INVALID_REQUEST",
        message: "El proveedor de IA rechazó los parámetros de la solicitud."
      };

    case 401:
      return {
        status: 502,
        code: "AI_AUTHENTICATION_FAILED",
        message: "No fue posible autenticar la solicitud ante el proveedor de IA."
      };

    case 403:
      return {
        status: 502,
        code: "AI_PERMISSION_DENIED",
        message: "La cuenta no tiene permiso para realizar esta operación."
      };

    case 404:
      return {
        status: 502,
        code: "AI_RESOURCE_NOT_FOUND",
        message: "El modelo o recurso solicitado no está disponible."
      };

    case 408:
      return {
        status: 504,
        code: "AI_TIMEOUT",
        message: "La solicitud al proveedor de IA agotó el tiempo de espera."
      };

    case 429: {
      const errorCode = error.code || error.error?.code;
      const errorType = error.type || error.error?.type;

      if (
        errorCode === "insufficient_quota" ||
        errorType === "insufficient_quota"
      ) {
        return {
          status: 503,
          code: "AI_QUOTA_EXCEEDED",
          message: "La cuota disponible para el servicio de IA se ha agotado."
        };
      }

      return {
        status: 429,
        code: "AI_RATE_LIMITED",
        message: "Se alcanzó un límite de solicitudes al proveedor de IA."
      };
    }

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        status: 503,
        code: "AI_PROVIDER_UNAVAILABLE",
        message: "El proveedor de IA presenta un problema temporal."
      };

    default:
      return {
        status: 502,
        code: "AI_PROVIDER_ERROR",
        message: "No fue posible obtener una respuesta del proveedor de IA."
      };
  }
}

module.exports = {
  classifyOpenAIError
};

