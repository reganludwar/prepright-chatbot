// 🔐 Define your API keys here (only once at the top)
const SPOONACULAR_KEY = "c1bf144f11ad470bb0c366755f71b6b4";

// Open AI API Key
const OPENAI_KEY = process.env.OPENAI_KEY || "";  // key injected at deploy time



// ————————————————————————————————————————————————————————————
// Function: call your Netlify proxy for Spoonacular
async function checkFoodWithSpoonacular(query) {
  try {
    const response = await fetch(
      `/.netlify/functions/checkFood?query=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    console.log("✅ Spoonacular response via Netlify:", data);

    if (data.length > 0) {
      return `I found a match for "${data[0].name}". Let me check if it's colonoscopy-safe...`;
    } else {
      return `I couldn’t find that food in the Spoonacular database. Please try a different item.`;
    }

  } catch (error) {
    console.error("Spoonacular error:", error);
    return "There was a problem checking that food. Try again shortly.";
  }
}

// ————————————————————————————————————————————————————————————
// Function: call OpenAI with your prompt + Spoonacular lookup
async function getGPTReply(message) {
  console.log("🔑 OPENAI_KEY present?", !!OPENAI_KEY);

  const url     = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${OPENAI_KEY}`
  };
  const body = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a colonoscopy diet assistant. Be strict but kind." },
      { role: "user",   content: message }
    ]
  });

  try {
    const res = await fetch(url, { method: "POST", headers, body });
    console.log(`🌐 OpenAI status: ${res.status} ${res.statusText}`);

    const data = await res.json();
    console.log("📦 OpenAI response body:", data);

    if (res.status === 429) {
      return "I’m getting rate-limited by OpenAI right now. Please wait a moment and try again.";
    }
    if (data.error) {
      return `OpenAI error: ${data.error.message}`;
    }
    return data.choices?.[0]?.message?.content
         || "OpenAI didn’t give a usable reply.";

  } catch (err) {
    console.error("❌ Network or fetch error:", err);
    return "Network error when contacting OpenAI.";
  }
}

// ————————————————————————————————————————————————————————————
// Function: handle user click and render messages
function sendMessage() {
  const input  = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const text    = input.value.trim();
  if (!text) return;

  // Show user message
  chatBox.innerHTML += `<p><strong>You:</strong> ${text}</p>`;
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  // Show “typing” indicator
  chatBox.innerHTML += `<p><em>Bot is thinking...</em></p>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  // Get and render bot reply
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

// Expose to HTML onclick
window.sendMessage = sendMessage;
