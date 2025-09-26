'use server';

/**
 * @fileOverview A BMI visualization AI agent that provides a graphical representation of the BMI result on a color-coded bar graph and provides contextual advice based on the result.
 *
 * - visualizeBmiResultWithContextualAdvice - A function that handles the BMI visualization and advice process.
 * - VisualizeBmiResultWithContextualAdviceInput - The input type for the visualizeBmiResultWithContextualAdvice function.
 * - VisualizeBmiResultWithContextualAdviceOutput - The return type for the visualizeBmiResultWithContextualAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeBmiResultWithContextualAdviceInputSchema = z.object({
  bmi: z.number().describe('The BMI value to visualize.'),
  weight: z.number().describe('The weight of the person in kilograms.'),
  height: z.number().describe('The height of the person in meters.'),
});
export type VisualizeBmiResultWithContextualAdviceInput = z.infer<typeof VisualizeBmiResultWithContextualAdviceInputSchema>;

const VisualizeBmiResultWithContextualAdviceOutputSchema = z.object({
  graphDataUri: z
    .string()
    .describe(
      'A data URI containing the graph representing the BMI categories and the user\'s BMI, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  advice: z.string().describe('Contextual advice based on the BMI result.'),
});
export type VisualizeBmiResultWithContextualAdviceOutput = z.infer<typeof VisualizeBmiResultWithContextualAdviceOutputSchema>;

export async function visualizeBmiResultWithContextualAdvice(
  input: VisualizeBmiResultWithContextualAdviceInput
): Promise<VisualizeBmiResultWithContextualAdviceOutput> {
  return visualizeBmiResultWithContextualAdviceFlow(input);
}

const calculateWeightChangeNeeded = ai.defineTool({
  name: 'calculateWeightChangeNeeded',
  description: 'Calculates the weight change needed to move to a different BMI category.',
  inputSchema: z.object({
    currentBmi: z.number().describe('The current BMI of the person.'),
    currentWeight: z.number().describe('The current weight of the person in kilograms.'),
    height: z.number().describe('The height of the person in meters.'),
    targetCategory: z.enum(["Underweight", "Normal weight", "Overweight", "Obesity Class I", "Obesity Class II", "Obesity Class III"]).describe('The BMI category to target.'),
  }),
  outputSchema: z.number().describe('The weight change needed in kilograms.'),
}, async (input) => {
  const {
    currentBmi, currentWeight, height, targetCategory
  } = input;

  let targetBmi;
  switch (targetCategory) {
    case "Underweight":
      targetBmi = 18.5;
      break;
    case "Normal weight":
      targetBmi = 24.9;
      break;
    case "Overweight":
      targetBmi = 25.0;
      break;
    case "Obesity Class I":
      targetBmi = 30.0;
      break;
    case "Obesity Class II":
      targetBmi = 35.0;
      break;
    case "Obesity Class III":
      targetBmi = 40.0;
      break;
    default:
      throw new Error(`Unknown category ${targetCategory}`);
  }

  const targetWeight = targetBmi * height * height;
  const weightChange = targetWeight - currentWeight;
  return weightChange;
});

const prompt = ai.definePrompt({
  name: 'visualizeBmiResultWithContextualAdvicePrompt',
  input: {schema: VisualizeBmiResultWithContextualAdviceInputSchema},
  output: {schema: VisualizeBmiResultWithContextualAdviceOutputSchema},
  tools: [calculateWeightChangeNeeded],
  prompt: `You are an AI assistant that visualizes BMI results on a color-coded bar graph and provides contextual advice.

Given the following BMI value: {{bmi}}, weight: {{weight}}, and height: {{height}},

1.  Create a data URI for a horizontal bar graph visualizing the BMI categories:
    *   Underweight: < 18.5 (blue)
    *   Normal weight: 18.5 - 24.9 (green)
    *   Overweight: 25.0 - 29.9 (yellow)
    *   Obesity Class I: 30.0 - 34.9 (orange)
    *   Obesity Class II: 35.0 - 39.9 (red)
    *   Obesity Class III (Extreme Obesity): >= 40.0 (dark red)

    Highlight the user's BMI category on the graph with a clear marker.

2.  Provide contextual advice based on the BMI result. Include a disclaimer that this is not medical advice. If the user is not in the normal weight category, then use the calculateWeightChangeNeeded tool to determine how much weight they would need to gain or lose to get into the normal weight category. For example, use the tool to calculate what the weight change would be to achieve a BMI of 24.9 (the maximum end of the normal category). Then use the tool again to calculate what the weight change would be to achieve a BMI of 18.5 (the minimum end of the normal category).

      Make sure to use these values to construct the advice to give to the user.

      Make sure to express the advice in a friendly manner.
`,
});

const visualizeBmiResultWithContextualAdviceFlow = ai.defineFlow(
  {
    name: 'visualizeBmiResultWithContextualAdviceFlow',
    inputSchema: VisualizeBmiResultWithContextualAdviceInputSchema,
    outputSchema: VisualizeBmiResultWithContextualAdviceOutputSchema,
  },
  async input => {
    const {
      bmi,
      weight,
      height,
    } = input;
    const {output} = await prompt(input);
    return output!;
  }
);
