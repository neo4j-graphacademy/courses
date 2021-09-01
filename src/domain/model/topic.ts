export interface Topic {
    id: number;
    title: string;
    posts_count: string;
    reply_count: string;
    pinned: boolean;
    closed: boolean;
    has_accepted_answer: boolean;
    [key: string]: any;
}