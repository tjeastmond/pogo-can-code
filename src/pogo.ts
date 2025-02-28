import CodeFiles from "@codeFiles";
import { MessageContent } from "@langchain/core/messages";
import PogoAI from "@models";
import { SIMPLE_CREATE_PROMPT } from "@prompts";
import chalk from "chalk";
import clipboardy from "clipboardy";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import ora from "ora";

const llm = new PogoAI();
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

async function answer(message: MessageContent | string): Promise<void> {
  console.log("\n", message, "\n");
}

async function chat(message: string): Promise<void> {
  const request = SIMPLE_CREATE_PROMPT + message;

  spinner.start();
  const response = await llm.chat(request);
  spinner.stop();

  clipboardy.writeSync(response);

  await answer(response);
}

function is(input: string, compare: string[]): boolean {
  if (input === "") return false;
  for (const c of compare) {
    if (input.toLowerCase() === c) return true;
  }
  return false;
}

export default async function Pogo(): Promise<void> {
  const files = new CodeFiles(".");
  const readline = createInterface({
    input,
    output,
    completer: (line: string): [string[], string] => {
      const completions = ["/exit", "/files", "/test"];
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
      const fileList = files.listFiles();
      console.log("\n", chalk.magenta.bold("Files:"), "\n");
      for (const file of fileList) {
        console.log(chalk.dim(" -"), chalk.green(file));
      }

      console.log();
      continue;
    }

    await chat(userInput);
  }

  readline.close();
}
