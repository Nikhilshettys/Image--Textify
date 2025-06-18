'use server';
/**
 * @fileOverview A Genkit flow for performing chat completions using a Hugging Face compatible API.
 *
 * - chatCompletion - A function that takes messages and returns a chat response.
 * - ChatCompletionInput - The input type for the chatCompletion function.
 * - ChatCompletionOutput - The return type for the chatCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.string().describe("The role of the message sender (e.g., 'user', 'assistant')."),
  content: z.string().describe('The content of the message.'),
});

const ChatCompletionInputSchema = z.object({
  messages: z.array(MessageSchema).describe('An array of messages forming the conversation history.'),
  model: z.string().optional().default('deepseek-ai/DeepSeek-V3-0324').describe('The model to use for chat completion.'),
  provider: z.string().optional().default('novita').describe('The provider for the chat completion service.'),
});
export type ChatCompletionInput = z.infer<typeof ChatCompletionInputSchema>;

const ChatCompletionOutputSchema = z.object({
  response: z.string().describe("The assistant's response message."),
});
export type ChatCompletionOutput = z.infer<typeof ChatCompletionOutputSchema>;

// Hugging Face API removed. This function is now a stub.
export async function chatCompletion(input: ChatCompletionInput): Promise<ChatCompletionOutput> {
  throw new Error('Chat completion is not available. Hugging Face API has been removed.');
}
