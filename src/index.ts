import { START, END, StateGraph } from "@langchain/langgraph";
import { TranslatorStateAnnotation } from "./state";
import { parseContent, combineTranslations } from "./nodes";
import { TranslationMetadata } from "./types";
import { mainTranslator, reviewer, refiner } from "./nodes/translator";

export function createTranslatorSubgraph() {
    const translatorGraph = new StateGraph(TranslatorStateAnnotation)
        .addNode("translator", mainTranslator)
        .addNode("reviewer", reviewer)
        .addNode("refiner", refiner)
        .addEdge(START, "translator")
        .addEdge("translator", "reviewer")
        .addEdge("reviewer", "refiner")
        .addEdge("refiner", END)
        .compile();

    return translatorGraph;
}

export function createTranslationGraph() {
  const translatorSubgraph = createTranslatorSubgraph();

  const graph = new StateGraph(TranslatorStateAnnotation)
    .addNode("parser", parseContent)
    .addNode("translator", translatorSubgraph)
    .addNode("combiner", combineTranslations)
    .addEdge(START, "parser")
    .addEdge("parser", "translator")
    .addEdge("translator", "combiner")
    .addEdge("combiner", END)
    .compile();

  return graph;
}

export async function translateContent(
  htmlContent: string,
  metadata: TranslationMetadata,
) {
  const graph = createTranslationGraph();
  const result = await graph.invoke({
    htmlContent,
    metadata,
    paragraphs: [],
    translations: [],
    messages: [],
  });
  
  return result;
} 