declare global {
    interface Window {
        env: 'dev' | undefined;
        user?: { sub: string, id: string };
        analytics: {
            course: Record<string, any>;
            module: Record<string, any>;
            lesson: Record<string, any>;
            user: Record<string, any>;
        };

        i18n: {
            feedbackFollowup: string;
            feedbackThankyou: string;
            missing: string;
            hardToFollow: string;
            inaccurate: string;
            other: string;
            moreInformation: string;
            feedbackSubmit: string;
            feedbackSkip: string;
            advanceTo: string;
            [key: string]: any;
        }

        YT: any
    }
}