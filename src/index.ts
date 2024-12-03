import { START, END, StateGraph } from "@langchain/langgraph";
import { TranslatorStateAnnotation } from "./state";
import { parseContent, createTranslatorSubgraph, combineTranslations } from "./nodes";
import { TranslationMetadata } from "./types";
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