import { START, END, StateGraph, Send } from "@langchain/langgraph";
import { TranslatorStateAnnotation } from "./state";
import { parseContent, combineTranslations } from "./nodes";
import { TranslationMetadata, TranslationBlock } from "./types";
import { mainTranslator, reviewer, refiner, TranslatorSubgraphAnnotation } from "./nodes/translator";

interface SubgraphStateMap {
    block: TranslationBlock;
    metadata: TranslationMetadata;
}

const translatorSubgraph = createTranslatorSubgraph();

// Function to call translator subgraph and transform state
const callTranslatorGraph = async (state: SubgraphStateMap) => {
    
    // Transform main state to subgraph state
    const subgraphInput = {
        block: state.block,
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
    if (state.blocks.length === 0) {
        return new Send("combiner", state);
    }
    // Send each block to translator node
    return state.blocks.map(
        (block) => new Send("translatorNode", { 
            block,
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

const translatorGraph = createTranslationGraph();

export { translatorGraph };