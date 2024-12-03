import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { TranslatorStateAnnotation } from "../../../state";

const translationPrompt = PromptTemplate.fromTemplate(`
Translate the following text from {sourceLanguage} to {targetLanguage}.
Original text: {text}

Translation:
`);

const translatorModel = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.1
});

export async function mainTranslator(state: typeof TranslatorStateAnnotation.State) {
  const { content, metadata } = state.paragraphs[0];
  const { sourceLanguage, targetLanguage } = metadata;

  const formattedPrompt = await translationPrompt.format({
    sourceLanguage,
    targetLanguage,
    text: content
  });

  const response = await translatorModel.invoke(formattedPrompt);
  
  return {
    translations: [{
      paragraphId: state.paragraphs[0].id,
      originalContent: content,
      translatedContent: response.content
    }]
  };
} 