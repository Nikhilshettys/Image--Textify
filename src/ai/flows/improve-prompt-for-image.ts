// src/ai/flows/improve-prompt-for-image.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow that enhances user-provided text into detailed image generation prompts.
 *
 * The flow takes a simple text description as input and refines it into a comprehensive prompt suitable for AI image generation.
 * This helps users achieve better and more relevant image results.
 *
 * @function improvePromptForImage - The main function to enhance the image generation prompt.
 * @typedef {ImprovePromptForImageInput} ImprovePromptForImageInput - The input type for the improvePromptForImage function.
 * @typedef {ImprovePromptForImageOutput} ImprovePromptForImageOutput - The output type for the improvePromptForImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImprovePromptForImageInputSchema = z.object({
  text: z.string().describe('The original, simple text prompt provided by the user.'),
});
export type ImprovePromptForImageInput = z.infer<typeof ImprovePromptForImageInputSchema>;

const ImprovePromptForImageOutputSchema = z.object({
  prompt: z.string().describe('The refined and detailed prompt for image generation.'),
});
export type ImprovePromptForImageOutput = z.infer<typeof ImprovePromptForImageOutputSchema>;

export async function improvePromptForImage(input: ImprovePromptForImageInput): Promise<ImprovePromptForImageOutput> {
  return improvePromptForImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improvePromptForImagePrompt',
  input: {schema: ImprovePromptForImageInputSchema},
  output: {schema: ImprovePromptForImageOutputSchema},
  prompt: `You are an AI prompt engineer. Your goal is to turn a short, simple user-provided text prompt into a detailed, compelling, and specific prompt suitable for image generation.

Original prompt: "{{text}}"

Improved prompt:`,
});

const improvePromptForImageFlow = ai.defineFlow(
  {
    name: 'improvePromptForImageFlow',
    inputSchema: ImprovePromptForImageInputSchema,
    outputSchema: ImprovePromptForImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
