import { Annotation } from "@langchain/langgraph";
import { TranslationMetadata, Translation, TranslationBlock } from "../types";

function reduceTranslations(current: Translation[], update: Translation[]) {
  return [...current, ...update];
}

function reduceBlocks(current: TranslationBlock[], update: TranslationBlock[]) {
  return [...current, ...update];
}

export const TranslatorStateAnnotation = Annotation.Root({
  htmlContent: Annotation<string>(),
  translatedContent: Annotation<string>(),
  metadata: Annotation<TranslationMetadata>(),
  blocks: Annotation<TranslationBlock[]>({
    reducer: reduceBlocks,
    default: () => [],
  }),
  translations: Annotation<Translation[]>({
    reducer: reduceTranslations,
    default: () => [],
  }),
  plainText: Annotation<boolean>({
    reducer: (current, update) => update,
    default: () => false,
  }),
  fastTranslate: Annotation<boolean>({
    reducer: (current, update) => update,
    default: () => false,
  }),
}); 

export const TranslatorSubgraphAnnotation = Annotation.Root({
    metadata: Annotation<TranslationMetadata>(),
    block: Annotation<TranslationBlock>(),
    translation: Annotation<Translation>(),
    fastTranslate: Annotation<boolean>({
        reducer: (current, update) => update,
        default: () => false,
    }),
});