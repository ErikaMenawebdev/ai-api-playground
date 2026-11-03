const test = require("node:test");
const assert = require("node:assert/strict");

const {
  classifyOpenAIError
} = require("../src/services/openai-error.service");

test("clasifica una clave API ausente", () => {
  const result = classifyOpenAIError({
    code: "OPENAI_API_KEY_MISSING"
  });

  assert.equal(result.status, 500);
  assert.equal(result.code, "AI_CONFIGURATION_ERROR");
});

test("clasifica una clave API inválida", () => {
  const result = classifyOpenAIError({
    status: 401
  });

  assert.equal(result.status, 502);
  assert.equal(result.code, "AI_AUTHENTICATION_FAILED");
});

test("clasifica una cuota agotada", () => {
  const result = classifyOpenAIError({
    status: 429,
    code: "insufficient_quota"
  });

  assert.equal(result.status, 503);
  assert.equal(result.code, "AI_QUOTA_EXCEEDED");
});

test("clasifica un límite de solicitudes", () => {
  const result = classifyOpenAIError({
    status: 429,
    code: "rate_limit_exceeded"
  });

  assert.equal(result.status, 429);
  assert.equal(result.code, "AI_RATE_LIMITED");
});

test("clasifica un tiempo de espera agotado", () => {
  const result = classifyOpenAIError({
    name: "APIConnectionTimeoutError"
  });

  assert.equal(result.status, 504);
  assert.equal(result.code, "AI_TIMEOUT");
});

test("clasifica un error de conexión", () => {
  const result = classifyOpenAIError({
    name: "APIConnectionError"
  });

  assert.equal(result.status, 503);
  assert.equal(result.code, "AI_PROVIDER_UNAVAILABLE");
});

test("clasifica un error temporal del proveedor", () => {
  const result = classifyOpenAIError({
    status: 503
  });

  assert.equal(result.status, 503);
  assert.equal(result.code, "AI_PROVIDER_UNAVAILABLE");
});

test("clasifica un error inesperado", () => {
  const result = classifyOpenAIError({
    name: "UnexpectedError"
  });

  assert.equal(result.status, 502);
  assert.equal(result.code, "AI_PROVIDER_ERROR");
});

test("clasifica un timeout del SDK de OpenAI", () => {
  const error = new Error("Request timed out");
  error.name = "APIConnectionTimeoutError";

  const result = classifyOpenAIError(error);

  assert.equal(result.status, 504);
  assert.equal(result.code, "AI_TIMEOUT");
});
