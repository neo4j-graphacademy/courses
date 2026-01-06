import { Worker } from "worker_threads";
import { cpus } from "os";
import { join } from "path";
import { BuildWorkerTask, BuildWorkerResult } from "./build-html.worker";

// Register ts-node for worker threads to support TypeScript
const TS_NODE_OPTIONS = {
  execArgv: ['--require', 'ts-node/register']
};

interface QueuedTask {
  task: BuildWorkerTask;
  resolve: (result: BuildWorkerResult) => void;
  reject: (error: Error) => void;
}

export class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: QueuedTask[] = [];
  private workerPath: string;
  private poolSize: number;

  constructor(workerPath: string, poolSize?: number) {
    this.workerPath = workerPath;
    // Default to number of CPU cores, but leave one core free for the main thread
    this.poolSize = poolSize || Math.max(1, cpus().length - 1);
    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.poolSize; i++) {
      // Pass ts-node options if the worker file is TypeScript
      const options = this.workerPath.endsWith('.ts') ? TS_NODE_OPTIONS : {};
      const worker = new Worker(this.workerPath, options);
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  public async exec(task: BuildWorkerTask): Promise<BuildWorkerResult> {
    return new Promise((resolve, reject) => {
      const queuedTask: QueuedTask = { task, resolve, reject };

      if (this.availableWorkers.length > 0) {
        this.runTask(queuedTask);
      } else {
        this.taskQueue.push(queuedTask);
      }
    });
  }

  private runTask(queuedTask: QueuedTask): void {
    const worker = this.availableWorkers.pop()!;

    const messageHandler = (result: BuildWorkerResult) => {
      worker.removeListener("message", messageHandler);
      worker.removeListener("error", errorHandler);

      this.availableWorkers.push(worker);
      queuedTask.resolve(result);

      // Process next task in queue if any
      if (this.taskQueue.length > 0) {
        const nextTask = this.taskQueue.shift()!;
        this.runTask(nextTask);
      }
    };

    const errorHandler = (error: Error) => {
      worker.removeListener("message", messageHandler);
      worker.removeListener("error", errorHandler);

      this.availableWorkers.push(worker);
      queuedTask.reject(error);

      // Process next task in queue if any
      if (this.taskQueue.length > 0) {
        const nextTask = this.taskQueue.shift()!;
        this.runTask(nextTask);
      }
    };

    worker.once("message", messageHandler);
    worker.once("error", errorHandler);
    worker.postMessage(queuedTask.task);
  }

  public async terminate(): Promise<void> {
    await Promise.all(this.workers.map((worker) => worker.terminate()));
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
  }

  public getPoolSize(): number {
    return this.poolSize;
  }

  public getQueueLength(): number {
    return this.taskQueue.length;
  }

  public getAvailableWorkers(): number {
    return this.availableWorkers.length;
  }
}
