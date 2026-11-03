const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const express = require("express");
const createAiRouter = require("../src/routes/ai.routes");

async function createTestServer(generateTextFunction) {
  const app = express();

  app.use(express.json());

  app.use(
    "/api/ai",
    createAiRouter(generateTextFunction)
  );

  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      })
  };
}

test("devuelve una respuesta exitosa cuando la generación funciona", async () => {
  const previousValue = process.env.AI_LIVE_ENABLED;
  process.env.AI_LIVE_ENABLED = "true";

  const generateTextMock = async (prompt, maxOutputTokens) => {
    assert.equal(prompt, "Explica qué es una API.");
    assert.equal(maxOutputTokens, 100);

    return {
      answer: "Una API permite la comunicación entre aplicaciones.",
      model: "modelo-simulado",
      status: "completed",
      incompleteDetails: null,
      usage: {
        input_tokens: 10,
        output_tokens: 8,
        total_tokens: 18
      }
    };
  };

  const server = await createTestServer(generateTextMock);

  try {
    const response = await fetch(
      `${server.baseUrl}/api/ai/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: "Explica qué es una API.",
          maxOutputTokens: 100
        })
      }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.mode, "live");
    assert.equal(
      body.answer,
      "Una API permite la comunicación entre aplicaciones."
    );
    assert.equal(body.model, "modelo-simulado");
    assert.equal(body.status, "completed");
    assert.equal(body.incompleteDetails, null);
    assert.equal(body.usage.total_tokens, 18);
    assert.equal(typeof body.latencyMs, "number");
  } finally {
    await server.close();

    if (previousValue === undefined) {
      delete process.env.AI_LIVE_ENABLED;
    } else {
      process.env.AI_LIVE_ENABLED = previousValue;
    }
  }
});


test("devuelve un error de autenticación cuando OpenAI rechaza la clave", async () => {
  const previousValue = process.env.AI_LIVE_ENABLED;
  process.env.AI_LIVE_ENABLED = "true";

  const generateTextMock = async () => {
    const error = new Error("Error simulado de autenticación");
    error.status = 401;

    throw error;
  };

  const server = await createTestServer(generateTextMock);

  try {
    const response = await fetch(
      `${server.baseUrl}/api/ai/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: "Prueba de autenticación"
        })
      }
    );

    const body = await response.json();

    assert.equal(response.status, 502);
    assert.equal(body.success, false);
    assert.equal(body.mode, "live");
    assert.equal(
      body.error.code,
      "AI_AUTHENTICATION_FAILED"
    );
  } finally {
    await server.close();

    if (previousValue === undefined) {
      delete process.env.AI_LIVE_ENABLED;
    } else {
      process.env.AI_LIVE_ENABLED = previousValue;
    }
  }
});

test("devuelve un error de cuota agotada", async () => {
  const previousValue = process.env.AI_LIVE_ENABLED;
  process.env.AI_LIVE_ENABLED = "true";

  const generateTextMock = async () => {
    const error = new Error("Error simulado de cuota");
    error.status = 429;
    error.code = "insufficient_quota";

    throw error;
  };

  const server = await createTestServer(generateTextMock);

  try {
    const response = await fetch(
      `${server.baseUrl}/api/ai/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: "Prueba de cuota"
        })
      }
    );

    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.success, false);
    assert.equal(
      body.error.code,
      "AI_QUOTA_EXCEEDED"
    );
  } finally {
    await server.close();

    if (previousValue === undefined) {
      delete process.env.AI_LIVE_ENABLED;
    } else {
      process.env.AI_LIVE_ENABLED = previousValue;
    }
  }
});

test("no llama al servicio cuando la IA real está desactivada", async () => {
  const previousValue = process.env.AI_LIVE_ENABLED;
  process.env.AI_LIVE_ENABLED = "false";

  let serviceCalled = false;

  const generateTextMock = async () => {
    serviceCalled = true;

    return {
      answer: "Esta respuesta no debería generarse."
    };
  };

  const server = await createTestServer(generateTextMock);

  try {
    const response = await fetch(
      `${server.baseUrl}/api/ai/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: "Prueba con IA desactivada"
        })
      }
    );

    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.success, false);
    assert.equal(
      body.error.code,
      "LIVE_AI_DISABLED"
    );
    assert.equal(serviceCalled, false);
  } finally {
    await server.close();

    if (previousValue === undefined) {
      delete process.env.AI_LIVE_ENABLED;
    } else {
      process.env.AI_LIVE_ENABLED = previousValue;
    }
  }
});

