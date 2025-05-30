// netlify/functions/getGPT.js

exports.handler = async function (event, context) {
  const OPENAI_KEY = process.env.OPENAI_KEY;
  const message    = event.queryStringParameters.message;
  const spoonMsg   = event.queryStringParameters.info;

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a colonoscopy diet assistant. Be strict but kind." },
            { role: "user", content: `User asked: "${message}". Spoonacular said: "${spoonMsg}". Reply with ✅ or ❌ and a short reason.` }
          ]
        })
      }
    );

    const data = await response.json();
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("❌ OpenAI proxy error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OpenAI proxy error" }),
    };
  }
};
