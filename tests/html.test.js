const { readFileSync } = require("fs");
const { globSync } = require("glob");
const { globJoin } = require("./utils");

describe("html generation", () => {
  const files = globSync(globJoin(__dirname, "..", "build", "**", "*.html"));

  for (const file of files) {
    describe(file, () => {
      it("should not have an unresolved directive", () => {
        const buffer = readFileSync(file);
        const text = buffer.toString();

        expect(text).not.toContain("unresolved directive");
      });

      it("should not have broken headers", () => {
        const buffer = readFileSync(file);
        const text = buffer.toString();

        // Remove all <code>...</code> and <pre>...</pre> blocks
        const CODE_BLOCK_REGEX = /<code[^>]*>[\s\S]*?<\/code>/gi;
        const PRE_BLOCK_REGEX = /<pre[^>]*>[\s\S]*?<\/pre>/gi;
        const textWithoutCode = text
          .replace(CODE_BLOCK_REGEX, "")
          .replace(PRE_BLOCK_REGEX, "");

        // Find broken headers (=+ followed by space and text) at the start of a line
        const BROKEN_HEADER_REGEX = /^(=+\s+[^<\n]+)/gm;
        const brokenHeaders = [];
        let match;
        while ((match = BROKEN_HEADER_REGEX.exec(textWithoutCode)) !== null) {
          const lineNumber = textWithoutCode
            .substring(0, match.index)
            .split("\n").length;
          brokenHeaders.push({ line: lineNumber, text: match[1] });
        }
        if (brokenHeaders.length) {
          const errorLines = brokenHeaders
            .map(({ line, text }) => `Line ${line}: "${text.trim()}"`)
            .join("\n");
          throw new Error(
            `Broken header lines found outside <code> blocks:\n${errorLines}`
          );
        }
      });
    });
  }
});
