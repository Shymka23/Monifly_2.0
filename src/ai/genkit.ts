import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { config } from '@/lib/env';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: config.GEMINI_API_KEY,
    })
  ],
  // model: 'googleai/gemini-2.0-flash', // Models are typically specified in prompts or generate calls, not globally here for the plugin.
});
