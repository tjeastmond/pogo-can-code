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
  request: string;
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

// function clearCLI() {
//   cursorTo(process.stdout, 0, 0);
//   clearScreenDown(process.stdout);
// }

async function answer(message: MessageContent | string) {
  console.log("\n", message, "\n");
}

function prompt(input: string, prompt: string) {
  return prompt + input;
}

async function chat(message: string): Promise<void> {
  spinner.start();
  const response = await llm.chat(message);
  spinner.stop();
  // clipboardy.writeSync(response);
  await answer(response);
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

function is(input: string, compare: string[]): boolean {
  if (input === "") return false;
  for (const c of compare) {
    if (input.toLowerCase() === c) return true;
  }
  return false;
}

function isCommand(input: string): boolean {
  return input.startsWith("/");
}

function parseCommand(input: string): ParsedCommand {
  if (input.substring(0, 7) === "/review") {
    return { command: "review", request: input.substring(7).trim() };
  }

  return { command: "", request: "" };
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
    if (is(userInput, ["/exit", "/e"])) break;
    if (is(userInput, ["/test", "."])) userInput = "write a hello world function in typescript";

    if (is(userInput, ["/files", "/f"])) {
      console.log("\n", chalk.magenta.bold("Files:"), "\n");

      const fileList = files.listFiles();
      for (const file of fileList) {
        console.log(chalk.dim(" -"), chalk.green(file));
      }

      console.log();
      continue;
    }

    if (isCommand(userInput)) {
      const command = parseCommand(userInput);

      if (command.command === "") {
        console.log(chalk.red("Invalid Command"));
        continue;
      }

      if (command.command === "review") {
        console.log("\n", chalk.magenta.bold("Review:"), "\n");
        const context = await filesContext([command.request]);
        await chat(prompt(context, prompts.REVIEW));
        continue;
      }
    }

    await chat(prompt(userInput, prompts.SIMPLE_CREATE));
  }

  readline.close();
}
