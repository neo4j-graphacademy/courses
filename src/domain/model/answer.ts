export interface Answer {
    id: string;
    correct: boolean;
    answers: string[] | null;
    reason?: string | string[];
}
