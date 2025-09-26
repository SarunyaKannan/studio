// src/app/api/genkit/route.ts
import { nextJSHandler } from 'genkit/nextjs';
import { ai } from '@/ai/genkit';

export const POST = nextJSHandler(ai);
