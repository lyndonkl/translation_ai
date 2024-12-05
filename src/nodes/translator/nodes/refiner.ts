import * as dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { TranslatorSubgraphAnnotation } from "../../../state";

const refinePrompt = PromptTemplate.fromTemplate(`
You are a Translation Editor. Your task is to refine the translated HTML based on the provided criticisms while preserving the original HTML structure and tags. You will receive the original HTML, the translated HTML, the source language, and the target language. Only modify the text content that is displayed to users. Do not alter any HTML tags, attributes, scripts, or styles.

**Source Language:** {sourceLanguage}  
**Target Language:** {targetLanguage}

**Original HTML:**
{originalText}

**Translated HTML:**
{translatedText}

**Criticism:**
{criticism}

**Instructions:**
1. **Address All Applicable Criticisms**: Refine the translated HTML by systematically addressing each criticism provided. If a criticism cannot be addressed, retain the original translated content for that section.
2. **Preserve HTML Structure**: Do not alter any HTML tags, attributes, scripts, or styles. Only modify the text content intended for user display.
3. **Maintain Formatting**: Keep the original formatting, indentation, and line breaks intact.
4. **Preserve Writing Style**: Ensure that the writing style, tone, and information of the original text are maintained in the refined translation.
5. **PNo Additional Content: Output only the refined translated HTML**: without any additional text, explanations, or comments.
`);

const refinerModel = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.2
});

export async function refiner(state: typeof TranslatorSubgraphAnnotation.State) {
  const { translation, metadata } = state;

  if (translation.criticism === "NONE") {
    return {
      translation: {
        ...translation,
        refinements: translation.translatedContent
      }
    };
  }
  
  const { sourceLanguage, targetLanguage } = metadata;
  
  const formattedPrompt = await refinePrompt.format({
    originalText: translation.originalContent,
    translatedText: translation.translatedContent,
    criticism: translation.criticism,
    sourceLanguage,
    targetLanguage
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