export default class SandboxApiError extends Error {
    constructor(message: string, public user: string, public request: any, public response: any) {
        super(message)
    }
}