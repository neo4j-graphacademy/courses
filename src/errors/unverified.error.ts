export default class UnverifiedError extends Error {
    code: number = 401;

    constructor() {
        super('This user is unverified and cannot perform this action')
    }
}