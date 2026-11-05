// netlify/functions/ask.js
//
// Recebe as mensagens do chat da app e pergunta à API gratuita do
// Google Gemini, usando uma chave guardada em segredo nas variáveis
// de ambiente do Netlify (nunca no código nem no navegador).
//
// Configuração necessária:
//   1. Vai a https://aistudio.google.com/apikey e cria uma chave gratuita
//      (não pede cartão de crédito).
//   2. No painel do Netlify: Site settings → Environment variables →
//      adiciona GEMINI_API_KEY com essa chave.

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let turns, image;
  try {
    ({ turns, image } = JSON.parse(event.body || "{}"));
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "corpo inválido" }) };
  }
  if (!Array.isArray(turns) || turns.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "faltam mensagens" }) };
  }

  if (!process.env.GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "GEMINI_API_KEY não está configurada no site" }),
    };
  }

  // Converte o formato do chat (role: user/assistant) para o formato do Gemini (role: user/model)
  const contents = turns.map((t) => ({
    role: t.role === "assistant" ? "model" : "user",
    parts: [{ text: t.content }],
  }));

  if (image && image.data) {
    contents[contents.length - 1].parts.push({
      inlineData: { mimeType: image.mime || "image/jpeg", data: image.data },
    });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: { maxOutputTokens: 700 },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: data }) };
    }
    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
