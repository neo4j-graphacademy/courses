// import { AxiosError } from "axios"

export default class SandboxError extends Error {
    endpoint: string
    error: any

    constructor(type: string, endpoint: string, error: any) {
        super(`Sandbox ${type} on ${endpoint}: ${error.message} (${JSON.stringify(error.response?.data || error.message)})`)

        this.endpoint = endpoint
        this.error = error
    }
}
