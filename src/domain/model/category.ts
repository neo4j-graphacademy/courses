import { Course } from "./course";

export const ATTRIBUTE_PARENT = 'parent'
export const ATTRIBUTE_SHORTNAME = 'shortname'

export interface Category<T extends Course> {
    id: string;
    slug: string;
    title: string;
    description: string;
    shortName?: string;
    caption?: string;
    children?: Category<T>[];
    courses?: T[];
}
