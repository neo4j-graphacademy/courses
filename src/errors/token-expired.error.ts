export class TokenExpiredError extends Error {
    code: number = 401

    constructor(exp: number) {
        super(`This token expired at ${ new Date(exp * 1000).toISOString() }`)
    }
}