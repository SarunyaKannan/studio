// src/app/api/genkit/[...slug]/route.ts
import {createGenkitNextHandler} from '@genkit-ai/next';
import '@/ai/dev';

export const {GET, POST} = createGenkitNextHandler();
