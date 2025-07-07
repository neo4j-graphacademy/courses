// import { AxiosError } from "axios";
import SandboxError from "./sandbox.error";

export default class SandboxBadRequestError extends SandboxError {
    constructor(endpoint: string, error: any) {
        super('Bad Request', endpoint, error)
    }
}
