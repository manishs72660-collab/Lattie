import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState } from "./state.js";
import { router, retrieveVector, retrieveGraph, retrieveWeb, gradeDocs, rewrite, generate, checkAnswer, afterGrade, afterCheck } from "./nodes.js";

const workflow = new StateGraph(AgentState)
  .addNode("router", router)
  .addNode("retrieveVector", retrieveVector)
  .addNode("retrieveGraph", retrieveGraph)
  .addNode("retrieveWeb", retrieveWeb)
  .addNode("gradeDocs", gradeDocs)
  .addNode("rewrite", rewrite)
  .addNode("generate", generate)
  .addNode("checkAnswer", checkAnswer)

  .addEdge(START, "router")
  .addConditionalEdges("router", (s) => s.route, {
    vector: "retrieveVector",
    graph: "retrieveGraph",
    web: "retrieveWeb",
  })
  .addEdge("retrieveVector", "gradeDocs")
  .addEdge("retrieveGraph", "gradeDocs")
  .addEdge("retrieveWeb", "generate")
  .addConditionalEdges("gradeDocs", afterGrade, { generate: "generate", rewrite: "rewrite", web: "retrieveWeb" })
  .addEdge("rewrite", "router")
  .addEdge("generate", "checkAnswer")
  .addConditionalEdges("checkAnswer", afterCheck, { done: END, retry: "generate" });

export const agent = workflow.compile();

export const initialState = (userId, question) => ({ userId, question, query: question });
export const runAgent = (userId, question) => agent.invoke(initialState(userId, question), { recursionLimit: 25 });

// Mermaid diagram for the README: node -e "import('./src/agent/workflow.js').then(m=>m.agent.getGraphAsync()).then(g=>console.log(g.drawMermaid()))"
