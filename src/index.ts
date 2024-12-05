import { START, END, StateGraph, Send } from "@langchain/langgraph";
import { TranslatorStateAnnotation } from "./state";
import { parseContent, combineTranslations } from "./nodes";
import { Paragraph, TranslationMetadata } from "./types";
import { mainTranslator, reviewer, refiner, TranslatorSubgraphAnnotation } from "./nodes/translator";

interface SubgraphStateMap {
    paragraph: Paragraph;
    metadata: TranslationMetadata;
}

// Function to call translator subgraph and transform state
const callTranslatorGraph = async (state: SubgraphStateMap) => {
    const translatorSubgraph = createTranslatorSubgraph();
    
    // Transform main state to subgraph state
    const subgraphInput = {
        paragraph: state.paragraph,
        metadata: state.metadata,
        translation: ""
    };

    // Call subgraph
    const subgraphOutput = await translatorSubgraph.invoke(subgraphInput);
    
    // Transform subgraph output back to main state
    return {
        translations: [subgraphOutput.translation]
    };
};

// Function to map paragraphs to translator tasks
const continueToTranslations = (state: typeof TranslatorStateAnnotation.State) => {
    if (state.paragraphs.length === 0) {
        return new Send("combiner", state);
    }
    // Send each paragraph to translator node
    return state.paragraphs.map(
        (paragraph) => new Send("translatorNode", { paragraph, metadata: state.metadata })
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
    const graph = new StateGraph(TranslatorStateAnnotation)
        .addNode("parser", parseContent)
        .addNode("translatorNode", callTranslatorGraph)
        .addNode("combiner", combineTranslations)
        .addEdge(START, "parser")
        .addConditionalEdges(
            "parser",
            continueToTranslations,
            ["translatorNode", "combiner"]
        )
        .addEdge("translatorNode", "combiner")
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