// netlify/functions/checkFood.js

exports.handler = async function (event, context) {
  const SPOONACULAR_KEY = process.env.SPOONACULAR_KEY;
  const query = event.queryStringParameters.query;
  const url =
    `https://api.spoonacular.com/food/ingredients/autocomplete` +
    `?query=${encodeURIComponent(query)}` +
    `&number=1&apiKey=${encodeURIComponent(SPOONACULAR_KEY)}`;

  try {
    const response = await fetch(url);        // global fetch
    const data     = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("❌ Spoonacular proxy error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Spoonacular proxy error" }),
    };
  }
};
