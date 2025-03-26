import config from "@app/config";
import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { v4 as uuidv4 } from "uuid";

const LLM_PROVIDER = process.env.LLM_PROVIDER || config.defaultLLM;

export default class PogoAI {
  private model!: ChatOpenAI;
  private llm: any;
  private workflow: any;
  private memory!: MemorySaver;
  private config: { configurable: { thread_id: string } };
  private lastMessage: string | null = null;

  constructor() {
    this.config = { configurable: { thread_id: uuidv4() } };
    this.init();
  }

  async init() {
    await this.initModel();
    await this.initWorkflow();
    await this.initLLM();
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
    this.memory = new MemorySaver();
    this.llm = this.workflow.compile({ checkpointer: this.memory });
  }

  async initModel(): Promise<void> {
    switch (LLM_PROVIDER.toLowerCase()) {
      case "openai":
        this.model = new ChatOpenAI({
          modelName: config.defaultModels.openai,
          openAIApiKey: process.env.OPENAI_API_KEY,
          streaming: false,
        });
        break;

      case "openaiturbo":
        this.model = new ChatOpenAI({
          modelName: config.defaultModels.openaiturbo,
          openAIApiKey: process.env.OPENAI_API_KEY,
          streaming: false,
          temperature: 0,
        });
        break;

      default:
        throw new Error("Invalid LLM provider");
    }
  }

  async getLastMessage(): Promise<string | null> {
    return this.lastMessage;
  }

  async chat(content: string) {
    const messages = [{ role: "user", content }];
    const response = await this.llm.invoke({ messages }, this.config);
    this.lastMessage = response.messages[response.messages.length - 1]?.content ?? null;
    return this.lastMessage;
  }
}
