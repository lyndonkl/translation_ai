import * as dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { TranslatorSubgraphAnnotation } from "../../../state";

const translationPrompt = PromptTemplate.fromTemplate(`
Translate the following text from {sourceLanguage} to {targetLanguage}.
Original text: {text}

Translation:
`);

const translatorModel = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.1
});

export async function mainTranslator(state: typeof TranslatorSubgraphAnnotation.State) {
  const { content } = state.paragraph;
  const { sourceLanguage, targetLanguage } = state.metadata;

  const formattedPrompt = await translationPrompt.format({
    sourceLanguage,
    targetLanguage,
    text: content
  });

  const response = await translatorModel.invoke(formattedPrompt);
  
  return {
    translation: {
      paragraphId: state.paragraph.id,
      originalContent: content,
      translatedContent: response.content
    }
  };
} 