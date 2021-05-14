export const ATTRIBUTE_ANSWER = 'answer'

export const QUESTION_TYPE_MULTIPLE_CHOICE = 'multiple_choice'
export const QUESTION_TYPE_SELECT = 'select'
export const QUESTION_TYPE_INPUT = 'input'
export const QUESTION_TYPE_CHALLENGE = 'challenge'

export type QuestionType = typeof QUESTION_TYPE_MULTIPLE_CHOICE
    | typeof QUESTION_TYPE_INPUT
    | typeof QUESTION_TYPE_CHALLENGE

export const QUESTION_TYPES = [
    QUESTION_TYPE_MULTIPLE_CHOICE,
    QUESTION_TYPE_INPUT,
    QUESTION_TYPE_CHALLENGE,
]

export interface Option {
    value: string;
    correct: boolean;
}

export interface BaseQuestion {
    type: QuestionType;
    id: string;
    text: string;
    options?: Option[];
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: typeof QUESTION_TYPE_MULTIPLE_CHOICE;
}

export interface Challenge extends BaseQuestion {
    type: typeof QUESTION_TYPE_CHALLENGE;
    answer: string;
}

export type Question = MultipleChoiceQuestion | Challenge
