import * as dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { TranslatorSubgraphAnnotation } from "../../../state";

const refinePrompt = PromptTemplate.fromTemplate(`
Refine the following translation based on the provided criticism.

Original text: {originalText}
Current translation: {translatedText}
Criticism: {criticism}

Provide an improved translation that addresses the criticism:
`);

const refinerModel = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.2
});

export async function refiner(state: typeof TranslatorSubgraphAnnotation.State) {
  const { translation } = state.subgraphState;
  
  const formattedPrompt = await refinePrompt.format({
    originalText: translation.originalContent,
    translatedText: translation.translatedContent,
    criticism: translation.criticism
  });

  const response = await refinerModel.invoke(formattedPrompt);
  
  const refinements = response.content || [];
  
  return {
    translation: {
      ...translation,
      translatedContent: response.content,
      refinements: refinements
    }
  };
} 