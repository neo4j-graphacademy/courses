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
        // ancestorTitles: ["html generation", "/abs/path/to/file.html"]
        const htmlPath = (test.ancestorTitles[1] || suite.testFilePath).replace(
          /.*build\/html\//,
          "",
        );
        const message = this._cleanMessage(test.failureMessages);
        failures.push({ filePath: htmlPath, testName: test.title, message });
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

    // Thrown Error (e.g. from our custom checks): use the message text directly
    const errorMatch = stripped.match(
      /Error:\s*(.+?)(\n\s*at |\n\s*\d+\s*[|>]|$)/s,
    );
    if (errorMatch) {
      return errorMatch[1].split("\n")[0].trim();
    }

    // expect().not.toContain() failure: extract what string was unexpectedly found
    const containMatch = stripped.match(/Expected substring: not "([^"]+)"/);
    if (containMatch) {
      return `Unexpected content found: "${containMatch[1]}"`;
    }

    // expect().toContain() failure
    const missingMatch = stripped.match(/Expected substring: "([^"]+)"/);
    if (missingMatch) {
      return `Expected content not found: "${missingMatch[1]}"`;
    }

    return (
      stripped
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)[0] || ""
    );
  }
}

module.exports = CleanReporter;
