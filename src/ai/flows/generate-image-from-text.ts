'use server';
/**
 * @fileOverview Image generation AI agent that takes text input and generates an image.
 * This version uses the Nebius Hugging Face router endpoint for image generation.
 *
 * - generateImageFromText - A function that generates an image from the given text.
 * - GenerateImageFromTextInput - The input type for the generateImageFromText function.
 * - GenerateImageFromTextOutput - The return type for the generateImageFromText function, which contains the data URI of the generated image.
 */

import { z } from 'genkit';

const GenerateImageFromTextInputSchema = z.object({
  text: z.string().describe('The text prompt for image generation.'),
});
export type GenerateImageFromTextInput = z.infer<typeof GenerateImageFromTextInputSchema>;

const GenerateImageFromTextOutputSchema = z.object({
  image: z.string().describe('The generated image as a data URI.'),
});
export type GenerateImageFromTextOutput = z.infer<typeof GenerateImageFromTextOutputSchema>;

export async function generateImageFromText(input: GenerateImageFromTextInput): Promise<GenerateImageFromTextOutput> {
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    throw new Error('HF_TOKEN environment variable is not set.');
  }
  const response = await fetch(
    'https://router.huggingface.co/nebius/v1/images/generations',
    {
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        response_format: 'b64_json',
        prompt: input.text,
        model: 'stability-ai/sdxl',
      }),
    }
  );
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Image generation failed: ${response.statusText} - ${errorBody}`);
  }
  const result = await response.json();
  const b64 = result?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('No image data returned from Hugging Face.');
  }
  const dataUri = `data:image/png;base64,${b64}`;
  return { image: dataUri };
}
