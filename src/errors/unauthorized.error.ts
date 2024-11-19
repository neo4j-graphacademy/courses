export default class UnauthorizedError extends Error {
    public status = 401;

    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
    }
}
