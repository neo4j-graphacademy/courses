import { Course } from "./course";

export const ATTRIBUTE_PARENT = 'parent'

export interface Category {
    id: string;
    slug: string;
    title: string;
    description: string;
    children?: Category[];
    courses?: Course[];
}
