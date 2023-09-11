type Reason = 'missing' | 'inaccurate' | 'hard-to-follow' | 'other'

export interface FeedbackPayload {
    helpful: boolean;
    reason?: Reason | null;
    additional?: string | null;
}

export interface FeedbackResponse {
    status: 'ok' | 'error';
    message?: string;
    id?: string;
}
