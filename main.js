// main.js (Frontend UI Logic)


// -------------------- PWA Service Worker Registration --------------------
// Temporarily disabled for testing; uncomment to enable offline caching.
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     // Register the service worker at /sw.js for offline caching
//     navigator.serviceWorker.register('/sw.js')
//       .then(reg => console.log('✅ Service Worker registered:', reg.scope))
//       .catch(err => console.error('❌ Service Worker registration failed:', err));
//   });
// }

// -------------------- Helper: escapeHtml --------------------
// Escapes special characters for safe HTML insertion
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// -------------------- Function: checkFoodWithSpoonacular --------------------
// Sends the user's food query to our Netlify Function proxy for Spoonacular
// This keeps our API key secure and bypasses CORS restrictions.
async function checkFoodWithSpoonacular(query) {
  try {
    // Fetch from the Netlify Function with the query parameter
    const response = await fetch(
      `/.netlify/functions/checkFood?query=${encodeURIComponent(query)}`
    );
    // Parse the JSON array of ingredient matches
    const data = await response.json();
    console.log('✅ Spoonacular response via Netlify:', data);

    // If a match exists, return a friendly message
    if (data.length > 0) {
      return `I found a match for "${data[0].name}". Let me check if it's colonoscopy-safe...`;
    } else {
      // No match found
      return 'I couldn’t find that food in the Spoonacular database. Please try a different item.';
    }
  } catch (error) {
    // Log and return an error message if the fetch fails
    console.error('❌ Spoonacular proxy error:', error);
    return 'There was a problem checking that food. Try again shortly.';
  }
}

// -------------------- Function: getGPTReply --------------------
// Sends the user's message and Spoonacular result to our OpenAI proxy
async function getGPTReply(userMessage) {
  try {
    // First, get the Spoonacular lookup message
    const spoonacularMsg = await checkFoodWithSpoonacular(userMessage);

    // Now call the OpenAI proxy with both the user message and Spoonacular info
    const response = await fetch(
      `/.netlify/functions/getGPT?message=${encodeURIComponent(userMessage)}` +
      `&info=${encodeURIComponent(spoonacularMsg)}`
    );
    console.log(`🌐 OpenAI proxy status: ${response.status} ${response.statusText}`);

    // Parse the JSON response
    const data = await response.json();
    console.log('🤖 OpenAI proxy response body:', data);

    // Handle non-200 HTTP status codes
    if (response.status !== 200) {
      const errorMsg = data.error?.message || 'Unknown error from AI service';
      return `Error: ${errorMsg}`;
    }

    // Return the AI's reply text
    return data.choices?.[0]?.message?.content || 'OpenAI didn’t return a valid answer.';
  } catch (error) {
    // Network or parsing error
    console.error('❌ Fetch error contacting OpenAI proxy:', error);
    return 'There was a problem contacting the AI service.';
  }
}

// -------------------- Function: sendMessage --------------------
// Triggered when the user clicks Send: updates UI and gets bot reply
function sendMessage() {
  // Get references to the DOM elements
  const inputField = document.getElementById('user-input');
  const chatBox    = document.getElementById('chat-box');
  const message    = inputField.value.trim();

  // Do nothing if the input is empty
  if (!message) return;

  // Display the user's message in the chat box
  chatBox.innerHTML += `<p><strong>You:</strong> ${escapeHtml(message)}</p>`;
  // Clear the input field
  inputField.value = '';
  // Scroll to bottom so the new message is visible
  chatBox.scrollTop = chatBox.scrollHeight;

  // Show a typing indicator while waiting for the bot
  chatBox.innerHTML += '<p><em>Bot is thinking...</em></p>';
  chatBox.scrollTop = chatBox.scrollHeight;

  // Get the bot's reply and update the chat box
  getGPTReply(message).then(botReply => {
    // Remove the "Bot is thinking..." indicator
    chatBox.innerHTML = chatBox.innerHTML.replace(
      /<p><em>Bot is thinking\.\.\.<\/em><\/p>/, ''
    );
    // Display the bot's reply
    chatBox.innerHTML += `<p><strong>Bot:</strong> ${escapeHtml(botReply)}</p>`;
    // Scroll again to show the reply
  chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Expose sendMessage to the global scope so the HTML onclick can find it
window.sendMessage = sendMessage;

// Allow pressing Enter key to send the message
const inputField = document.getElementById('user-input');
if (inputField) {
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

// Hide the prep guidelines banner when dismissed
const dismissBtn = document.getElementById('dismiss-guidelines');
if (dismissBtn) {
  dismissBtn.addEventListener('click', () => {
    const guide = document.getElementById('prep-guidelines');
    if (guide) guide.style.display = 'none';
  });
}
