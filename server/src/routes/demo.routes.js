const express = require("express");

const router = express.Router();

const MAX_PROMPT_LENGTH = 4000;

router.post("/", (req, res) => {
// 1. Comprobar si el modo demostración está habilitado
if (process.env.DEMO_ENABLED !== "true") {
return res.status(403).json({
success: false,
error: {
code: "DEMO_DISABLED",
message: "El modo demostración está deshabilitado."
}
});
}

// 2. Obtener el prompt
const { prompt } = req.body ?? {};

// 3. Validar que prompt sea una cadena
if (typeof prompt !== "string") {
return res.status(400).json({
success: false,
error: {
code: "INVALID_PROMPT",
message: "El campo prompt es obligatorio y debe ser texto."
}
});
}

// 4. Validar que prompt no esté vacío
if (!prompt.trim()) {
return res.status(400).json({
success: false,
error: {
code: "EMPTY_PROMPT",
message: "El prompt no puede estar vacío."
}
});
}

// 5. Validar longitud máxima
if (prompt.length > MAX_PROMPT_LENGTH) {
return res.status(400).json({
success: false,
error: {
code: "PROMPT_TOO_LONG",
message: `El prompt no puede superar los ${MAX_PROMPT_LENGTH} caracteres.`
}
});
}

// 6. Generar respuesta simulada
const answer = `
Esta es una respuesta simulada del modo demostración.


Tu prompt fue: "${prompt}"

El modo Demo permite probar la interfaz sin consumir servicios de IA externos.


`;

// 7. Devolver respuesta
return res.status(200).json({
success: true,
mode: "demo",
answer,
model: "Demo Model",
latencyMs: 0,
usage: {
input_tokens: 0,
output_tokens: 0,
total_tokens: 0
},
source: "simulated_response"
});
});

module.exports = router;
