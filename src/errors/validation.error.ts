export class ValidationError extends Error {
    public status = 400
    public errors: Record<string, any>

    constructor(message: string, errors: Record<string, any> = {}) {
        super(message)
        this.errors = errors
    }
}
