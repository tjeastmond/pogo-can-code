import { promises as fs } from "fs";
import { join } from "path";

class CodeFiles {
  private directory: string;
  private fileMap: Map<string, boolean>;

  constructor(directory: string) {
    this.directory = directory;
    this.fileMap = new Map();
  }

  private async loadDirectory(dir: string, recursive: boolean): Promise<void> {
    const items = await fs.readdir(dir);
    await Promise.all(
      items.map(async (item) => {
        const fullPath = join(dir, item);
        const stat = await fs.stat(fullPath);
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

  async initialize(recursive: boolean = true): Promise<void> {
    await this.loadDirectory(this.directory, recursive);
  }

  async isBinary(filePath: string): Promise<boolean> {
    const content = await fs.readFile(filePath);
    return content.includes(0);
  }

  async listFiles(): Promise<string[]> {
    return Array.from(this.fileMap.keys()).filter((file) => !this.fileMap.get(file));
  }

  async listDirectories(): Promise<string[]> {
    return Array.from(this.fileMap.keys()).filter((dir) => this.fileMap.get(dir));
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
