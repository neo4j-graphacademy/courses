// import { AxiosError } from "axios";
import SandboxError from "./sandbox.error";

export default class SandboxUnknownError extends SandboxError {
    constructor(endpoint: string, error: any) {
        super('Uncategorised Error', endpoint, error)
    }
}
