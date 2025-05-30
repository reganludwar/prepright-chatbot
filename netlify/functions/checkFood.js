// netlify/functions/checkFood.js
//Serverless proxy for Spoonacular

exports.handler = async function (event, context) {
  // Read our secret key from environment variables
  const SPOONACULAR_KEY = process.env.SPOONACULAR_KEY;

  // Extract the 'query' parameter from the URL
  const query = event.queryStringParameters.query;

  // Build the Spoonacular API URL securely
  const url =
    `https://api.spoonacular.com/food/ingredients/autocomplete` +
    `?query=${encodeURIComponent(query)}` +
    `&number=1&apiKey=${encodeURIComponent(SPOONACULAR_KEY)}`;

  try {
    // Use the global fetch (available in Node 18+)
    const response = await fetch(url);
    const data     = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    console.error("❌ Spoonacular proxy error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Spoonacular proxy error" }) };
  }
};