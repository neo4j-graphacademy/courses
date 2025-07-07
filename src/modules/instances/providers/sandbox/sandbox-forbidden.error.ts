// import { AxiosError } from "axios";
import SandboxError from "./sandbox.error";

export default class SandboxForbiddenError extends SandboxError {
    constructor(endpoint: string, error: any) {
        super('Forbidden', endpoint, error)
    }
}
