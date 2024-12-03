import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { TranslatorStateAnnotation } from "../../../state";

const reviewPrompt = PromptTemplate.fromTemplate(`
Review the following translation from {sourceLanguage} to {targetLanguage}.

Original text: {originalText}
Translation: {translatedText}

Provide specific criticism about:
1. Accuracy of translation
2. Preservation of meaning
3. Natural flow in target language
4. Any cultural considerations

Criticism:
`);

const reviewerModel = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.3
});

export async function reviewer(state: typeof TranslatorStateAnnotation.State) {
  const translation = state.translations[state.translations.length - 1];
  const { sourceLanguage, targetLanguage } = state.metadata;

  const formattedPrompt = await reviewPrompt.format({
    sourceLanguage,
    targetLanguage,
    originalText: translation.originalContent,
    translatedText: translation.translatedContent
  });

  const response = await reviewerModel.invoke(formattedPrompt);
  
  return {
    translations: [{
      ...translation,
      criticism: response.content
    }]
  };
} 