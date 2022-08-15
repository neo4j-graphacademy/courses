export type Language = 'en' | 'jp' | 'cn'

export interface CategoryWithOrder {
    category: string;
    order: number;
}

export interface CourseToImport {
    slug: string;
    language: Language;
    title: string;
    link: string;
    video?: string;
    repository?: string;
    duration?: string;
    redirect?: string;
    thumbnail: string;
    caption: string;
    status: 'completed' | 'active' | 'draft' | 'test' | 'disabled';
    interested?: string[];
    isInterested?: boolean;
    usecase: string | undefined;
    modules: ModuleToImport[];
    categories: CategoryWithOrder[];
    badge?: string;
    verify: string | undefined;
    cypher: string | undefined;
    summary: boolean;
    passed: boolean;
    failed: boolean;
    certification: boolean;
    classmarkerId?: string;
    classmarkerReference?: string;
    certificateNumber: string;
    translations: string[];
    // Additional attributes extracted from Asciidoc
    [key: string]: any;
    attributes: Record<string, any>;
    prerequisiteSlugs: string[];
    progressToSlugs: string[];
    translationSlugs: string[];
}

export interface ModuleToImport {
    path: string;
    slug: string;
    title: string;
    order: string;
    lessons: LessonToImport[];
    link?: string;
    progressPercentage?: number;
}

export type LessonType = 'video' | 'lesson' | 'text' | 'quiz' | 'activity' | 'challenge'

export interface LessonToImport {
    path: string;
    slug: string;
    title: string;
    type: LessonType;
    updatedAt?: Date | undefined;
    order: string;
    duration: number;
    sandbox: boolean | string;
    // cypher: string | undefined;
    // verify: string | undefined;
    optional: boolean;
    disableCache: boolean;
    questions: QuestionToImport[];
}


export interface QuestionToImport {
    id: string;
    text: string;
}
