import { MessageContent } from "@langchain/core/messages";
import PogoAI from "@models";
import { SIMPLE_CREATE_PROMPT } from "@prompts";
import chalk from "chalk";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import ora from "ora";

const llm = new PogoAI();
const readline = createInterface({ input, output });

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

async function answer(message: MessageContent): Promise<void> {
  console.log("\n" + message + "\n");
}

async function chat(message: string): Promise<void> {
  const request = SIMPLE_CREATE_PROMPT + message;

  spinner.start();
  const response = await llm.chat(request);
  spinner.stop();

  await answer(response);
}

function is(input: string, compare: string[]): boolean {
  if (input === "") return false;

  for (const c of compare) {
    if (input.toLowerCase() === c) return true;
  }

  return false;
}

export default async function startChat(): Promise<void> {
  while (true) {
    let userInput = await readline.question(chalk.yellowBright.bold(">>> "));

    if (userInput === "") continue;
    if (is(userInput, ["/exit", "exit"])) break;
    if (is(userInput, ["/test", "."])) userInput = "write a hello world function in typescript";

    await chat(userInput);
  }

  readline.close();
}
