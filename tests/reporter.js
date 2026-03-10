"use strict";

// Custom Jest reporter: shows only failures (no stack traces) and the summary.
class CleanReporter {
  constructor(_globalConfig, _options) {}

  onRunComplete(_contexts, results) {
    const failures = [];

    for (const suite of results.testResults) {
      const failed = suite.testResults.filter((t) => t.status === "failed");
      if (!failed.length) continue;

      // Derive a short path relative to the build/html directory
      for (const test of failed) {
        // ancestorTitles: ["QA Tests", courseSlug, moduleSlug, lessonSlug, ...]
        // or for HTML tests: ["html generation", "/abs/path/to/file.html"]
        const rawPath = (test.ancestorTitles[1] || suite.testFilePath).replace(
          /.*build\/html\//,
          "",
        );
        const extraCrumbs = test.ancestorTitles.slice(2).join(" > ");
        const filePath = extraCrumbs ? `${rawPath} > ${extraCrumbs}` : rawPath;
        const message = this._cleanMessage(test.failureMessages);
        failures.push({ filePath, testName: test.title, message });
      }
    }

    if (failures.length) {
      console.log("\n❌ Failures:\n");
      for (const { filePath, testName, message } of failures) {
        console.log(`  ${filePath}`);
        console.log(`  ${testName}`);
        console.log(`  ${message}\n`);
      }
    }

    const { numFailedTests, numPassedTests, numTotalTests, startTime } =
      results;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(3);
    const suiteFailed = results.numFailedTestSuites;
    const suiteTotal = results.numTotalTestSuites;

    console.log("─".repeat(50));
    console.log(
      `Test Suites: ${suiteFailed ? `${suiteFailed} failed, ` : ""}${suiteTotal} total`,
    );
    console.log(
      `Tests:       ${numFailedTests ? `${numFailedTests} failed, ` : ""}${numPassedTests} passed, ${numTotalTests} total`,
    );
    console.log(`Time:        ${elapsed} s`);

    if (!numFailedTests) {
      console.log("\n✅ All tests passed.");
    }
  }

  _cleanMessage(failureMessages) {
    if (!failureMessages?.length) return "";

    const stripped = failureMessages[0].replace(/\x1B\[[0-9;]*m/g, "");

    // Check expect() matcher patterns first — the Received string may contain
    // arbitrary HTML including words like "Error:", so check these before errorMatch
    const notContainMatch = stripped.match(/Expected substring: not "([^"]+)"/);
    if (notContainMatch) return `Unexpected content found: "${notContainMatch[1]}"`;

    const containMatch = stripped.match(/Expected substring: "([^"]+)"/);
    if (containMatch) return `Missing expected text: "${containMatch[1]}"`;

    // Thrown Error (e.g. from our custom throw new Error(...) checks)
    // Collect all lines between "Error:" and the first stack trace line
    const lines = stripped.split("\n");
    const errorIdx = lines.findIndex((l) => /^Error:/.test(l));
    if (errorIdx !== -1) {
      const messageLines = [];
      for (let i = errorIdx; i < lines.length; i++) {
        if (/^\s+at /.test(lines[i])) break;
        messageLines.push(lines[i]);
      }
      return messageLines.join("\n").replace(/^Error:\s*/, "").trim();
    }

    return stripped.split("\n").map((l) => l.trim()).filter(Boolean)[0] || "";
  }
}

module.exports = CleanReporter;
