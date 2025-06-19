import { AxiosError } from "axios";
import { SandboxError } from "./sandbox.error";

export class SandboxForbiddenError extends SandboxError {
    constructor(endpoint: string, error: AxiosError) {
        super('Forbidden', endpoint, error)
    }
}
