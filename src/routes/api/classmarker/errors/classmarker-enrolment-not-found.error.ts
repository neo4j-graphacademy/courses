
export class ClassmarkerEnrolmentNotFoundError extends Error {
    public params: Record<string, any>
    
    constructor(message: string, params: Record<string, any>) {
        super(message)
        this.params = params
    }
}
