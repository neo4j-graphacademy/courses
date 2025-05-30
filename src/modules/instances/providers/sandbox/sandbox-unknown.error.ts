import { AxiosError } from "axios";
import { SandboxError } from "./sandbox.error";

export class SandboxUnknownError extends SandboxError {
    constructor(endpoint: string, error: AxiosError) {
        super('Uncategorised Error', endpoint, error)
    }
}
