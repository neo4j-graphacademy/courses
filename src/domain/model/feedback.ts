type Reason = 'missing' | 'inaccurate' | 'other'

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
