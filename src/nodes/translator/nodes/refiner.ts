import * as dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { TranslatorSubgraphAnnotation } from "../../../state";
import { prompts } from '../../../prompts';
import { SYSTEM_PROMPT, USER_PROMPT } from '../../../constants';
import { SystemMessage } from '@langchain/core/messages';
import { HumanMessage } from '@langchain/core/messages';


const refinerModel = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.3,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
});

export async function refiner(state: typeof TranslatorSubgraphAnnotation.State): Promise<Partial<typeof TranslatorSubgraphAnnotation.State>> {
  const { intermediateTranslation, criticisms, metadata, currentState, input } = state;
  const translation = intermediateTranslation[intermediateTranslation.length - 1];
  const { sourceLanguage, targetLanguage } = metadata;
  const criticism = criticisms[criticisms.length - 1];

  if (criticism === "NONE") {
    return {
      currentState: state.nextState[state.currentState],
    };
  }

  const systemPrompt = PromptTemplate.fromTemplate(prompts[currentState as keyof typeof prompts][SYSTEM_PROMPT]);
  const userPrompt = PromptTemplate.fromTemplate(prompts[currentState as keyof typeof prompts][USER_PROMPT]);

  const formattedSystemPrompt = await systemPrompt.format({
    sourceLanguage,
    targetLanguage,
  });

  const formattedUserPrompt = await userPrompt.format({
    translatedText: translation,
    originalText: input,
    criticism: criticism
  }); 


  const response = await refinerModel.invoke([
    new SystemMessage(formattedSystemPrompt),
    new HumanMessage(formattedUserPrompt)
  ]);
  
  const refinements = response.content;
  
  return {
    intermediateTranslation: [
      ...intermediateTranslation,
      refinements.toString()
    ],
    currentState: state.nextState[state.currentState],
  };
} 