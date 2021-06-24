export interface User {
    id: string;
    sub: string;
    name: string;
    given_name?: string;
    email: string;
    // givenName: string;
    // [key: string]: any;
}