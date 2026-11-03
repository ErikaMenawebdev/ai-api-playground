# AI API Playground

Laboratorio de desarrollo e integración de aplicaciones con modelos de inteligencia artificial mediante APIs.

AI API Playground es un proyecto desarrollado con Node.js y Express que permite experimentar con la integración de modelos de lenguaje (LLM) mediante la API de OpenAI.

El proyecto implementa dos modalidades de funcionamiento: un modo de demostración con respuestas preparadas y un modo Live que permite realizar solicitudes reales al modelo de inteligencia artificial.

## Características principales

* Integración con OpenAI mediante su SDK oficial para Node.js.
* Generación de texto mediante la Responses API.
* Modo Demo con respuestas predefinidas.
* Modo Live con solicitudes reales al modelo.
* Validación de solicitudes y parámetros.
* Manejo centralizado de errores.
* Clasificación de errores del proveedor.
* Reintentos automáticos ante errores temporales.
* Control de tiempo máximo de ejecución (Global Timeout).
* Cancelación de solicitudes mediante AbortController.
* Configuración de CORS.
* Pruebas automatizadas con Node.js Test Runner.

## Stack tecnológico

| Tecnología           | Uso                              |
| -------------------- | -------------------------------- |
| Node.js              | Entorno de ejecución             |
| Express 5            | Framework backend                |
| OpenAI SDK           | Integración con modelos de IA    |
| OpenAI Responses API | Generación de respuestas         |
| JavaScript           | Lenguaje de programación         |
| dotenv               | Gestión de variables de entorno  |
| cors                 | Control de acceso entre orígenes |
| Node.js Test Runner  | Pruebas automatizadas            |
| Git y GitHub         | Control de versiones             |

## Arquitectura del proyecto

```text
ai-api-playground/
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── ai.routes.js
│   │   │   └── demo.routes.js
│   │   │
│   │   ├── services/
│   │   │   ├── openai.service.js
│   │   │   └── openai-error.service.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests/
│   │   ├── ai.routes.test.js
│   │   ├── app.test.js
│   │   ├── openai-error.test.js
│   │   ├── openai-sdk-cancellation.test.js
│   │   └── openai-service.test.js
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

### Organización de responsabilidades

**Routes**

Gestionan los endpoints, reciben las solicitudes HTTP y devuelven las respuestas al cliente.

**Services**

Contienen la lógica de integración con OpenAI, los mecanismos de reintento y la clasificación de errores.

**app.js**

Configura Express, los middleware, CORS y las rutas de la aplicación.

**server.js**

Carga la configuración e inicia el servidor HTTP.

**Tests**

Contienen las pruebas automatizadas para verificar el comportamiento de los componentes y las rutas.

## Requisitos previos

Para ejecutar el proyecto necesitas:

* Node.js.
* npm.
* Una cuenta de OpenAI.
* Una API Key de OpenAI para utilizar el modo Live.

## Instalación

Clona el repositorio:

```bash
git clone https://github.com/ErikaMenawebdev/ai-api-playground.git
```

Entra en la carpeta del backend:

```bash
cd ai-api-playground/server
```

Instala las dependencias:

```bash
npm install
```

Crea el archivo `.env` utilizando `.env.example` como plantilla.

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Configura las variables de entorno.

## Variables de entorno

El backend utiliza las siguientes variables:

| Variable          | Descripción                              | Valor de ejemplo      |
| ----------------- | ---------------------------------------- | --------------------- |
| PORT              | Puerto del servidor                      | 3000                  |
| DEMO_ENABLED      | Habilita el modo demostración            | true                  |
| AI_LIVE_ENABLED   | Habilita las solicitudes reales a OpenAI | false                 |
| STREAMING_ENABLED | Configuración de streaming               | false                 |
| FRONTEND_URL      | Origen autorizado del frontend           | http://localhost:5173 |
| OPENAI_API_KEY    | Credencial de acceso a OpenAI            | Tu API Key            |

La API Key debe configurarse únicamente en el archivo `.env`.

No publiques este archivo en GitHub.

## Ejecución

Para iniciar el servidor:

```bash
npm start
```

El backend estará disponible en:

```text
http://localhost:3000
```

## API REST

### 1. Health Check

Comprueba que el servidor esté funcionando.

**Endpoint:**

```http
GET /api/health
```

### 2. Configuración

Consulta el estado de las funcionalidades habilitadas.

**Endpoint:**

```http
GET /api/config
```

### 3. Modo demostración

Obtiene una respuesta preparada mediante un identificador de ejemplo.

**Endpoint:**

```http
POST /api/demo
```

Ejemplo de solicitud:

```json
{
  "exampleId": "what-is-an-ai-api"
}
```

Identificadores disponibles:

* `what-is-an-ai-api`
* `what-is-a-prompt`

### 4. Generación de texto con OpenAI

Envía un prompt al modelo de inteligencia artificial y devuelve su respuesta.

**Endpoint:**

```http
POST /api/ai/generate
```

Ejemplo de solicitud:

```json
{
  "prompt": "Explica en una sola frase qué es una API.",
  "maxOutputTokens": 100
}
```

El parámetro `maxOutputTokens` es opcional. Su valor predeterminado es 300 y admite valores entre 1 y 1000.

Esta funcionalidad requiere que `AI_LIVE_ENABLED=true` y que la API Key esté configurada correctamente.

## Manejo de errores y resiliencia

El servicio de integración con OpenAI incorpora mecanismos para mejorar la tolerancia a fallos:

* Clasificación de errores de autenticación, cuota, conexión y disponibilidad.
* Reintentos automáticos ante errores temporales.
* Backoff exponencial.
* Interpretación del encabezado Retry-After.
* Límite de intentos.
* Timeout individual de solicitudes.
* Timeout global de la operación.
* Cancelación mediante AbortController.

Estos mecanismos permiten controlar situaciones en las que el proveedor de IA no responde o presenta errores temporales.

## Pruebas automatizadas

El proyecto utiliza el Test Runner nativo de Node.js.

Para ejecutar todas las pruebas:

```bash
npm test
```

Para ejecutar una batería específica:

```bash
node --test tests/app.test.js
```

Estado de las pruebas durante la preparación de esta versión:

* 28 pruebas ejecutadas.
* 28 pruebas superadas.
* 0 pruebas fallidas.

## Seguridad

El proyecto incorpora las siguientes medidas:

* Variables sensibles almacenadas en `.env`.
* Exclusión de credenciales mediante `.gitignore`.
* Plantilla `.env.example` sin credenciales reales.
* Validación de entradas.
* Manejo centralizado de errores.
* Configuración de CORS.
* Auditoría de dependencias mediante npm.

Última auditoría de dependencias:

```text
0 vulnerabilities
```

## Mejoras futuras

Las siguientes funcionalidades están contempladas para próximas etapas:

* Desarrollo de una interfaz frontend con React.
* Implementación de respuestas mediante streaming.
* Ampliación del laboratorio con diferentes modelos de IA.
* Incorporación de nuevas funcionalidades para experimentar con prompts y parámetros.
* Despliegue de una demostración pública.

## Autora

**Erika Mena Moreno**

Tecnóloga en Desarrollo Multimedia y Web.

Proyecto personal de aprendizaje y experimentación en integración de inteligencia artificial, desarrollo backend y AI Engineering.

GitHub: [@ErikaMenawebdev](https://github.com/ErikaMenawebdev)
