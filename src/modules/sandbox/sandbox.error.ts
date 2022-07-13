import { AxiosError } from "axios"

export class SandboxError extends Error {
    public isSandboxError: boolean;

    constructor(type: string, endpoint: string, error: AxiosError) {
        const status = error.response?.status || 500
        const body = error.response?.data ? JSON.stringify(error.response?.data) : '[NO DATA]'

        super(`Sandbox ${type} (${status}) on ${endpoint}: ${error.message} (${body})`)

        this.isSandboxError = true
    }
}
