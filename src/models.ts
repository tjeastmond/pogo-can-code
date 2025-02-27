import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { v4 as uuidv4 } from "uuid";

const LLM_PROVIDER = process.env.LLM_PROVIDER || "openai";

export default class PogoAI {
  private model: any;
  private llm: any;
  private workflow: any;
  private config: any;

  constructor() {
    this.config = { configurable: { thread_id: uuidv4() } };
    this.initModel();
    this.initWorkflow();
    this.initLLM();
  }

  async initWorkflow() {
    const callModel = async (state: typeof MessagesAnnotation.State) => {
      const response = await this.model.invoke(state.messages);
      return { messages: response };
    };

    this.workflow = new StateGraph(MessagesAnnotation)
      .addNode("model", callModel)
      .addEdge(START, "model")
      .addEdge("model", END);
  }

  async initLLM(): Promise<void> {
    const memory = new MemorySaver();
    this.llm = this.workflow.compile({ checkpointer: memory });
  }

  async initModel(): Promise<void> {
    switch (LLM_PROVIDER.toLowerCase()) {
      case "openai":
        this.model = new ChatOpenAI({
          modelName: "gpt-4o-mini",
          openAIApiKey: process.env.OPENAI_API_KEY,
          temperature: 0,
          streaming: false,
        });
        break;

      default:
        throw new Error("Invalid LLM provider");
    }
  }

  async chat(content: string) {
    const messages = [{ role: "user", content }];
    const response = await this.llm.invoke({ messages }, this.config);
    const lastMessage = response.messages[response.messages.length - 1];
    return lastMessage.content;
  }
}
