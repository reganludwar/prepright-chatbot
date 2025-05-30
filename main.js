// main.js

// ————————————————————————————————————————————————————————————
// 1) Spoonacular lookup via Netlify Function
async function checkFoodWithSpoonacular(query) {
  try {
    const res  = await fetch(
      `/.netlify/functions/checkFood?query=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    console.log("✅ Spoonacular response via Netlify:", data);

    if (data.length > 0) {
      return `I found a match for "${data[0].name}". Let me check if it's colonoscopy-safe...`;
    } else {
      return `I couldn’t find that food in the Spoonacular database. Please try a different item.`;
    }
  } catch (err) {
    console.error("Spoonacular proxy error:", err);
    return "There was a problem checking that food. Try again shortly.";
  }
}

// ————————————————————————————————————————————————————————————
// 2) AI reply via Netlify Function
async function getGPTReply(message) {
  try {
    // First get the Spoonacular lookup message
    const spoonacularMsg = await checkFoodWithSpoonacular(message);

    // Then call your OpenAI proxy function
    const res  = await fetch(
      `/.netlify/functions/getGPT?message=${encodeURIComponent(message)}&info=${encodeURIComponent(spoonacularMsg)}`
    );
    console.log(`🌐 OpenAI proxy status: ${res.status} ${res.statusText}`);

    const data = await res.json();
    console.log("🤖 OpenAI proxy response body:", data);

    if (res.status !== 200) {
      const errMsg = data.error?.message || "Unknown error from AI service";
      return `Error: ${errMsg}`;
    }
    // Return the AI’s text reply
    return data.choices?.[0]?.message?.content
         || "OpenAI didn’t return a valid answer.";
  } catch (err) {
    console.error("Fetch error contacting OpenAI proxy:", err);
    return "There was a problem contacting the AI service.";
  }
}

// ————————————————————————————————————————————————————————————
// 3) UI handler to send & display messages
function sendMessage() {
  const input   = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const text    = input.value.trim();
  if (!text) return;

  // Display the user's message
  chatBox.innerHTML += `<p><strong>You:</strong> ${text}</p>`;
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  // Show a thinking indicator
  chatBox.innerHTML += `<p><em>Bot is thinking...</em></p>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  // Fetch and display the bot reply
  getGPTReply(text).then(reply => {
    // Remove the “thinking” line
    chatBox.innerHTML = chatBox.innerHTML.replace(
      /<p><em>Bot is thinking\.\.\.<\/em><\/p>/,
      ""
    );
    // Append the actual reply
    chatBox.innerHTML += `<p><strong>Bot:</strong> ${reply}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Expose sendMessage to be callable from your HTML button’s onclick
window.sendMessage = sendMessage;
