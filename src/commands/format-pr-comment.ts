import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = process.cwd();

export interface Warning {
  header: string;
  lines: string[];
}

export interface TestFailure {
  file: string;
  testName: string;
  message: string;
}

// Extract ⚠️ warning blocks, keeping only the asciidoctor error lines
export function parseWarnings(output: string): Warning[] {
  const warnings: Warning[] = [];
  let current: Warning | null = null;

  for (const line of output.split("\n")) {
    if (line.startsWith("⚠️")) {
      if (current) warnings.push(current);
      current = { header: line, lines: [] };
    } else if (current && /^\s+asciidoctor:/i.test(line)) {
      current.lines.push(line.trim());
    } else if (current && line.trim() && !line.startsWith(" ") && !line.startsWith("\t")) {
      warnings.push(current);
      current = null;
    }
  }

  if (current) warnings.push(current);
  return warnings;
}

// Parse the clean reporter output format:
//   <file path>
//   <test name>
//   <message>
export function parseTestFailures(output: string): TestFailure[] {
  const failures: TestFailure[] = [];

  const section = output.match(/❌ Failures:\n([\s\S]*?)(?:─{3,}|$)/);
  if (!section) return failures;

  const blocks = section[1].trim().split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      failures.push({ file: lines[0], testName: lines[1], message: lines[2] || "" });
    }
  }

  return failures;
}

export function parseJestSummary(output: string): string {
  return output
    .split("\n")
    .filter((l) => /^\s*(Test Suites|Tests|Snapshots|Time):/.test(l))
    .map((l) => l.trim())
    .join("\n");
}

export function formatComment(buildOutput: string, testOutput: string): string {
  const warnings = parseWarnings(buildOutput);
  const failures = parseTestFailures(testOutput);
  const jestSummary = parseJestSummary(testOutput);

  const hasIssues = warnings.length > 0 || failures.length > 0;
  const sections: string[] = [];

  if (!hasIssues) {
    sections.push("✅ **HTML build and tests passed.**");
  } else {
    sections.push("❌ **HTML check failed.**");
    if (failures.length) {
      const lines = failures.map((f) => `- **${f.file}** — ${f.message}`);
      sections.push(`\n**Test failures:**\n${lines.join("\n")}`);
    }
  }

  if (jestSummary) {
    sections.push(`\n**Test results:**\n\`\`\`\n${jestSummary}\n\`\`\``);
  }

  if (warnings.length > 0) {
    const warningBlocks = warnings.map((w) => {
      const detail = w.lines.join("\n");
      return `<details><summary>${w.header}</summary>\n\n\`\`\`\n${detail}\n\`\`\`\n</details>`;
    });
    sections.push(`\n⚠️ **Build warnings (${warnings.length}):**\n\n${warningBlocks.join("\n")}`);
  }

  return sections.join("\n");
}

// Run directly: ts-node src/commands/format-pr-comment.ts
// Reads build-output.txt and test-output.txt from the project root.
if (require.main === module) {
  const buildOutput = existsSync(join(root, "build-output.txt"))
    ? readFileSync(join(root, "build-output.txt"), "utf8")
    : "";
  const testOutput = existsSync(join(root, "test-output.txt"))
    ? readFileSync(join(root, "test-output.txt"), "utf8")
    : "";

  const comment = formatComment(buildOutput, testOutput);

  const outPath = join(root, "pr-comment.md");
  writeFileSync(outPath, comment);
  console.log(comment);
  console.log(`\nWritten to ${outPath}`);
}
