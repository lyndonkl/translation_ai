import { START, END, StateGraph } from "@langchain/langgraph";
import { TranslatorStateAnnotation } from "../../state";
import { mainTranslator, reviewer, refiner } from "./nodes";

export { mainTranslator, reviewer, refiner };

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