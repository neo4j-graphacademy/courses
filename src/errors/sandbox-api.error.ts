export default class SandboxApiError extends Error {
    constructor(message: string, public user: string, public requestId: string, public response: any) {
        super(message)
    }
}