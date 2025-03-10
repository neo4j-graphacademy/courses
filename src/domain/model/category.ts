import { Course, Language } from "./course";

export const ATTRIBUTE_PARENT = 'parent'
export const ATTRIBUTE_SHORTNAME = 'shortname'
export const ATTRIBUTE_LINK = 'link'

export interface Category<T extends Course> {
    id: string;
    language: Language;
    link: string;
    slug: string;
    title: string;
    description: string;
    courseCount: number;
    shortName?: string;
    caption?: string;
    children?: Category<T>[];
    courses?: T[];
}
