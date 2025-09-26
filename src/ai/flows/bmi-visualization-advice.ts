'use server';
/**
 * @fileoverview This file contains the Genkit flow for providing BMI advice and visualization data.
 *
 * - getBmiAdvice - A function that handles the BMI advice generation process.
 * - BmiAdviceRequest - The input type for the getBmiAdvice function.
 * - BmiAdviceResponse - The return type for the getBmiAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BmiAdviceRequestSchema = z.object({
  bmi: z.number().describe('The calculated Body Mass Index.'),
  category: z.string().describe('The BMI category (e.g., Underweight, Normal weight).'),
  unit: z.enum(['metric', 'imperial']).describe('The unit system used for measurements.'),
  weight: z.number().describe('The person\'s weight.'),
  height: z.number().describe('The person\'s height in meters or inches depending on the unit.'),
});
export type BmiAdviceRequest = z.infer<typeof BmiAdviceRequestSchema>;

const ChartDataSchema = z.object({
    name: z.string(),
    bmi: z.number().optional(),
    range: z.tuple([z.number(), z.number()]).optional(),
});

const BmiAdviceResponseSchema = z.object({
  personalizedAdvice: z.string().describe('Personalized, encouraging advice based on the BMI result.'),
  chartData: z.array(ChartDataSchema).describe('Data for a bar chart to visualize the BMI ranges. The chart should include bars for "Underweight", "Normal", "Overweight", and "Obese". The user\'s BMI should be represented in the correct category.')
});
export type BmiAdviceResponse = z.infer<typeof BmiAdviceResponseSchema>;


export async function getBmiAdvice(input: BmiAdviceRequest): Promise<BmiAdviceResponse> {
  return getBmiAdviceFlow(input);
}

const prompt = ai.definePrompt({
    name: 'bmiAdvicePrompt',
    input: { schema: BmiAdviceRequestSchema },
    output: { schema: BmiAdviceResponseSchema },
    prompt: `You are a helpful, encouraging health assistant.
A user has calculated their BMI and received the following result:
- BMI: {{{bmi}}}
- Category: {{{category}}}
- Weight: {{{weight}}} {{#if (eq unit "metric")}}kg{{else}}lbs{{/if}}
- Height: {{{height}}} {{#if (eq unit "metric")}}m{{else}}in{{/if}}

Based on this, provide:
1.  **Personalized Advice**: Write a short paragraph of encouraging, non-judgmental advice.
    - If the BMI is not in the "Normal weight" range, provide gentle, actionable suggestions for diet and exercise that could help them move towards a healthier range.
    - If the BMI is in the "Normal weight" range, congratulate them and offer tips for maintaining a healthy lifestyle.
    - Keep the tone positive and supportive. Do not use scary or alarming language.

2.  **Chart Data**: Generate data for a bar chart to help the user visualize their BMI.
    - The chart must have four categories on the x-axis: "Underweight", "Normal", "Overweight", "Obese".
    - Create a 'bmi' value for the user's category. For instance, if their category is 'Overweight' and their BMI is 26.5, the 'Overweight' category object should have a 'bmi' value of 26.5.
    - Create a 'range' value for the "Normal" weight category, which should be [18.5, 24.9] to represent the healthy range.
    - Format the output according to the BmiAdviceResponse schema.
    
    Example for a user with BMI 26.5 (Overweight):
    "chartData": [
      { "name": "Underweight" },
      { "name": "Normal", "range": [18.5, 24.9] },
      { "name": "Overweight", "bmi": 26.5 },
      { "name": "Obese" }
    ]

    Example for a user with BMI 22.1 (Normal):
     "chartData": [
      { "name": "Underweight" },
      { "name": "Normal", "bmi": 22.1, "range": [18.5, 24.9] },
      { "name": "Overweight" },
      { "name": "Obese" }
    ]
    
    The 'range' property should only exist on the "Normal" category object.
    The 'bmi' property should only exist on the object that corresponds to the user's category.
`,
});

const getBmiAdviceFlow = ai.defineFlow(
  {
    name: 'getBmiAdviceFlow',
    inputSchema: BmiAdviceRequestSchema,
    outputSchema: BmiAdviceResponseSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("Could not generate BMI advice.");
    }

    // Post-process to fix potential LLM inconsistencies
    const userCategory = input.category.split(' ')[0]; // e.g. "Obesity Class I" -> "Obesity"
    const validCategories = ["Underweight", "Normal", "Overweight", "Obese"];

    // Ensure the chart data has the correct format
    const processedChartData = validCategories.map(name => {
        const item = output.chartData.find(d => d.name === name) || { name };
        
        // Ensure user's BMI is only in their category
        if (item.name.startsWith(userCategory)) {
            item.bmi = input.bmi;
        } else {
            delete item.bmi;
        }

        // Ensure range is only on the normal category
        if (item.name === "Normal") {
            item.range = [18.5, 24.9];
        } else {
            delete item.range;
        }

        return item;
    });

    return {
        personalizedAdvice: output.personalizedAdvice,
        chartData: processedChartData,
    };
  }
);
