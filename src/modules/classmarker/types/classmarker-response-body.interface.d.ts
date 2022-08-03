export interface ClassmarkerResponseBody {
    test: {
        // :Course.classmarkerReference
        test_id: number;
        test_name: string;
    };
    group: {
        group_id: number;
        group_name: string;
    };
    result: {
        user_id: string;
        // :User.sub
        cm_user_id: string;
        first: string; // "Mary",
        last: string; // "Williams",
        email: string; // "mary@example.com",
        percentage: number; // 75,
        points_scored: number; // 9,
        points_available: number; // 12,
        requires_grading: string; // "Yes",
        time_started: number; // 1436263102,
        time_finished: number; // 1436263702,
        duration: string; // "00:0540",
        percentage_passmark: number; // 50,
        passed: boolean; // true,
        feedback: string; // "Thanks for completing our Exam!",
        give_certificate_only_when_passed: boolean; // false,
        certificate_url: string; // "https://www.classmarker.com/pdf/certificate/SampleCertificate.pdf",
        certificate_serial: string; // "CLPPYQSBSY-ZZVKJGQH-XHWMMRCHYT",
        view_results_url: string; // "https://www.classmarker.com/view/results/?required_parameters_here"
    };
}
