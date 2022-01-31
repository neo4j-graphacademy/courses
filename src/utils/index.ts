import path from 'path'
import fs from 'fs'
import { ASCIIDOC_DIRECTORY, BASE_URL, PUBLIC_DIRECTORY } from '../constants';
import { Course, CourseWithProgress, STATUS_PRIORITIES } from "../domain/model/course";
import { User } from '../domain/model/user';
import { Lesson, LessonWithProgress } from '../domain/model/lesson';
import { Module, ModuleWithProgress } from '../domain/model/module';
import { Category } from '../domain/model/category';
import { courseSummaryExists } from '../modules/asciidoc';

export async function getBadge(course: Course | CourseWithProgress): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        const badgePath = path.join(ASCIIDOC_DIRECTORY, 'courses', course.slug, 'badge.svg')

        if (!fs.existsSync(badgePath)) {
            return resolve(undefined)
        }

        fs.readFile(badgePath, (err, data) => {
            if (err) reject(err)
            else resolve(data.toString())
        })
    })
}


type CypherFile = 'verify' | 'reset' | 'sandbox'

export function getLessonCypherFile(course: string, module: string, lesson: string, file: CypherFile): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        const filePath = path.join(ASCIIDOC_DIRECTORY, 'courses', course, 'modules', module, 'lessons', lesson, `${file}.cypher`)

        if (!fs.existsSync(filePath)) {
            return resolve(undefined)
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(err)
            }

            resolve(data.toString())
        })
    })
}


export async function formatLesson(course: string, module: string, lesson: Lesson | LessonWithProgress): Promise<Lesson | LessonWithProgress> {
    const cypher = await getLessonCypherFile(course, module, lesson.slug, 'sandbox')

    return {
        ...lesson,
        cypher,
    }
}


export async function formatModule(course: string, module: Module | ModuleWithProgress): Promise<Module | ModuleWithProgress> {
    const lessons = await Promise.all((module.lessons || []).map((lesson: Lesson | LessonWithProgress) => formatLesson(course, module.slug, lesson)))

    lessons.sort((a, b) => a.order < b.order ? -1 : 1)

    return {
        ...module,
        lessons,
    }
}

export async function formatCourse<T extends Course>(course: T): Promise<T> {
    const modules = await Promise.all(course.modules.map((module: Module | ModuleWithProgress) => formatModule(course.slug, module)))
    const badge = await getBadge(course)

    modules.sort((a, b) => a.order < b.order ? -1 : 1)

    return {
        ...course,
        summary: courseSummaryExists(course.slug),
        modules,
        badge,
    }
}

export function getUserName(user: User): string {
    return user.givenName || user.nickname || user.name || 'User'
}

export function formatUser(user: User): User {
    const publicProfile = `${BASE_URL}/u/${user.id}/`

    return {
        ...user,
        publicProfile,
    }
}

interface SandboxConfig {
    showSandbox: boolean;
    sandboxVisible: boolean;
    sandboxUrl: string | undefined;
}

export function getSandboxConfig(course: Course, lesson?: Lesson): Promise<SandboxConfig> {
    const showSandbox = (course.usecase !== undefined && course.usecase !== null) || (typeof lesson?.sandbox === 'string' && lesson?.sandbox !== 'false')
    const sandboxVisible = typeof lesson?.sandbox === 'string'

    let sandboxUrl = `${course.link}browser/`

    // Show sandbox?
    if (showSandbox === true && lesson?.cypher) {
        sandboxUrl += `?cmd=edit&arg=${encodeURIComponent(lesson?.cypher)}`
    }

    // Overwrite
    if (typeof lesson?.sandbox === 'string' && lesson?.sandbox !== 'true') {
        sandboxUrl = lesson!.sandbox
    }

    return Promise.resolve({
        showSandbox,
        sandboxVisible,
        sandboxUrl,
    } as SandboxConfig)
}

export function getSvgs(): Record<string, string> {
    const svgFolder = path.join(__dirname, '..', '..', 'resources', 'svg')
    const svg = Object.fromEntries(fs.readdirSync(svgFolder)
        .filter(file => file.endsWith('.svg'))
        .map(file => [file.replace('.svg', ''), fs.readFileSync(path.join(svgFolder, file)).toString()])
    )

    return svg
}

export function flattenAttributes(elements: Record<string, Record<string, any>>): Record<string, any> {
    const output = {}

    for (const key in elements) {
        if (elements.hasOwnProperty(key)) {
            for (const inner in elements[key]) {
                if (elements[key].hasOwnProperty(inner)) {
                    // @ts-ignore
                    output[`${key}_${inner}`] = elements[key][inner]?.toString()
                }
            }
        }
    }

    return output
}

export function flattenCategories(categories: Category[]): Category[] {
    return categories.reduce((acc: Category[], item: Category): Category[] => {
        const output: Category[] = [item].concat(...flattenCategories(item.children || []) || [])

        return acc.concat(...output)
    }, [])
}

export function dd(el: any): void {
    // tslint:disable-next-line
    console.log(JSON.stringify(el, null, 2));
}

export const courseBannerPath = (course: Course) => path.join(ASCIIDOC_DIRECTORY, 'courses', course.slug, 'banner.png')
export const categoryBannerPath = (category: Category) => path.join(PUBLIC_DIRECTORY, 'img', 'og', `_${category.slug}.png`)

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 *
 * @param target
 * @param ...sources
 */
export function mergeDeep(target: Record<string, any> = {}, ...sources: Record<string, any>[]): Record<string, any> {
    const output = Object.assign({}, target)

    while (sources.length) {
        const source = sources.shift();

        for ( const key in source ) {
            if ( !output.hasOwnProperty(key) ) {
                Object.assign(output, { [key]: source[key] });
            }
            else {
                Object.assign(output[key], source[ key ])
            }
        }
    }

    return output;
}

export function toCamelCase(input: string): string {
    const parts = input.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || []

    return parts
            .map(x => x.toLowerCase())
            .map((x, index) => index === 0 ? x.toLowerCase() : x.substring(0, 1).toUpperCase() + x.substring(1))
            .join('')
}


export function sortCourses(courses: Course[]) {
    courses.sort((a: Course, b: Course) => {
        if ( a.status !== b.status ) {
            const aPriority = STATUS_PRIORITIES.indexOf(a.status)
            const bPriority = STATUS_PRIORITIES.indexOf(b.status)

            return aPriority - bPriority
        }

        return parseInt(a.order) < parseInt(b.order) ? -1 : 1
    })
}
