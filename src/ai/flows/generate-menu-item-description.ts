'use server';
/**
 * @fileOverview An AI assistant to generate creative and enticing descriptions for menu items.
 *
 * - generateMenuItemDescription - A function that handles the menu item description generation process.
 * - MenuItemDescriptionGeneratorInput - The input type for the generateMenuItemDescription function.
 * - MenuItemDescriptionGeneratorOutput - The return type for the generateMenuItemDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MenuItemDescriptionGeneratorInputSchema = z.object({
  dishName: z.string().describe('The name of the menu item, e.g., "General Tso Chicken".'),
  ingredients: z.string().describe('A comma-separated list of key ingredients, e.g., "crispy chicken, broccoli, sweet and spicy sauce".'),
});
export type MenuItemDescriptionGeneratorInput = z.infer<typeof MenuItemDescriptionGeneratorInputSchema>;

const MenuItemDescriptionGeneratorOutputSchema = z.object({
  description: z.string().describe('A creative and enticing description for the menu item.'),
});
export type MenuItemDescriptionGeneratorOutput = z.infer<typeof MenuItemDescriptionGeneratorOutputSchema>;

export async function generateMenuItemDescription(input: MenuItemDescriptionGeneratorInput): Promise<MenuItemDescriptionGeneratorOutput> {
  return generateMenuItemDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMenuItemDescriptionPrompt',
  input: { schema: MenuItemDescriptionGeneratorInputSchema },
  output: { schema: MenuItemDescriptionGeneratorOutputSchema },
  prompt: `You are a professional and creative menu writer for a high-end Chinese restaurant named Emperor's Choice.
Your task is to write an enticing and mouth-watering description for a menu item based on its name and key ingredients.
Focus on vivid language, sensory details, and the unique appeal of the dish.
The description should be concise but captivating, aiming to make customers eager to try the dish.

Dish Name: {{{dishName}}}
Key Ingredients: {{{ingredients}}}

Write an enticing description for this menu item:`,
});

const generateMenuItemDescriptionFlow = ai.defineFlow(
  {
    name: 'generateMenuItemDescriptionFlow',
    inputSchema: MenuItemDescriptionGeneratorInputSchema,
    outputSchema: MenuItemDescriptionGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
