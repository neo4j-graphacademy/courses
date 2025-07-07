// import { AxiosError } from "axios";
import SandboxError from "./sandbox.error";

export default class SandboxServerError extends SandboxError {
    constructor(endpoint: string, error: any) {
        super('Server Error', endpoint, error)
    }
}
