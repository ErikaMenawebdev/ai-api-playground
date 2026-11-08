const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const generateAIResponse = async (prompt, mode) => {
// Seleccionar el endpoint según el modo
const endpoint =
mode === "demo"
? `${API_URL}/demo`
: `${API_URL}/ai/generate`;

// Enviar solicitud al backend
const response = await fetch(endpoint, {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
prompt,
maxOutputTokens: 1000
})
});

// Convertir la respuesta a JSON
const data = await response.json();

// Comprobar si el backend devolvió un error
if (!response.ok) {
throw new Error(
data.error?.message || "An error occurred while generating the response."
);
}

return data;
};
