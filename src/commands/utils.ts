/**
 * Shared CLI utilities for all commands.
 */

/**
 * Parse --key value or --key=value pairs from process.argv.
 * Returns a map of key → value (without the -- prefix).
 */
export function parseArgs(argv: string[]): Map<string, string> {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        args.set(arg.slice(2, eqIdx), arg.slice(eqIdx + 1));
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("--")) {
          args.set(arg.slice(2), next);
          i++;
        } else {
          args.set(arg.slice(2), "true");
        }
      }
    }
  }
  return args;
}
