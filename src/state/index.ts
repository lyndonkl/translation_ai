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
  paragraph: Annotation<Paragraph>(),
  metadata: Annotation<TranslationMetadata>(),
  translation: Annotation<Translation>(),
});