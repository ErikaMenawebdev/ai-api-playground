const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const OpenAI = require("openai");

const { generateText } = require("../src/services/openai.service");

test("el SDK real de OpenAI cancela una solicitud HTTP pendiente", async () => {
let requestReceived = false;
let resolveConnectionClosed;

const connectionClosed = new Promise((resolve) => {
resolveConnectionClosed = resolve;
});

const server = http.createServer((req, res) => {
requestReceived = true;

req.socket.once("close", () => {
  resolveConnectionClosed(true);
});

req.resume();

// Simulamos un proveedor que nunca responde.


});

await new Promise((resolve) => {
server.listen(0, "127.0.0.1", resolve);
});

const port = server.address().port;

const client = new OpenAI({
apiKey: "test-api-key",
baseURL: `http://127.0.0.1:${port}/v1`,
maxRetries: 0
});

try {
await assert.rejects(
generateText(
"Prueba de cancelación con SDK real",
100,
client,
{ globalTimeoutMs: 150 }
),
(error) => {
assert.equal(error.code, "GLOBAL_TIMEOUT");
return true;
}
);


assert.equal(
  requestReceived,
  true,
  "El servidor local debería haber recibido la solicitud."
);

const closed = await Promise.race([
  connectionClosed,
  new Promise((resolve) => setTimeout(() => resolve(false), 1000))
]);

assert.equal(
  closed,
  true,
  "El socket TCP debería haberse cerrado por la cancelación."
);


} finally {
server.closeAllConnections();

await new Promise((resolve) => {
  server.close(resolve);
});


}
});
