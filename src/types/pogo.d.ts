interface ParsedCommand {
  command: string;
  filePaths: string[];
  message: string;
}

interface CommandHandlers {
  [command: string]: (filePaths: string[], message?: string) => Promise<void>;
}
