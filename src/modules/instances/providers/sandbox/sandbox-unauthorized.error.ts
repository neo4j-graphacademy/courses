// import { AxiosError } from "axios";
import SandboxError from "./sandbox.error";

export default class SandboxUnauthorizedError extends SandboxError {
    constructor(endpoint: string, error: any) {
        super('Unauthorized', endpoint, error)
    }
}
