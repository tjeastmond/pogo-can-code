import { promises as fs } from "fs";
import { join } from "path";

const IGNORE_PATTERNS = ["^\\.git", "^\\.", "^node_modules"];

export default class CodeFiles {
  private directory: string;
  private fileMap: Map<string, boolean>;
  private ignorePatterns: RegExp[];

  constructor(directory: string) {
    this.directory = directory;
    this.fileMap = new Map();
    this.ignorePatterns = IGNORE_PATTERNS.map((pattern) => new RegExp(pattern));
    this.initialize();
  }

  private async loadDirectory(dir: string, recursive: boolean): Promise<void> {
    const items = await fs.readdir(dir);
    await Promise.all(
      items.map(async (item) => {
        const fullPath = join(dir, item);
        const stat = await fs.stat(fullPath);

        if (this.shouldIgnore(item)) {
          return;
        }

        if (stat.isDirectory()) {
          this.fileMap.set(fullPath, true);
          if (recursive) {
            await this.loadDirectory(fullPath, recursive);
          }
        } else {
          this.fileMap.set(fullPath, false);
        }
      }),
    );
  }

  private shouldIgnore(item: string): boolean {
    return this.ignorePatterns.some((pattern) => pattern.test(item));
  }

  initialize(recursive: boolean = true): void {
    this.loadDirectory(this.directory, recursive);
  }

  async isBinary(filePath: string): Promise<boolean> {
    const content = await fs.readFile(filePath);
    return content.includes(0);
  }

  listFiles(): string[] {
    return Array.from(this.fileMap.keys()).filter((file) => !this.fileMap.get(file));
  }

  async listDirectories(): Promise<string[]> {
    return Array.from(this.fileMap.keys()).filter((dir) => this.fileMap.get(dir));
  }

  async read(filePath: string): Promise<string | null> {
    if (await this.isBinary(filePath)) return null;
    const content = await fs.readFile(filePath, "utf8");
    return content;
  }

  async write(fileName: string, content: string): Promise<void> {
    await fs.writeFile(join(this.directory, fileName), content);
  }

  async createFile(fileName: string): Promise<void> {
    await fs.writeFile(join(this.directory, fileName), "");
  }

  async createDirectory(dirName: string): Promise<void> {
    await fs.mkdir(join(this.directory, dirName));
  }
}
