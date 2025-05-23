import chalk from "chalk";
import { Options } from "ora";

export const cwd = ".";
export const slashCommands = ["/copy", "/edit", "/exit", "/files", "/review", "/test"];
export const commands = slashCommands.map((c) => c.slice(1));
export const ignoreFilePatterns = ["^\\.git", "^\\.", "^node_modules"];
export const pogoIsThinking = "Pogo is thinking...";
export const invalidCommand = "Invalid command";
export const missingRequest = "You must supply a request";

export const defaultLLM = "openaiturbo";
export const defaultModels = {
  openai: "o3-mini-2025-01-31",
  openaiturbo: "gpt-3.5-turbo",
  openai4mini: "gpt-4o-mini",
};

export const prompts = {
  SIMPLE_CREATE: "simple_create",
  REVIEW: "review",
  EDIT: "edit2",
};

export const spinnerOptions: Options = {
  color: "blue",
  discardStdin: false,
  indent: 1,
  text: chalk.dim(pogoIsThinking),
};

export default {
  commands,
  cwd,
  defaultLLM,
  defaultModels,
  ignoreFilePatterns,
  invalidCommand,
  missingRequest,
  pogoIsThinking,
  prompts,
  slashCommands,
  spinnerOptions,
};
