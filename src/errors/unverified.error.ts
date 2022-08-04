export default class UnverifiedError extends Error {
    status = 401

    constructor() {
        super('This user is unverified and cannot perform this action')
    }
}