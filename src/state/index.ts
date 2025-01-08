import { Annotation } from "@langchain/langgraph";
import { TranslationMetadata, TranslationBlock, IndexToBlockId, SubgraphStateMap } from "../types";
import {
  TRANSLATOR,
  ACCURACY_REVIEWER,
  ACCURACY_REFINER,
  FLUENCY_REVIEWER,
  FLUENCY_REFINER,
  STYLE_REVIEWER,
  STYLE_REFINER,
  TERMINOLOGY_REVIEWER,
  TERMINOLOGY_REFINER,
  CONSISTENCY_REVIEWER,
  CONSISTENCY_REFINER,
  READABILITY_REVIEWER,
  READABILITY_REFINER,
  FORMATTING_REVIEWER,
  COMBINER,
  FORMATTING_REFINER,
  USER_REFINER
} from "../constants";

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
  intermediateTranslations: Annotation<string[]>({
    default: () => [],
    value: (current, update) => [...update],
  }),
  criticisms: Annotation<string[]>({
    default: () => [],
    value: (current, update) => [...update],
  }),
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
    criticisms: Annotation<string[]>({
        default: () => [],
        value: (current, update) => [...update],
    }),
    intermediateTranslation: Annotation<string[]>({
        default: () => [],
        value: (current, update) => [...update],
    }),
    translation: Annotation<string>(),
    currentState: Annotation<string>({
        default: () => TRANSLATOR,
        value: (current, update) => update,
    }),
    nextState: Annotation<SubgraphStateMap>({
      default: () => ({
        [TRANSLATOR]: ACCURACY_REVIEWER,
        [ACCURACY_REVIEWER]: ACCURACY_REFINER,
        [ACCURACY_REFINER]: FLUENCY_REVIEWER,
        [FLUENCY_REVIEWER]: FLUENCY_REFINER,
        [FLUENCY_REFINER]: STYLE_REVIEWER,
        [STYLE_REVIEWER]: STYLE_REFINER,
        [STYLE_REFINER]: TERMINOLOGY_REVIEWER,
        [TERMINOLOGY_REVIEWER]: TERMINOLOGY_REFINER,
        [TERMINOLOGY_REFINER]: CONSISTENCY_REVIEWER,
        [CONSISTENCY_REVIEWER]: CONSISTENCY_REFINER,
        [CONSISTENCY_REFINER]: READABILITY_REVIEWER,
        [READABILITY_REVIEWER]: READABILITY_REFINER,
        [READABILITY_REFINER]: FORMATTING_REVIEWER,
        [FORMATTING_REVIEWER]: FORMATTING_REFINER,
        [FORMATTING_REFINER]: USER_REFINER,
        [USER_REFINER]: COMBINER,
      }),
      value: (current) => ({ ...current }),
      }),
});
