import { AxiosError } from "axios";
import { SandboxError } from "./sandbox.error";

export class SandboxBadRequestError extends SandboxError {
    constructor(endpoint: string, error: AxiosError) {
        super('Bad Request', endpoint, error)
    }
}
