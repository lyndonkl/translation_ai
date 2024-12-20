import { START, END, StateGraph, Send } from "@langchain/langgraph";
import { TranslatorStateAnnotation } from "./state";
import { parseContent, combineTranslations } from "./nodes";
import { TranslationMetadata, TranslationBlock } from "./types";
import { mainTranslator, reviewer, refiner, TranslatorSubgraphAnnotation } from "./nodes/translator";

interface SubgraphStateMap {
    block: TranslationBlock;
    metadata: TranslationMetadata;
}

const continueFromTranslator = (state: typeof TranslatorSubgraphAnnotation.State) => {
    if (state.fastTranslate) {
        return END;
    }
    return "reviewer";
};

const translatorSubgraph = createTranslatorSubgraph();

// Function to call translator subgraph and transform state
const callTranslatorGraph = async (state: SubgraphStateMap): Promise<Partial<typeof TranslatorStateAnnotation.State>> => {
    
    // Transform main state to subgraph state
    const subgraphInput = {
        block: state.block,
        metadata: state.metadata,
        translation: ""
    };

    // Call subgraph
    return translatorSubgraph.invoke(subgraphInput)
        .then(subgraphOutput => ({
            translations: [subgraphOutput.translation]
        }));
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
            metadata: state.metadata,
            fastTranslate: state.fastTranslate
        })
    );
};

export function createTranslatorSubgraph() {
    const translatorGraph = new StateGraph(TranslatorSubgraphAnnotation)
        .addNode("translator", mainTranslator)
        .addNode("reviewer", reviewer)
        .addNode("refiner", refiner)
        .addEdge(START, "translator")
        .addConditionalEdges(
            "translator",
            continueFromTranslator,
            {
                "reviewer": "reviewer",
                END: END
            }
        )
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
  plainText: boolean,
  fastTranslate: boolean
) {
  const graph = createTranslationGraph();
  const result = await graph.invoke({
    htmlContent,
    metadata,
    paragraphs: [],
    translations: [],
    messages: [],
    plainText,
    fastTranslate
  });
  
  return result;
}

const translatorGraph = createTranslationGraph();

export { translatorGraph };