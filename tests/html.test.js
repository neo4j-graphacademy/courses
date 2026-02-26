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
        const lower = text.toLowerCase();

        const found = [];
        let searchFrom = 0;
        while (true) {
          const idx = lower.indexOf("unresolved directive", searchFrom);
          if (idx === -1) break;

          const lineNumber = text.substring(0, idx).split("\n").length;

          // Extract the enclosing <p> text for context
          const pStart = text.lastIndexOf("<p>", idx);
          const pEnd = text.indexOf("</p>", idx);
          const paragraph =
            pStart !== -1 && pEnd !== -1
              ? text.substring(pStart + 3, pEnd).trim()
              : text.substring(idx, idx + 120).trim();

          found.push(`Line ${lineNumber}: ${paragraph}`);
          searchFrom = idx + 1;
        }

        if (found.length) {
          throw new Error(found.join("\n"));
        }
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
            `Broken header lines found outside <code> blocks:\n${errorLines}`,
          );
        }
      });

      it("should not have unrendered AsciiDoc section markers", () => {
        const buffer = readFileSync(file);
        const text = buffer.toString();

        const CODE_BLOCK_REGEX = /<code[^>]*>[\s\S]*?<\/code>/gi;
        const PRE_BLOCK_REGEX = /<pre[^>]*>[\s\S]*?<\/pre>/gi;
        const textWithoutCode = text
          .replace(CODE_BLOCK_REGEX, "")
          .replace(PRE_BLOCK_REGEX, "");

        const matches = [];

        const NEWLINE_EQ_REGEX = /\n==/g;
        let match;
        while ((match = NEWLINE_EQ_REGEX.exec(textWithoutCode)) !== null) {
          const lineNumber = textWithoutCode
            .substring(0, match.index)
            .split("\n").length;
          matches.push(`Line ${lineNumber}: "\\n==" found`);
        }

        const P_EQ_REGEX = /<p>==/g;
        while ((match = P_EQ_REGEX.exec(textWithoutCode)) !== null) {
          const lineNumber = textWithoutCode
            .substring(0, match.index)
            .split("\n").length;
          matches.push(`Line ${lineNumber}: "<p>==" found`);
        }

        if (matches.length) {
          throw new Error(
            `Unrendered AsciiDoc section markers found:\n${matches.join("\n")}`,
          );
        }
      });
    });
  }
});
