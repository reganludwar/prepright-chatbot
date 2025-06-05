// netlify/functions/getGPT.js
//Serverless proxy for OpenAI

exports.handler = async function (event, context) {
  // Read our OpenAI key from environment
  const OPENAI_KEY = process.env.OPENAI_KEY;
  const userMsg = event.queryStringParameters.message;
  const infoMsg = event.queryStringParameters.info;

  if (!OPENAI_KEY) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing OPENAI_KEY' })
    };
  }

  if (!userMsg) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing message parameter' })
    };
  }

  try {
    // Call OpenAI's Chat Completions endpoint
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a colonoscopy diet assistant. Be strict but kind. Follow these guidelines when providing responses:

2–3 Days Before: Low-Fiber Diet
  • White bread, plain white rice, refined pasta/noodles
  • Skinless, seedless fruits (bananas, applesauce)
  • Lean meats (chicken, turkey, fish)
  • Eggs, tofu, smooth nut butters
  • Clear broths and strained soups
  • Yogurt (no seeds or fruit bits)

1 Day Before: Clear-Liquid Diet
  • Water, clear sports drinks
  • Clear fruit juices (apple, white grape)
  • Clear broths (chicken, beef, vegetable)
  • Plain gelatin (no fruit pieces or dyes)
  • Tea/coffee (no cream or milk)
  • Popsicles (no pulp or dye)
Keep responses informative but short and to the point.`
            },
            {
              role: "user",
              content: `User asked: "${userMsg}". Spoonacular said: "${infoMsg}".`
            }
          ]
        })
      }
    );

    const data = await response.json();
    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('❌ OpenAI proxy error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'OpenAI proxy error' })
    };
  }
};
