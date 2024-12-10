import * as dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { TranslatorSubgraphAnnotation } from "../../../state";

const translationPrompt = PromptTemplate.fromTemplate(`
Translate the following HTML from {sourceLanguage} to {targetLanguage}.

- Preserve all HTML tags and attributes unchanged.
- Only translate the visible text content that is rendered on the screen.
- Do not translate or modify content within <script> or <style> tags.
- Maintain all special characters and HTML entities as they are.
- Preserve the original formatting, indentation, and line breaks.
- Preserve the writing style, tonality, and information presented in the original text.
- Preserve any placeholders, variables, or dynamic content within the text.
- Ensure the output contains only the translated HTML without any additional text, explanations, or comments.

**HTML Content:**
{text}
`);

const translatorModel = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.1
});

export async function mainTranslator(state: typeof TranslatorSubgraphAnnotation.State): Promise<Partial<typeof TranslatorSubgraphAnnotation.State>> {
  const { block, metadata, fastTranslate } = state;
  const { content, type, path, id } = block;
  const { sourceLanguage, targetLanguage } = metadata;

  const formattedPrompt = await translationPrompt.format({
    sourceLanguage,
    targetLanguage,
    text: content
  });

  const response = await translatorModel.invoke(formattedPrompt);
  
  if (fastTranslate) {
    return {
      translation: {
        blockId: id,
        type,
        path,
        originalContent: content,
        translatedContent: response.content.toString(),
        criticism: "NONE",
        refinements: response.content.toString()
      }
    };
  }
  
  return {
    translation: {
      blockId: id,
      type,
      path,
      originalContent: content,
      translatedContent: response.content.toString()
    }
  };
} 