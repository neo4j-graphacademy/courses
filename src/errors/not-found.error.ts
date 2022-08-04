export default class NotFoundError extends Error {
    status = 404

    constructor(message?: string) {
        super(message)
    }
}