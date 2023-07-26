import path, { basename } from 'path'
import fs from 'fs'
import { Request } from 'express'
import { ASCIIDOC_DIRECTORY, BASE_URL, CDN_URL, COURSE_QUIZ_AVAILABLE_AFTER, GRAPHQL_TOOLBOX_URL, PUBLIC_DIRECTORY } from '../constants'
import {
    Course,
    CoursesByStatus,
    CourseStatusInformationWithCourses,
    CourseWithProgress,
    STATUS_COMPLETED,
    STATUS_PRIORITIES,
} from '../domain/model/course'
import { User } from '../domain/model/user'
import { Lesson, LessonWithProgress } from '../domain/model/lesson'
import { Module, ModuleWithProgress } from '../domain/model/module'
import { Category } from '../domain/model/category'
import { courseSummaryExists, getStatusDetails } from '../modules/asciidoc'
import { getToken, getUser } from '../middleware/auth.middleware'
import { getSandboxForUseCase } from '../modules/sandbox'
import { isInt } from 'neo4j-driver'
import { courseOgBadgeImage } from '../routes/route.utils'
import { IntermediateEnrolment } from '../domain/services/enrolments/get-enrolment'
import { Pagination } from '../domain/model/pagination'

export async function getBadge<T extends Course>(course: T): Promise<string | undefined> {
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

export async function getIllustration<T extends Course>(course: T): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        const badgePath = path.join(ASCIIDOC_DIRECTORY, 'courses', course.slug, 'illustration.svg')

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

export function getLessonCypherFile(
    course: string,
    module: string,
    lesson: string,
    file: CypherFile
): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        const filePath = path.join(
            ASCIIDOC_DIRECTORY,
            'courses',
            course,
            'modules',
            module,
            'lessons',
            lesson,
            `${file}.cypher`
        )

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

export async function formatLesson(
    course: string,
    module: string,
    lesson: Lesson | LessonWithProgress
): Promise<Lesson | LessonWithProgress> {
    const cypher = await getLessonCypherFile(course, module, lesson.slug, 'sandbox')

    return {
        ...lesson,
        cypher,
    }
}

export async function formatModule(
    course: string,
    module: Module | ModuleWithProgress
): Promise<Module | ModuleWithProgress> {
    const lessons = await Promise.all(
        (module.lessons || []).map((lesson: Lesson | LessonWithProgress) => formatLesson(course, module.slug, lesson))
    )

    return {
        ...module,
        lessons,
    }
}

function getNextLesson(course: Course, completedModules: string[], completedLessons: string[]): Pagination | undefined {
    for (const m of course.modules) {
        if (!completedModules.includes(m.slug)) {
            return {
                title: m.title,
                link: m.link,
            }
        }

        for (const l of m.lessons) {
            if (!completedLessons.includes(l.link)) {
                return {
                    title: l.title,
                    link: l.link,
                }
            }
        }
    }
}

export async function mergeCourseAndEnrolment(course: Course, enrolment: IntermediateEnrolment): Promise<CourseWithProgress> {
    const mandatoryLessons = course.modules.reduce((acc, module) => {
        const mandatory = module.lessons.filter(lesson => !lesson.optional).length

        return acc + mandatory
    }, 0)

    const completedCount = enrolment.completedLessons.length
    const completedPercentage = enrolment.percentage || enrolment.completedPercentage || Math.round(completedCount / mandatoryLessons * 100)

    const output: CourseWithProgress = {
        ...await formatCourse(course),
        enrolled: true,
        enrolmentId: enrolment.id,
        enrolledAt: enrolment.createdAt,
        ref: enrolment.ref,
        completed: enrolment.completed,
        completedAt: enrolment.completedAt,
        failed: enrolment.failed,
        failedAt: enrolment.failedAt,
        availableAfter: enrolment.failedAt ? new Date(enrolment.failedAt?.getTime() + + 60 * 60 * 24 * 1000) : undefined,
        lastSeenAt: enrolment.lastSeenAt,
        completedCount,
        completedPercentage,
        certificateUrl: enrolment.certificateUrl,

        modules: course.modules.map(module => ({
            ...module,
            completed: enrolment.completedModules.includes(module.link),
            lessons: module.lessons.map(lesson => ({
                ...lesson,
                completed: enrolment.completedLessons.includes(lesson.link),
            }))
        })),
        next: getNextLesson(course, enrolment.completedModules, enrolment.completedLessons),
    }

    return formatCourse(output)
}

export async function formatCourse<T extends Course>(course: T): Promise<T> {
    const modules = await Promise.all(
        course.modules.map((module: Module | ModuleWithProgress) => formatModule(course.slug, module))
    )
    const badge = await getBadge(course)
    const illustration = await getIllustration(course)

    const createdAt = course.createdAt ? new Date((course.createdAt as string).toString()) : undefined
    const completedAt = course.completedAt ? new Date((course.completedAt as string).toString()) : undefined
    const lastSeenAt = course.lastSeenAt ? new Date((course.lastSeenAt as string).toString()) : undefined
    const certificateNumber = isInt(course.certificateNumber)
        ? course.certificateNumber.toNumber()
        : course.certificateNumber

    const emailDirectory = `${ASCIIDOC_DIRECTORY}/courses/${course.slug}/emails`
    const emails = fs.existsSync(emailDirectory) ? fs.readdirSync(`${ASCIIDOC_DIRECTORY}/courses/${course.slug}/emails`).map(file => basename(file, '.adoc')) : []

    // If less than 7 days old, they are not allowed to take the quick quiz
    const enrolledAt = course.enrolledAt ? new Date((course.enrolledAt as string).toString()) : undefined
    const quizAvailable = enrolledAt ? Date.now() - (enrolledAt).getTime() > (1000 * 60 * 60 * 24 * COURSE_QUIZ_AVAILABLE_AFTER) : false
    const availableAfter = course.availableAfter ? new Date(course.availableAfter) : undefined

    return {
        ...course,
        summary: await courseSummaryExists(course.slug),
        modules,
        badge,
        illustration,
        badgeUrl: courseOgBadgeImage(course.slug),
        emails,
        createdAt,
        enrolledAt,
        availableAfter,
        quizAvailable,
        completedAt,
        lastSeenAt,
        certificateNumber,
    }
}

export function getUserName(user: User): string {
    return user.givenName || user.nickname || user.name || 'User'
}

export function formatUser(user: User): User {
    const publicProfile = `${BASE_URL}/u/${user.id}/`

    let completedAt: string | Date | undefined = user.profileCompletedAt

    if (completedAt && typeof completedAt !== 'string') {
        completedAt = (completedAt as any).toString()
    }

    return {
        ...user,
        profileCompletedAt: completedAt ? new Date(completedAt) : undefined,
        publicProfile,
    }
}

interface SandboxConfig {
    showSandbox: boolean
    sandboxVisible: boolean
    sandboxUrl: string | undefined
}

export function getSandboxConfig(
    course: Course | CourseWithProgress,
    lesson?: Lesson | LessonWithProgress
): Promise<SandboxConfig> {
    let showSandbox = false
    let sandboxVisible = typeof lesson?.sandbox === 'string'

    // If usecase is set and it is not null, show sandbox
    if (course.usecase !== undefined && course.usecase !== null) {
        showSandbox = true
    }
    // If :sandbox: is set to 'true' in lesson.adoc (eg. set and not false)
    else if (typeof lesson?.sandbox === 'string' && lesson?.sandbox !== 'false') {
        showSandbox = true
    }

    let sandboxUrl = `./browser/`

    // Does the sandbox URL need a Cypher query appended to it?
    if (showSandbox === true && lesson?.cypher) {
        sandboxUrl += `?cmd=edit&arg=${encodeURIComponent(lesson?.cypher)}`
    }

    // Overwrite Sandbox URL if set in :sandbox: page attribute
    if (typeof lesson?.sandbox === 'string' && lesson?.sandbox !== 'true') {
        sandboxUrl = lesson.sandbox
    }

    // If course has already been completed, hide the sandbox completely
    if ((course as CourseWithProgress)?.completed === true) {
        showSandbox = false
        sandboxVisible = false
    }

    // Lab?  Currently doesn't work due to frame-ancestors from gitpod.io, have to add a link to ./lab in text instead
    // if (course.sandbox && course.repository && typeof lesson?.lab === 'string') {
    //     showSandbox = true
    //     sandboxVisible = true
    //     sandboxUrl = './lab'
    // }

    return Promise.resolve({
        showSandbox,
        sandboxVisible,
        sandboxUrl,
    } as SandboxConfig)
}

export function getSvgs(): Record<string, string> {
    const svgFolder = path.join(__dirname, '..', '..', 'resources', 'svg')
    const svg = Object.fromEntries(
        fs
            .readdirSync(svgFolder)
            .filter((file) => file.endsWith('.svg'))
            .map((file) => [file.replace('.svg', ''), fs.readFileSync(path.join(svgFolder, file)).toString()])
    )

    return svg
}

export function flattenAttributes(elements: Record<string, any>, rootKey?: string): Record<string, any> {
    let output: Record<string, any> = {}

    for (const key in elements) {

        const outputKey = rootKey ? `${rootKey}_${key}` : key

        if (typeof elements[key] === 'object') {
            output = Object.assign({}, output, flattenAttributes(elements[key] as Record<string, any>, outputKey))
        } else {
            output[outputKey] = elements[key]?.toString()
        }
    }

    return output
}

export function flattenCategories<T extends Course>(categories: Category<T>[]): Category<T>[] {
    return categories.reduce((acc: Category<T>[], item: Category<T>): Category<T>[] => {
        const output: Category<T>[] = [item].concat(...(flattenCategories(item.children || []) || []))

        return acc.concat(...output)
    }, [])
}

export function groupCoursesByStatus(courses: CourseWithProgress[]): CoursesByStatus {
    const statuses: CourseStatusInformationWithCourses[] = courses.reduce(
        (acc: CourseStatusInformationWithCourses[], current: CourseWithProgress) => {
            const statusSlug = current.completed ? STATUS_COMPLETED : current.status

            // Find current item in array
            const index = acc.findIndex((item) => item.slug === statusSlug)

            // Either extract or create a new one
            const existing: CourseStatusInformationWithCourses =
                index > -1 ? acc.splice(index, 1)[0] : { ...getStatusDetails(statusSlug), courses: [] }

            // Add the course
            existing.courses.push(current)

            // Append to array
            return acc.concat(existing)
        },
        [] as CourseStatusInformationWithCourses[]
    )

    // Sort by order
    statuses.sort((a, b) => a.order - b.order)

    // Return as { [key: CourseStatus] : value }
    const output: CoursesByStatus = Object.fromEntries(
        statuses.map(status => [status.slug, status])
    ) as CoursesByStatus

    return output
}

export function dd(el: any): void {
    console.log(JSON.stringify(el, null, 2))
}

export const courseBannerPath = (course: Course) => path.join(ASCIIDOC_DIRECTORY, 'courses', course.slug, 'banner.png')
export const categoryBannerPath = (category: Category<any>) =>
    path.join(PUBLIC_DIRECTORY, 'img', 'og', `_${category.slug}.png`)

/**
 * Simple object check.
 *
 * @param item
 * @returns {boolean}
 */
export function isObject(item: any): boolean {
    return item !== undefined && typeof item === 'object' && !Array.isArray(item)
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
        const source = sources.shift()

        for (const key in source) {
            if (!output.hasOwnProperty(key)) {
                Object.assign(output, { [key]: source[key] })
            } else {
                Object.assign(output[key], source[key])
            }
        }
    }

    return output
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
        if (a.status !== b.status) {
            const aPriority = STATUS_PRIORITIES.indexOf(a.status)
            const bPriority = STATUS_PRIORITIES.indexOf(b.status)

            return aPriority - bPriority
        }

        if (a.order && b.order) {
            return parseInt(a.order as string) < parseInt(b.order as string) ? -1 : 1
        }

        return a.title.localeCompare(b.title)
    })
}

/**
 * Use the request and current course to generate page attributes to use when
 * generating the asciidoc for a module or lesson.
 *
 * @param req Request
 * @param course {Course}
 * @return {Record<string, any>}
 */
export async function getPageAttributes(req: Request | undefined, course: Course): Promise<Record<string, any>> {
    const user = req ? await getUser(req) : undefined

    const attributes: Record<string, any> = {
        name: user?.nickname,
        'cdn-url': CDN_URL || '',
        shared: path.join(ASCIIDOC_DIRECTORY, 'shared'),
    }

    if (req && user && course.usecase) {
        const token = await getToken(req)

        const sandboxConfig = await getSandboxForUseCase(token, user, course.usecase)

        attributes['sandbox-scheme'] = sandboxConfig?.scheme
        attributes['sandbox-uri'] = `${sandboxConfig?.scheme}://${sandboxConfig?.host}:${sandboxConfig?.boltPort}`
        attributes['sandbox-username'] = sandboxConfig?.username
        attributes['sandbox-password'] = sandboxConfig?.password
        attributes['connect-url'] = `${encodeURIComponent(sandboxConfig?.scheme || 'neo4j+s')}://${sandboxConfig?.username}@${sandboxConfig?.host}:${sandboxConfig?.boltPort}`
        attributes['graphql-toolbox'] = `${GRAPHQL_TOOLBOX_URL}?connectURL=${attributes['connect-url']}`
    }

    // Course repository attributes
    for (const [key, value] of Object.entries(course)) {
        if (key.endsWith('repository')) {
            attributes[key] = value
            attributes[`${key}-link`] = repositoryLink(value)
            attributes[`${key}-raw`] = repositoryRawUrl(value)
            attributes[`${key}-blob`] = repositoryBlobUrl(value)
        }
    }

    return attributes
}

/**
 * Generate a link to the repository README
 *
 * @param value The repository - eg neo4j-graphacademy/app-nodejs
 * @return {string}  A URL to append the branch and file path to
 */
export function repositoryLink(value: string) {
    return `https://github.com/${value}`
}

/**
 * Generate base URL for raw repository files
 *
 * @param value The repository - eg neo4j-graphacademy/app-nodejs
 * @return {string}  A URL to append the branch and file path to
 */
export function repositoryRawUrl(value: string) {
    return `https://raw.githubusercontent.com/${value}`
}

/**
 * Generate base URL for linking to files
 *
 * @param value The repository - eg neo4j-graphacademy/app-nodejs
 * @return {string}  A URL to append the branch and file path to
 */
export function repositoryBlobUrl(value: string) {
    return `https://github.com/${value}/blob`
}



let countries: Record<string, any>

/**
 * A list of contries in {[2 letter code]: "country name"} format
 * @returns Record<string, any>
 */
export function getCountries(): Promise<Record<string, any>> {
    if (!countries) {
        countries = require('../../resources/json/countries.json')
    }

    return Promise.resolve(countries)
}

/**
 * Check that a value is true or true-ish
 *
 * @param value any
 * @returns boolean
 */
export function isTruthy(value: any): boolean {
    if (typeof value === 'boolean') {
        return value
    }
    if (typeof value === 'string' && value === 'true') {
        return true
    }

    return false
}

const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
})



const DIVISIONS: { amount: number, name: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, name: "seconds" },
    { amount: 60, name: "minutes" },
    { amount: 24, name: "hours" },
    { amount: 7, name: "days" },
    { amount: 4.34524, name: "weeks" },
    { amount: 12, name: "months" },
    { amount: Number.POSITIVE_INFINITY, name: "years" },
]

export function relativeTime(date: Date) {
    const difference = date.getTime() - Date.now()
    let duration = difference / 1000

    for (let i = 0; i < DIVISIONS.length; i++) {
        const division = DIVISIONS[i]
        if (Math.abs(duration) < division.amount) {
            return formatter.format(Math.round(duration), division.name)
        }
        duration /= division.amount
    }
}
