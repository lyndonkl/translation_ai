import { Annotation } from "@langchain/langgraph";
import { TranslationMetadata, Translation, Paragraph } from "../types";

function reduceTranslations(current: Translation[], update: Translation[]) {
  return [...current, ...update];
}

function reduceParagraphs(current: Paragraph[], update: Paragraph[]) {
  return [...current, ...update];
}

export const TranslatorStateAnnotation = Annotation.Root({
  htmlContent: Annotation<string>(),
  translatedContent: Annotation<string>(),
  metadata: Annotation<TranslationMetadata>(),
  paragraphs: Annotation<Paragraph[]>({
    reducer: reduceParagraphs,
    default: () => [],
  }),
  translations: Annotation<Translation[]>({
    reducer: reduceTranslations,
    default: () => [],
  }),
}); 

export const TranslatorSubgraphAnnotation = Annotation.Root({
    metadata: Annotation<TranslationMetadata>(),
    paragraph: Annotation<Paragraph>(),
    translation: Annotation<Translation>(),
});