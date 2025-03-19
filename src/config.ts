export const slashCommands = ["/copy", "/exit", "/files", "/review", "/test"];
export const commands = slashCommands.map((c) => c.slice(1));

export const prompts = {
  SIMPLE_CREATE: "simple_create",
  REVIEW: "review",
};

export const pogoIsThinking = "Pogo is thinking...";
export const invalidCommand = "Invalid command";

export const defaultLLM = "openai";
export const defaultModels = {
  openai: "gpt-4o-mini",
};

export const ignoreFilePatterns = ["^\\.git", "^\\.", "^node_modules"];

export default {
  commands,
  defaultLLM,
  defaultModels,
  ignoreFilePatterns,
  invalidCommand,
  pogoIsThinking,
  prompts,
  slashCommands,
};
