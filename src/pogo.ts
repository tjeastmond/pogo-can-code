import CodeFiles from "@codeFiles";
import { MessageContent } from "@langchain/core/messages";
import PogoAI from "@llms";
import prompts from "@prompts";
import chalk from "chalk";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import ora from "ora";

type ParsedCommand = {
  command: string;
  message: string;
};

const COMMANDS = ["/exit", "/files", "/review", "/test"];

const llm = new PogoAI();
const files = new CodeFiles(".");

const spinner = ora({
  color: "blue",
  discardStdin: false,
  indent: 1,
  text: chalk.dim("Pogo is Thinking..."),
});

async function answer(message: MessageContent | string) {
  console.log(`\n${message.toString()}\n`);
}

function prompt(input: string, prompt: string) {
  return prompt + input;
}

async function chat(message: string): Promise<void> {
  spinner.start();
  const response = await llm.chat(message);
  spinner.stop();
  await answer(response.trim());
}

async function filesContext(filePaths: string[]) {
  let context: string = "";
  for (const path of filePaths) {
    const fileContent = await files.read(path);
    if (fileContent) {
      context += `"### FILE: ${path}` + "\n" + fileContent + "\n";
    }
  }

  return context;
}

function parseInput(input: string): ParsedCommand {
  if (isCommand(input)) {
    const firstSpaceIndex = input.indexOf(" ");
    const command = firstSpaceIndex > 0 ? input.substring(1, firstSpaceIndex) : input.substring(1);
    const message = firstSpaceIndex > 0 ? input.substring(firstSpaceIndex + 1).trim() : "";
    return { command, message };
  }

  return { command: "", message: "" };
}

function isCommand(input: string): boolean {
  return input.startsWith("/");
}

export default async function Pogo(): Promise<void> {
  const readline = createInterface({
    input,
    output,
    completer: (line: string): [string[], string] => {
      const completions = COMMANDS;
      const hits = completions.filter((c) => c.startsWith(line));
      return [hits.length ? hits : completions, line];
    },
  });

  while (true) {
    let userInput = await readline.question(chalk.yellowBright.bold(">>> "));
    if (userInput === "") continue;

    const { command, message } = parseInput(userInput);
    if (command && commandHandlers[command]) {
      await commandHandlers[command](message);
      if (command === "exit") break;
      continue;
    }

    await chat(prompt(userInput, prompts.SIMPLE_CREATE));
  }

  readline.close();
}

const commandHandlers: Record<string, (input: string) => Promise<void>> = {
  exit: async () => {
    return;
  },

  files: async () => {
    console.log("\n", chalk.magenta.bold("Files:"), "\n");

    const fileList = files.listFiles();
    for (const file of fileList) {
      console.log(chalk.dim(" -"), chalk.green(file));
    }

    console.log();
  },

  review: async (input: string) => {
    console.log("\n", chalk.magenta.bold("Review:"), "\n");
    const context = await filesContext([input]);
    await chat(prompt(context, prompts.REVIEW));
  },

  test: async () => {
    await chat(prompt("write a hello world function in typescript", prompts.SIMPLE_CREATE));
  },
};
