import * as dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { prompts } from "../../../prompts";
import { PromptTemplate } from "@langchain/core/prompts";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { TranslatorSubgraphAnnotation } from "../../../state";
import { TRANSLATOR, SYSTEM_PROMPT, USER_PROMPT } from '../../../constants';

const translatorModel = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.3,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
});

export async function mainTranslator(state: typeof TranslatorSubgraphAnnotation.State): Promise<Partial<typeof TranslatorSubgraphAnnotation.State>> {
  const { metadata, input} = state;
  const { sourceLanguage, targetLanguage } = metadata;

  const systemPrompt = PromptTemplate.fromTemplate(prompts[TRANSLATOR][SYSTEM_PROMPT]);
  const userPrompt = PromptTemplate.fromTemplate(prompts[TRANSLATOR][USER_PROMPT]);

  const formattedSystemPrompt = await systemPrompt.format({
    sourceLanguage,
    targetLanguage,
  });

  const formattedUserPrompt = await userPrompt.format({
    sourceLanguage,
    targetLanguage,
    text: input,
  });

  const response = await translatorModel.invoke([
    new SystemMessage(formattedSystemPrompt),
    new HumanMessage(formattedUserPrompt)
  ]);
  
  return {
    intermediateTranslation: [response.content.toString()],
    currentState: state.nextState[state.currentState],
  };
} 