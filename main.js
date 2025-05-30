// main.js (Frontend UI Logic)

// ————————————————————————————————————————————————————————————
// 1) Spoonacular lookup via Netlify Function
//    This function sends the user's query to our serverless function
//    which proxies to Spoonacular, avoiding CORS and hiding our key.
async function checkFoodWithSpoonacular(query) {
  try {
    // Fetch from our Netlify function, passing the query as a URL parameter
    const res  = await fetch(
      `/.netlify/functions/checkFood?query=${encodeURIComponent(query)}`
    );

    // Parse the JSON response (an array of ingredient matches)
    const data = await res.json();
    console.log("✅ Spoonacular response via Netlify:", data);

    // If Spoonacular found a match, return a user-friendly message
    if (data.length > 0) {
      return `I found a match for "${data[0].name}". Let me check if it's colonoscopy-safe...`;
    } else {
      // No match found
      return `I couldn’t find that food in the Spoonacular database. Please try a different item.`;
    }
  } catch (err) {
    // Log error and inform the user
    console.error("Spoonacular proxy error:", err);
    return "There was a problem checking that food. Try again shortly.";
  }
}

// ————————————————————————————————————————————————————————————
// 2) AI reply via Netlify Function
//    This function calls our OpenAI proxy with both the original
//    user message and the Spoonacular lookup result.
async function getGPTReply(message) {
  try {
    // First get the Spoonacular lookup
    const spoonacularMsg = await checkFoodWithSpoonacular(message);

    // Then call our OpenAI proxy function with both pieces of info
    const res  = await fetch(
      `/.netlify/functions/getGPT?message=${encodeURIComponent(message)}` +
      `&info=${encodeURIComponent(spoonacularMsg)}`
    );
    console.log(`🌐 OpenAI proxy status: ${res.status} ${res.statusText}`);

    // Parse and log the AI's JSON response
    const data = await res.json();
    console.log("🤖 OpenAI proxy response body:", data);

    // Handle non-200 status codes (errors)
    if (res.status !== 200) {
      const errMsg = data.error?.message || "Unknown error from AI service";
      return `Error: ${errMsg}`;
    }

    // Safely extract the assistant's reply
    return data.choices?.[0]?.message?.content
         || "OpenAI didn’t return a valid answer.";
  } catch (err) {
    // Network or parsing error
    console.error("Fetch error contacting OpenAI proxy:", err);
    return "There was a problem contacting the AI service.";
  }
}

// ————————————————————————————————————————————————————————————
// 3) UI handler to send & display messages
function sendMessage() {
  // Grab the user input and chat display elements
  const input   = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const text    = input.value.trim();
  if (!text) return; // ignore empty submissions

  // Display the user's message in the chat
  chatBox.innerHTML += `<p><strong>You:</strong> ${text}</p>`;
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  // Show a "typing" indicator while the bot thinks
  chatBox.innerHTML += `<p><em>Bot is thinking...</em></p>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  // Fetch the bot's reply and render it
  getGPTReply(text).then(reply => {
    // Remove the "thinking" line
    chatBox.innerHTML = chatBox.innerHTML.replace(
      /<p><em>Bot is thinking\.\.\.<\/em><\/p>/,
      ""
    );
    // Append the bot's actual reply
    chatBox.innerHTML += `<p><strong>Bot:</strong> ${reply}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Make sendMessage() available to the HTML button's onclick
window.sendMessage = sendMessage;