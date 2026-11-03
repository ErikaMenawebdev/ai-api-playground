const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const app = require("../src/app");

async function createTestServer() {
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

test("GET /api/health devuelve el estado del servidor", async () => {
  const server = await createTestServer();

  try {
    const response = await fetch(
      `${server.baseUrl}/api/health`
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(
      body.message,
      "AI API Playground backend funcionando correctamente"
    );
  } finally {
    await server.close();
  }
});

test("GET /api/config devuelve la configuración", async () => {
  const server = await createTestServer();

  try {
    const response = await fetch(
      `${server.baseUrl}/api/config`
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(typeof body.demoEnabled, "boolean");
    assert.equal(typeof body.liveAIEnabled, "boolean");
    assert.equal(typeof body.streamingEnabled, "boolean");
  } finally {
    await server.close();
  }
});

test("POST /api/demo devuelve un ejemplo preparado", async () => {
  const previousValue = process.env.DEMO_ENABLED;
  process.env.DEMO_ENABLED = "true";

  const server = await createTestServer();

  try {
    const response = await fetch(
      `${server.baseUrl}/api/demo`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          exampleId: "what-is-an-ai-api"
        })
      }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.mode, "demo");
    assert.equal(body.source, "prepared_example");
    assert.equal(typeof body.answer, "string");
  } finally {
    await server.close();

    if (previousValue === undefined) {
      delete process.env.DEMO_ENABLED;
    } else {
      process.env.DEMO_ENABLED = previousValue;
    }
  }
});

test("POST /api/demo devuelve 404 si el ejemplo no existe", async () => {
  const previousValue = process.env.DEMO_ENABLED;
  process.env.DEMO_ENABLED = "true";

  const server = await createTestServer();

  try {
    const response = await fetch(
      `${server.baseUrl}/api/demo`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          exampleId: "example-does-not-exist"
        })
      }
    );

    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.success, false);
    assert.equal(
      body.error.code,
      "EXAMPLE_NOT_FOUND"
    );
  } finally {
    await server.close();

    if (previousValue === undefined) {
      delete process.env.DEMO_ENABLED;
    } else {
      process.env.DEMO_ENABLED = previousValue;
    }
  }
});

test("devuelve una respuesta JSON cuando la ruta no existe", async () => {
  const server = await createTestServer();

  try {
    const response = await fetch(
      `${server.baseUrl}/api/usuarios`
    );

    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.success, false);
    assert.equal(
      body.error.code,
      "ROUTE_NOT_FOUND"
    );
  } finally {
    await server.close();
  }
});

test("CORS permite solicitudes desde el frontend autorizado", async () => {
  const server = await createTestServer();

  try {
    const response = await fetch(
      `${server.baseUrl}/api/health`,
      {
        method: "GET",
        headers: {
          Origin: "http://localhost:5173"
        }
      }
    );

    assert.equal(response.status, 200);

    assert.equal(
      response.headers.get("access-control-allow-origin"),
      "http://localhost:5173"
    );
  } finally {
    await server.close();
  }
});

test("devuelve 400 cuando recibe un JSON malformado", async () => {
  const server = await createTestServer();

  try {
    const response = await fetch(
      `${server.baseUrl}/api/ai/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: '{"prompt":"Prueba de JSON malformado",}'
      }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.error.code, "INVALID_JSON");

    assert.equal(
      body.error.message,
      "El cuerpo de la solicitud contiene un JSON inválido."
    );
  } finally {
    await server.close();
  }
});