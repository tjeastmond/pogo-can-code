import config from "@app/config";
import { isFilePath } from "@app/utils";

export default function parseInput(input: string): ParsedCommand {
  if (!input.startsWith("/")) {
    return { command: "", filePaths: [], message: input };
  }

  const parts = input.trim().split(/\s+/);
  const command = parts[0].substring(1);

  if (!config.commands.includes(command)) {
    return { command: "invalid", filePaths: [], message: "" };
  }

  let index = 1;
  const filePaths: string[] = [];

  while (index < parts.length && isFilePath(parts[index])) {
    filePaths.push(parts[index]);
    index++;
  }

  const message = parts.slice(index).join(" ");

  return { command, filePaths, message };
}
