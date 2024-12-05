import * as dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { TranslatorSubgraphAnnotation } from "../../../state";

const reviewPrompt = PromptTemplate.fromTemplate(`
You are a translation critic. Evaluate the translation based on the original and translated HTML provided below. Both versions preserve all HTML tags and structure. The source language is {sourceLanguage} and the target language is {targetLanguage}. Assess the translation on the following dimensions:

1. **Accuracy**: Correctness of translation, including absence of additions, mistranslations, omissions, and untranslated text.
2. **Fluency**: Proper grammar, spelling, and punctuation in {targetLanguage}, and avoidance of unnecessary repetitions.
3. **Style**: Consistency with the source text's style and appropriate cultural context.
4. **Terminology**: Consistent and domain-appropriate use of terminology, including equivalent idioms in {targetLanguage}.
5. **Consistency**: Uniformity in translation choices throughout the text.
6. **Readability**: Ease of understanding and natural flow in the target language.
7. **Formatting**: Preservation of HTML structure, tags, and formatting without introducing errors.

**Note:** 
- For each dimension, provide multiple bullet-point comments if applicable.
- Omit any dimension sections that have no criticisms.
- If there are no criticisms for any of the sections, output NONE in capital letters and nothing else.
- **Do not include any additional text, explanations, or comments outside the specified format.**

Provide the criticisms in Markdown format with headers for each dimension and bullet points for each comment.

**Original HTML:**
{originalText}

**Translated HTML:**
{translatedText}
`);

const reviewerModel = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.3
});

export async function reviewer(state: typeof TranslatorSubgraphAnnotation.State) {
    const { metadata, translation } = state;
    const { sourceLanguage, targetLanguage } = metadata;

  const formattedPrompt = await reviewPrompt.format({
    sourceLanguage,
    targetLanguage,
    originalText: translation.originalContent,
    translatedText: translation.translatedContent
  });

  const response = await reviewerModel.invoke(formattedPrompt);
  
  return {
    translation: {
        ...translation,
      criticism: response.content
    }
  };
} 