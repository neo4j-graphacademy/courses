import { AxiosError } from "axios";
import { SandboxError } from "./sandbox.error";

export class SandboxUnauthorizedError extends SandboxError {
    constructor(endpoint: string, error: AxiosError) {
        super('Unauthorized', endpoint, error)
    }
}
