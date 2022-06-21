export interface Topic {
    title: string;
    link: string;
    description: string;
    publishedAt: Date;
    author: string;
    [key: string]: any;
}