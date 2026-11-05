const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT || 4173);
const staticFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/manifest.webmanifest", ["manifest.webmanifest", "application/manifest+json"]],
  ["/config.js", ["config.js", "text/javascript; charset=utf-8"]],
  ["/sw.js", ["sw.js", "text/javascript; charset=utf-8"]],
  ["/icon.svg", ["icon.svg", "image/svg+xml"]],
  ["/images/arranjo-peonias.jpg", ["images/arranjo-peonias.jpg", "image/jpeg"]],
  ["/images/arranjo-pastel.jpg", ["images/arranjo-pastel.jpg", "image/jpeg"]],
  ["/images/arranjo-silvestre.jpg", ["images/arranjo-silvestre.jpg", "image/jpeg"]],
  ["/images/arranjo-rustico.jpg", ["images/arranjo-rustico.jpg", "image/jpeg"]],
  ["/images/arranjo-zen.jpg", ["images/arranjo-zen.jpg", "image/jpeg"]],
  ["/images/arranjo-orquideas.jpg", ["images/arranjo-orquideas.jpg", "image/jpeg"]],
]);

function sendJson(res, status, value) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(value));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 8 * 1024 * 1024) {
        if (!tooLarge) reject(Object.assign(new Error("Body too large"), { status: 413 }));
        tooLarge = true;
        return;
      }
      if (!tooLarge) chunks.push(chunk);
    });
    req.on("end", () => {
      if (tooLarge) return;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

async function askGemini(req, res) {
  const allowedOrigins = new Set([
    `http://127.0.0.1:${port}`,
    `http://localhost:${port}`,
  ]);
  if (!allowedOrigins.has(req.headers.origin)) {
    return sendJson(res, 403, { error: "Pedido de origem não permitida." });
  }
  if (!req.headers["content-type"]?.startsWith("application/json")) {
    return sendJson(res, 415, { error: "O pedido tem de ser JSON." });
  }
  if (!process.env.GEMINI_API_KEY) {
    return sendJson(res, 500, { error: "Define GEMINI_API_KEY no ficheiro .env." });
  }

  try {
    const body = await readBody(req);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return sendJson(res, 400, { error: "Pedido inválido." });
    }
    const { turns, image } = body;
    if (!Array.isArray(turns) || turns.length === 0 ||
        turns.some((turn) =>
          !turn || !["user", "assistant"].includes(turn.role) ||
          typeof turn.content !== "string"
        )) {
      return sendJson(res, 400, { error: "Mensagens inválidas." });
    }

    const contents = turns.map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content }],
    }));

    if (image && image.data) {
      if (typeof image.data !== "string") {
        return sendJson(res, 400, { error: "Imagem inválida." });
      }
      contents[contents.length - 1].parts.push({
        inlineData: { mimeType: image.mime || "image/jpeg", data: image.data },
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents,
          generationConfig: { maxOutputTokens: 700 },
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return sendJson(res, response.status, {
        error: data.error?.message || "A API Gemini não conseguiu responder.",
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") || "";
    return sendJson(res, 200, { text });
  } catch (error) {
    if (error.status) return sendJson(res, error.status, { error: error.message });
    console.error("Erro ao contactar a API Gemini:", error.message);
    return sendJson(res, 502, { error: "Não foi possível contactar a API Gemini." });
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "POST" && url.pathname === "/api/ask") {
    askGemini(req, res);
    return;
  }

  const file = staticFiles.get(url.pathname);
  if (req.method !== "GET" || !file) {
    sendJson(res, 404, { error: "Não encontrado." });
    return;
  }

  fs.readFile(path.join(__dirname, file[0]), (error, contents) => {
    if (error) {
      sendJson(res, 500, { error: "Não foi possível carregar a app." });
      return;
    }
    res.writeHead(200, {
      "content-type": file[1],
      "cache-control": "no-cache",
      "x-content-type-options": "nosniff",
    });
    res.end(contents);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`App disponível em http://127.0.0.1:${port}`);
});
