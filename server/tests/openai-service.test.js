const test = require("node:test");
const assert = require("node:assert/strict");

const { generateText } = require("../src/services/openai.service");

function createResponse() {
  return {
    output_text: "Respuesta de prueba",
    model: "gpt-6-luna",
    status: "completed",
    incomplete_details: null,
    usage: {
      input_tokens: 10,
      output_tokens: 5,
      total_tokens: 15
    }
  };
}

function createClientMock(implementation) {
  let calls = 0;

  return {
    client: {
      responses: {
        create: async (...args) => {
          calls++;
          return implementation(...args);
        }
      }
    },
    getCalls: () => calls
  };
}

test("reintenta un error temporal y devuelve la respuesta exitosa", async () => {
  const mock = createClientMock(async () => {
    if (mock.getCalls() === 1) {
      const error = new Error("Error temporal");
      error.status = 503;
      throw error;
    }

    return createResponse();
  });

  const result = await generateText(
    "Prueba de reintento",
    100,
    mock.client
  );

  assert.equal(mock.getCalls(), 2);
  assert.equal(result.answer, "Respuesta de prueba");
  assert.equal(result.status, "completed");
});

test("devuelve el último error después de tres intentos fallidos", async () => {
  const mock = createClientMock(async () => {
    const error = new Error("Proveedor no disponible");
    error.status = 503;
    throw error;
  });

  await assert.rejects(
    generateText("Prueba de intentos", 100, mock.client),
    (error) => {
      assert.equal(error.message, "Proveedor no disponible");
      assert.equal(error.status, 503);
      return true;
    }
  );

  assert.equal(mock.getCalls(), 3);
});

test("no reintenta un error de autenticación", async () => {
  const mock = createClientMock(async () => {
    const error = new Error("Autenticación inválida");
    error.status = 401;
    throw error;
  });

  await assert.rejects(
    generateText("Prueba de autenticación", 100, mock.client),
    (error) => {
      assert.equal(error.status, 401);
      return true;
    }
  );

  assert.equal(mock.getCalls(), 1);
});

test("no reintenta cuando la cuota está agotada", async () => {
  const mock = createClientMock(async () => {
    const error = new Error("Cuota agotada");
    error.status = 429;
    error.code = "insufficient_quota";
    throw error;
  });

  await assert.rejects(
    generateText("Prueba de cuota", 100, mock.client),
    (error) => {
      assert.equal(error.status, 429);
      assert.equal(error.code, "insufficient_quota");
      return true;
    }
  );

  assert.equal(mock.getCalls(), 1);
});

test("no reintenta si Retry-After supera el máximo permitido", async () => {
  const mock = createClientMock(async () => {
    const error = new Error("Límite de solicitudes");
    error.status = 429;
    error.code = "rate_limit_exceeded";
    error.headers = new Headers({
      "retry-after": "60"
    });

    throw error;
  });

  await assert.rejects(
    generateText("Prueba de límite", 100, mock.client),
    (error) => {
      assert.equal(error.status, 429);
      return true;
    }
  );

  assert.equal(mock.getCalls(), 1);
});

test("cancela una solicitud pendiente al agotarse el tiempo global", async () => {
  const mock = createClientMock(async (_request, options) => {
    return new Promise((resolve, reject) => {
      const signal = options.signal;

      if (signal.aborted) {
        return reject(signal.reason);
      }

      signal.addEventListener(
        "abort",
        () => reject(signal.reason),
        { once: true }
      );
    });
  });

  await assert.rejects(
    generateText(
      "Prueba de cancelación global",
      100,
      mock.client,
      { globalTimeoutMs: 50 }
    ),
    (error) => {
      assert.equal(error.code, "GLOBAL_TIMEOUT");
      return true;
    }
  );

  assert.equal(mock.getCalls(), 1);
});

test("interrumpe la pausa entre reintentos al agotarse el tiempo global", async () => {
  const mock = createClientMock(async () => {
    const error = new Error("Error temporal");
    error.status = 503;
    throw error;
  });

  await assert.rejects(
    generateText(
      "Prueba de cancelación durante la pausa",
      100,
      mock.client,
      { globalTimeoutMs: 50 }
    ),
    (error) => {
      assert.equal(error.code, "GLOBAL_TIMEOUT");
      return true;
    }
  );

  assert.equal(mock.getCalls(), 1);
});
