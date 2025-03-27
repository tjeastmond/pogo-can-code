import Files from "@app/files";
import PogoAI from "@app/llms";
import parseInput from "@app/parseInput";
import prompts from "@app/prompts";
import { MessageContent } from "@langchain/core/messages";
import chalk from "chalk";
import clipboardy from "clipboardy";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import ora from "ora";
import config from "@app/config";

const llm = new PogoAI();
const files = new Files(config.cwd);
const spinner = ora(config.spinnerOptions);

async function answer(message: MessageContent | string) {
  const msg = message.toString();
  console.log(`\n${msg}\n`);
}

function prompt(input: string, prompt: string) {
  return prompt + input;
}

async function chat(message: string): Promise<void> {
  spinner.start();
  const response = await llm.chat(message);
  spinner.stop();
  await answer(response!.trim());
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

export default async function Pogo(): Promise<void> {
  const readline = createInterface({
    input,
    output,
    completer: (line: string): [string[], string] => {
      const completions = config.slashCommands;
      const hits = completions.filter((c) => c.startsWith(line));
      return [hits.length ? hits : completions, line];
    },
  });

  while (true) {
    let userInput = await readline.question(chalk.yellowBright.bold(">>> "));
    if (userInput === "") continue;

    const { command, message, filePaths } = parseInput(userInput);
    if (command && commandHandlers[command]) {
      await commandHandlers[command](filePaths, message);
      if (command === "exit") break;
      continue;
    }

    await chat(prompt(userInput, prompts.SIMPLE_CREATE));
  }

  readline.close();
}

const commandHandlers: CommandHandlers = {
  copy: async () => {
    const lastMessage = await llm.getLastMessage();
    if (lastMessage) {
      await clipboardy.write(lastMessage!);
      answer(chalk.green("Copied to clipboard"));
      return;
    }

    answer(chalk.red("Nothing to copy"));
  },

  add: async (filePaths) => {
    const context = await filesContext(filePaths);
    console.log(context);
  },

  exit: async () => {
    return;
  },

  files: async () => {
    console.log("\n" + chalk.magenta.bold("Files:") + "\n");

    const fileList = files.listFiles();
    for (const file of fileList) {
      console.log(chalk.dim(" -"), chalk.green(file));
    }

    console.log();
  },

  invalid: async () => {
    console.log("\n" + chalk.red.bold(config.invalidCommand) + "\n");
  },

  review: async (filePaths) => {
    console.log("\n" + chalk.magenta.bold("Review:") + "\n");
    const context = await filesContext(filePaths);
    await chat(prompt(context, prompts.REVIEW));
  },

  test: async () => {
    await chat(prompt("write a hello world function in typescript", prompts.SIMPLE_CREATE));
  },
};
