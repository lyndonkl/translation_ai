import { Annotation } from "@langchain/langgraph";
import { TranslationMetadata, TranslationBlock, IndexToBlockId } from "../types";

function reduceTranslationBlocks(current: TranslationBlock[], update: TranslationBlock[]) {
  const merged = [...current];
  update.forEach(updateItem => {
    const existingIndex = merged.findIndex(item => item.id === updateItem.id);
    if (existingIndex >= 0) {
      merged[existingIndex] = updateItem;
    } else {
      merged.push(updateItem);
    }
  });
  return merged;
}

function reduceIndexToBlockId(current: IndexToBlockId, update: IndexToBlockId) {
  const merged = { ...current };
  Object.entries(update).forEach(([key, id]) => {
    merged[parseInt(key)] = id;
  });
  return merged;
}

export const TranslatorStateAnnotation = Annotation.Root({
  input: Annotation<string>(),
  intermediateTranslation: Annotation<string>(),
  criticism: Annotation<string>(),
  finalTranslation: Annotation<string>(),
  metadata: Annotation<TranslationMetadata>(),
  blocks: Annotation<TranslationBlock[]>({
    reducer: reduceTranslationBlocks,
    default: () => [],
  }),
  plainText: Annotation<boolean>({
    reducer: (current, update) => update,
    default: () => false,
  }),
  indexToBlockId: Annotation<IndexToBlockId>({
    reducer: reduceIndexToBlockId,
    default: () => ({} as IndexToBlockId),
  }),
});

export const TranslatorSubgraphAnnotation = Annotation.Root({
    metadata: Annotation<TranslationMetadata>(),
    input: Annotation<string>(),
    criticism: Annotation<string>(),
    refinements: Annotation<string>(),
    translation: Annotation<string>(),
});