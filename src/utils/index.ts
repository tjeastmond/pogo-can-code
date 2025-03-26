/**
 * Determine if a given string is a file path.
 *
 * A file path is a string that matches any of these criteria:
 * - Absolute path (Unix/Mac style starting with /)
 * - Relative path (starting with ./ or ../)
 * - Windows style path (with \ or drive letter)
 * - File with extension (ending in .extension)
 *
 * Note: This is a basic check and does not validate if the path actually exists.
 * URLs that look like file paths will return false.
 *
 * @param {string} path - The string to check.
 * @returns {boolean} true if the string appears to be a file path, false otherwise.
 */
export function isFilePath(path: string): boolean {
  if (!path || typeof path !== "string") {
    return false;
  }

  // exclude urls
  if (/^[a-zA-Z]+:\/\//.test(path)) {
    return false;
  }

  return (
    // unix/mac absolute paths
    path.startsWith("/") ||
    // relative paths
    path.startsWith("./") ||
    path.startsWith("../") ||
    // windows paths (drive letter or backslash)
    /^[a-zA-Z]:\\/.test(path) ||
    path.includes("\\") ||
    // files with extensions (more precise regex)
    /\.[a-zA-Z0-9]{1,10}$/.test(path)
  );
}
