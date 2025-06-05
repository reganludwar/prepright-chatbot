# PrepRight Chatbot

PrepRight is a simple PWA that helps users follow a colonoscopy diet plan. The frontend is a static site served from `index.html` and communicates with serverless functions hosted on Netlify.

## Local development

1. Install the Netlify CLI and run `netlify dev`.
2. Set the environment variables `SPOONACULAR_KEY` and `OPENAI_KEY` so the proxy functions can reach the respective APIs.
3. Open `http://localhost:8888` to try the chat interface.

## Deployment

The included `netlify.toml` file publishes the project root and exposes the functions in `netlify/functions`.
