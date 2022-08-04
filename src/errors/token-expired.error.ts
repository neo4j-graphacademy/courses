export class TokenExpiredError extends Error {
    status = 401

    constructor(exp: number) {
        super(`The token attached to this request expired at ${ new Date(exp * 1000).toISOString() }`)
    }
}