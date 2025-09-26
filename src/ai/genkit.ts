/**
 * @fileoverview This file initializes the Genkit AI plugin with Google AI.
 *
 * It exports a single `ai` object that is used to define prompts, flows, and tools.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
