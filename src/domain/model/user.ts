export interface User {
    id: string;
    user_id: string;
    givenName: string;
    email: string;
    name: string;
    given_name?: string;
    [key: string]: any;
}