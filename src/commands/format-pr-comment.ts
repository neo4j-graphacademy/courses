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

// Extract ⚠️ warning blocks, keeping only the asciidoctor error lines (not progress/stats)
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
      // Non-indented non-empty line ends the warning block
      warnings.push(current);
      current = null;
    }
  }

  if (current) warnings.push(current);
  return warnings;
}

// Parse Jest "● ..." failure blocks into clean { file, testName, message } objects
export function parseTestFailures(output: string): TestFailure[] {
  const failures: TestFailure[] = [];
  const blocks = output.split(/\n(?=  ● )/);

  for (const block of blocks) {
    const headerMatch = block.match(/● .+? › (.+?) › (.+)/);
    if (!headerMatch) continue;

    const file = headerMatch[1].replace(/.*build\/html\//, "");
    const testName = headerMatch[2].trim();

    let message = "";
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
      if (/^at /.test(line)) break;                         // stop at stack trace
      if (/^\d+\s*[|>]/.test(line)) break;                 // stop at code snippet
      if (/^Expected substring: not "(.+)"/.test(line)) {
        message = `Contains unexpected text: "${line.match(/not "(.+)"/)![1]}"`;
        break;
      }
      if (/^Expected substring: "(.+)"/.test(line)) {
        message = `Missing expected text: "${line.match(/"(.+)"/)![1]}"`;
        break;
      }
      if (/^Error:/.test(line)) {
        message = line.replace(/^Error:\s*/, "");
        break;
      }
    }

    failures.push({ file, testName, message: message || testName });
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

export function formatComment(options: {
  buildOutcome: "success" | "failure" | "skipped";
  testOutcome: "success" | "failure" | "skipped";
  buildOutput: string;
  testOutput: string;
}): string {
  const { buildOutcome, testOutcome, buildOutput, testOutput } = options;
  const sections: string[] = [];

  if (buildOutcome === "failure") {
    sections.push("❌ **Build failed.**\n");
    const tail = buildOutput.trim().slice(-3000);
    sections.push(`\`\`\`\n${tail}\n\`\`\``);
  } else if (testOutcome === "failure") {
    sections.push("❌ **Tests failed.**\n");
    const failures = parseTestFailures(testOutput);
    if (failures.length) {
      const lines = failures.map((f) => `- **${f.file}** — ${f.message}`);
      sections.push(lines.join("\n"));
    }
  } else if (testOutcome === "skipped") {
    sections.push("❌ **Build failed** — tests were skipped.\n");
    const tail = buildOutput.trim().slice(-3000);
    sections.push(`\`\`\`\n${tail}\n\`\`\``);
  } else {
    sections.push("✅ **HTML build and tests passed.**");
  }

  const jestSummary = parseJestSummary(testOutput);
  if (jestSummary) {
    sections.push(`\n**Test results:**\n\`\`\`\n${jestSummary}\n\`\`\``);
  }

  const warnings = parseWarnings(buildOutput);
  if (warnings.length > 0) {
    const warningBlocks = warnings.map((w) => {
      const detail = w.lines.join("\n");
      return `<details><summary>${w.header}</summary>\n\n\`\`\`\n${detail}\n\`\`\`\n</details>`;
    });
    sections.push(
      `\n⚠️ **Build warnings (${warnings.length}):**\n\n${warningBlocks.join("\n")}`,
    );
  }

  return sections.join("\n");
}

type Outcome = "success" | "failure" | "skipped";

function detectOutcome(output: string, knownOutcome?: string): Outcome {
  if (knownOutcome === "failure") return "failure";
  if (knownOutcome === "success") return "success";
  if (!output.trim()) return "skipped";
  return output.includes("FAIL ") ? "failure" : "success";
}

// Run directly: ts-node src/commands/format-pr-comment.ts
// Reads build-output.txt and test-output.txt from the project root.
// Set BUILD_OUTCOME / TEST_OUTCOME env vars to override detection (used by CI).
if (require.main === module) {
  const buildOutput = existsSync(join(root, "build-output.txt"))
    ? readFileSync(join(root, "build-output.txt"), "utf8")
    : "";
  const testOutput = existsSync(join(root, "test-output.txt"))
    ? readFileSync(join(root, "test-output.txt"), "utf8")
    : "";

  const buildOutcome = detectOutcome(buildOutput, process.env.BUILD_OUTCOME);
  const testOutcome = detectOutcome(testOutput, process.env.TEST_OUTCOME);

  const comment = formatComment({ buildOutcome, testOutcome, buildOutput, testOutput });

  const outPath = join(root, "pr-comment.md");
  writeFileSync(outPath, comment);
  console.log(comment);
  console.log(`\nWritten to ${outPath}`);
}
