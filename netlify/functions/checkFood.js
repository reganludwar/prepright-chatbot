  //Spoonacular API Key
  const SPOONACULAR_KEY = "c1bf144f11ad470bb0c366755f71b6b4";
  const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const query = event.queryStringParameters.query;
  const url = `https://api.spoonacular.com/food/ingredients/autocomplete?query=${encodeURIComponent(query)}&number=1&apiKey=${SPOONACULAR_KEY}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    console.log("🍽️ Spoonacular raw response:", text);

    const data = JSON.parse(text);
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("❌ Spoonacular proxy error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Spoonacular proxy error" })
    };
  }
};
