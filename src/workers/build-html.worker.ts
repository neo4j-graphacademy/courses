import { parentPort, workerData } from "worker_threads";
import { loadFile, convert } from "../modules/asciidoc";
import { existsSync } from "fs";

export interface BuildWorkerTask {
  type: "course" | "module" | "lesson";
  filepath: string;
  attributes: Record<string, any>;
}

export interface BuildWorkerResult {
  success: boolean;
  html?: string;
  error?: string;
  filepath: string;
  logs?: string[];
  warnings?: string[];
}

// Listen for messages from the main thread
if (parentPort) {
  parentPort.on("message", (task: BuildWorkerTask) => {
    // Capture console output and stream writes
    const logs: string[] = [];
    const warnings: string[] = [];

    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalStderrWrite = process.stderr.write.bind(process.stderr);

    console.log = (...args: any[]) => {
      const message = args.map((arg) => String(arg)).join(" ");
      logs.push(message);
      // Don't log in worker - let main thread handle it with context
    };

    console.warn = (...args: any[]) => {
      const message = args.map((arg) => String(arg)).join(" ");
      warnings.push(message);
      // Don't log in worker - let main thread handle it with context
    };

    console.error = (...args: any[]) => {
      const message = args.map((arg) => String(arg)).join(" ");
      warnings.push(message);
      // Don't log in worker - let main thread handle it with context
    };

    // Intercept stdout/stderr writes (for asciidoctor direct writes)
    process.stdout.write = ((
      chunk: any,
      encoding?: any,
      callback?: any
    ): boolean => {
      const message = chunk.toString().trim();
      if (message) {
        logs.push(message);
      }
      return true;
    }) as any;

    process.stderr.write = ((
      chunk: any,
      encoding?: any,
      callback?: any
    ): boolean => {
      const message = chunk.toString().trim();
      if (message) {
        warnings.push(message);
      }
      return true;
    }) as any;

    try {
      // Check if file exists
      if (!existsSync(task.filepath)) {
        // Restore all intercepted methods
        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
        process.stdout.write = originalStdoutWrite;
        process.stderr.write = originalStderrWrite;

        parentPort!.postMessage({
          success: true,
          html: undefined,
          filepath: task.filepath,
        } as BuildWorkerResult);
        return;
      }

      // Load and convert the AsciiDoc file
      const file = loadFile(task.filepath, {
        attributes: task.attributes,
      });

      let html: string;

      if (task.type === "lesson") {
        // For lessons, we need to merge attributes from the file
        const buildAttributes = {
          ...task.attributes,
          ...file.getAttributes(),
        };
        html = file.convert({ attributes: buildAttributes }) as string;
      } else {
        html = convert(file) as string;
      }

      // Restore all intercepted methods
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;

      // Send result back to main thread
      parentPort!.postMessage({
        success: true,
        html,
        filepath: task.filepath,
        logs: logs.length > 0 ? logs : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      } as BuildWorkerResult);
    } catch (error) {
      // Restore all intercepted methods
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;

      // Send error back to main thread
      parentPort!.postMessage({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        filepath: task.filepath,
        logs: logs.length > 0 ? logs : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      } as BuildWorkerResult);
    }
  });
}
