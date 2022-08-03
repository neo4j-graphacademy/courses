
export class ClassmarkerHeaderVerificationFailedError extends Error {
    public actual: string;
    public expected: string;

    constructor(message: string, actual: string, expected: string) {
        super(message)

        this.actual = actual
        this.expected = expected
    }
}
