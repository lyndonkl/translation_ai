import { START, END, StateGraph, Send } from "@langchain/langgraph";
import { TranslatorStateAnnotation } from "./state";
import { parseContent, combineTranslations } from "./nodes";
import { TranslationMetadata, TranslationBlock } from "./types";
import { mainTranslator, reviewer, refiner, combiner, TranslatorSubgraphAnnotation } from "./nodes/translator";
import { USER_REFINER } from "./constants";

const passToNextState = (state: typeof TranslatorSubgraphAnnotation.State): string => {
    const currentState = state.currentState;

    if (currentState === USER_REFINER) {
        return "combiner";
    }
    return currentState.endsWith("REVIEWER") ? "reviewer" : "refiner";
};

const translatorSubgraph = createTranslatorSubgraph();

// Function to call translator subgraph and transform state
const callTranslatorGraph = async (state: typeof TranslatorStateAnnotation.State): Promise<Partial<typeof TranslatorStateAnnotation.State>> => {
    
    // Transform main state to subgraph state
    const subgraphInput = {
        input: state.blocks.map(block => block.content).join('<SEPARATOR>'),
        metadata: state.metadata,
    };

    // Call subgraph
    return translatorSubgraph.invoke(subgraphInput)
        .then(subgraphOutput => {
            const translations = subgraphOutput.translation.split('<SEPARATOR>');
            return {
                blocks: state.plainText ? 
                    state.blocks.map((block, index) => index === 0 ? 
                        { ...block, translation: subgraphOutput.translation } : block
                    ) :
                    state.blocks.map((block, index) => {
                        if (state.indexToBlockId[index] === block.id) {
                            return {
                                ...block,
                                translation: translations[index]
                            };
                        }
                        return block;
                    }),
                criticisms: subgraphOutput.criticisms,
                intermediateTranslations: subgraphOutput.intermediateTranslation,
                finalTranslation: subgraphOutput.translation
            };
        });
};

export function createTranslatorSubgraph() {
    const translatorGraph = new StateGraph(TranslatorSubgraphAnnotation)
        .addNode("translator", mainTranslator)
        .addNode("reviewer", reviewer)
        .addNode("refiner", refiner)
        .addNode("combiner", combiner)
        .addEdge(START, "translator")
        .addEdge("translator", "reviewer")
        .addEdge("reviewer", "refiner")
        .addConditionalEdges(
            "refiner",
            passToNextState,
            {
                "reviewer": "reviewer",
                "refiner": "refiner",
                "combiner": "combiner"
            }
        )
        .addEdge("combiner", END)
        .compile();

    return translatorGraph;
}

// Function to map paragraphs to translator tasks
const continueToTranslations = (state: typeof TranslatorStateAnnotation.State) => {
    if (state.blocks.length === 0) {
        return "combiner";
    }

    // Send each block to translator node
    return "translatorNode";
};

export function createTranslationGraph() {
    const graph = new StateGraph(TranslatorStateAnnotation)
        .addNode("parser", parseContent)
        .addNode("translatorNode", callTranslatorGraph)
        .addNode("combiner", combineTranslations)
        .addEdge(START, "parser")
        .addConditionalEdges(
            "parser",
            continueToTranslations,
            {   
                "translatorNode": "translatorNode",
                "combiner": "combiner"
            }
        )
        .addEdge("translatorNode", "combiner")
        .addEdge("combiner", END)
        .compile();

    return graph;
}

export async function translateContent(
  input: string,
  metadata: TranslationMetadata,
  plainText: boolean
) {
  const graph = createTranslationGraph();
  const result = await graph.invoke({
    input,
    metadata,
    plainText,
  });
  
  return result;
}

const translatorGraph = createTranslationGraph();

export { translatorGraph };