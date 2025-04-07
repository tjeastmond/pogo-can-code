import { isFilePath } from './index';

describe('isFilePath', () => {
  it('should return true for absolute paths', () => {
    expect(isFilePath('/path/to/file')).toBe(true);
    expect(isFilePath('/root/file.txt')).toBe(true);
  });

  it('should return true for relative paths starting with ./', () => {
    expect(isFilePath('./file')).toBe(true);
    expect(isFilePath('./path/to/file.js')).toBe(true);
  });

  it('should return true for parent directory paths starting with ../', () => {
    expect(isFilePath('../file')).toBe(true);
    expect(isFilePath('../../path/to/file.css')).toBe(true);
  });

  it('should return true for Windows-style paths with backslashes', () => {
    expect(isFilePath('C:\\path\\to\\file')).toBe(true);
    expect(isFilePath('folder\\file.txt')).toBe(true);
  });

  it('should return true for files with extensions', () => {
    expect(isFilePath('file.txt')).toBe(true);
    expect(isFilePath('document.pdf')).toBe(true);
    expect(isFilePath('script.js')).toBe(true);
  });

  it('should return false for non-file-path strings', () => {
    expect(isFilePath('regular string')).toBe(false);
    expect(isFilePath('no-extension')).toBe(false);
    expect(isFilePath('')).toBe(false);
  });

  it('should return false for URLs', () => {
    expect(isFilePath('http://example.com/file.txt')).toBe(false);
    expect(isFilePath('https://example.com/path/to/file')).toBe(false);
    expect(isFilePath('ftp://server/file.pdf')).toBe(false);
  });

  it('should return false for non-string inputs', () => {
    expect(isFilePath(null as any)).toBe(false);
    expect(isFilePath(undefined as any)).toBe(false);
    expect(isFilePath({} as any)).toBe(false);
    expect(isFilePath([] as any)).toBe(false);
    expect(isFilePath(42 as any)).toBe(false);
  });
});
