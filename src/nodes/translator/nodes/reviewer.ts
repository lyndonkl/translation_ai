import * as dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { TranslatorSubgraphAnnotation } from "../../../state";
import { prompts } from "../../../prompts";
import { SYSTEM_PROMPT, USER_PROMPT } from '../../../constants';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
const reviewerModel = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.3,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
});

export async function reviewer(state: typeof TranslatorSubgraphAnnotation.State): Promise<Partial<typeof TranslatorSubgraphAnnotation.State>> {
    const { metadata, intermediateTranslation, currentState, criticisms, input } = state;
    const { sourceLanguage, targetLanguage } = metadata;
    const systemPrompt = PromptTemplate.fromTemplate(prompts[currentState as keyof typeof prompts][SYSTEM_PROMPT]);
    const userPrompt = PromptTemplate.fromTemplate(prompts[currentState as keyof typeof prompts][USER_PROMPT]);

    const formattedSystemPrompt = await systemPrompt.format({
        sourceLanguage,
        targetLanguage,
    });

    const translation = intermediateTranslation[intermediateTranslation.length - 1];

    const formattedUserPrompt = await userPrompt.format({
        sourceLanguage,
        targetLanguage,
        translatedText: translation,
        originalText: input,
    });

  const response = await reviewerModel.invoke([
    new SystemMessage(formattedSystemPrompt),
    new HumanMessage(formattedUserPrompt)
  ]);

  const critisimAnalysPrompt =PromptTemplate.fromTemplate(`
 You are provided with a criticism of a translation. Your task is to analyze the criticism and if the critism does not contain any recommended changes, output "NONE" in capital letters and nothing else. If it does contain recommended changes, output "CHANGES_NEEDED" in capital letters and nothing else.

 **Criticism:**
 {criticism}
  `);

  const formattedCritisimAnalysisPrompt = await critisimAnalysPrompt.format({
    criticism: response.content
  });

  const criticismAnalysisResponse = await reviewerModel.invoke(formattedCritisimAnalysisPrompt);

  const criticism = criticismAnalysisResponse.content === "NONE" ? "NONE" : response.content;

  return {
    currentState: state.nextState[state.currentState],
    criticisms: [
      ...criticisms,
      criticism.toString()
    ],
  };
} 