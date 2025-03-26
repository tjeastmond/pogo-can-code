import parseInput from "@app/parseInput";

describe("parseInput", () => {
  it("should treat non-command input as a message", () => {
    const input = "This is a regular message";
    const result = parseInput(input);
    expect(result).toEqual({
      command: "",
      filePaths: [],
      message: "This is a regular message",
    });
  });

  it("should return invalid for an unknown command", () => {
    const input = "/unknown ./file.txt Some message";
    const result = parseInput(input);
    expect(result).toEqual({
      command: "invalid",
      filePaths: [],
      message: "",
    });
  });

  it("should parse a command with a single file path and a message", () => {
    const input = "/review ./file.txt This is a message";
    const result = parseInput(input);
    expect(result).toEqual({
      command: "review",
      filePaths: ["./file.txt"],
      message: "This is a message",
    });
  });

  it("should parse a command with multiple file paths and a message", () => {
    const input = "/add /abs/path/file.txt ./relative/path.txt Some message about adding";
    const result = parseInput(input);
    expect(result).toEqual({
      command: "add",
      filePaths: ["/abs/path/file.txt", "./relative/path.txt"],
      message: "Some message about adding",
    });
  });

  it("should not treat non-file-like parts as file paths", () => {
    const input = "/add NotAFilePath should be message";
    const result = parseInput(input);
    expect(result).toEqual({
      command: "add",
      filePaths: [],
      message: "NotAFilePath should be message",
    });
  });

  it("should handle a command without any file paths or message", () => {
    const input = "/copy";
    const result = parseInput(input);
    expect(result).toEqual({
      command: "copy",
      filePaths: [],
      message: "",
    });
  });
});
