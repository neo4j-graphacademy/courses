export default class UnauthorizedError extends Error {
    public status: number = 401;

    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
    }
} 
