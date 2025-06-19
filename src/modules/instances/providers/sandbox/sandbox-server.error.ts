import { AxiosError } from "axios";
import { SandboxError } from "./sandbox.error";

export class SandboxServerError extends SandboxError {
    constructor(endpoint: string, error: AxiosError) {
        super('Server Request', endpoint, error)
    }
}
