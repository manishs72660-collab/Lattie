import { Annotation } from "@langchain/langgraph";

const last = (d) => ({ reducer: (_, y) => y, default: () => d });

export const AgentState = Annotation.Root({
  userId: Annotation(last("")),
  question: Annotation(last("")), // what the user asked (used for the final answer)
  query: Annotation(last("")), // current retrieval query (changes when rewritten)
  route: Annotation(last("vector")), // vector | graph | web
  documents: Annotation(last([])),
  generation: Annotation(last("")),
  rewrites: Annotation(last(0)),
  genTries: Annotation(last(0)),
  webTried: Annotation(last(false)),
  grounded: Annotation(last(true)),
  steps: Annotation({ reducer: (x, y) => x.concat(y), default: () => [] }),
});
