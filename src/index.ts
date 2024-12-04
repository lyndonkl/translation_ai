import { START, END, StateGraph, Send } from "@langchain/langgraph";
import { TranslatorStateAnnotation } from "./state";
import { parseContent, combineTranslations } from "./nodes";
import { TranslationMetadata } from "./types";
import { mainTranslator, reviewer, refiner, TranslatorSubgraphAnnotation } from "./nodes/translator";

// Function to map paragraphs to translator tasks
const continueToTranslations = (state: typeof TranslatorStateAnnotation.State) => {
    // Go to combiner if not paragraphs
    if (state.paragraphs.length === 0) {
        return new Send("combiner", {
            paragraphs: state.paragraphs,
            translations: state.translations,
        });
    }
    // Otherwise, go to translator
    return state.paragraphs.map(
        (paragraph) => new Send("translator", {
            paragraph,
            metadata: state.metadata
        })
    );
};

export function createTranslatorSubgraph() {
    const translatorGraph = new StateGraph(TranslatorSubgraphAnnotation)
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
        .addConditionalEdges(
            "parser",
            continueToTranslations,
            ["translator", "combiner"]
        )
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