import path from 'path'
import { Asciidoctor } from "@asciidoctor/core/types"
import { ASCIIDOC_DIRECTORY, ATTRIBUTE_ORDER, COURSE_DIRECTORY, PUBLIC_DIRECTORY } from "./constants"

export const padOrder = (order: string | number): string => {
    return ('0000' + order).slice(-4)
}

export const getOrderAttribute = (folder: string, file: Asciidoctor.Document): number => {
    let order = file.getAttribute(ATTRIBUTE_ORDER, null)

    if (typeof order === 'string') {
        order = padOrder(order)
    }

    // If order is undefined, use the first part of folder name to order
    // eg: 1-first or 10-tenth
    if (order === undefined) {
        const folderParts = folder.split('/')
        const folderName = folderParts[folderParts.length - 1]

        const orderParts = folderName.split('-')
        order = padOrder(orderParts[0])
    }

    return parseInt(order)
}

export const getDateAttribute = (file: Asciidoctor.Document, attribute: string): string | undefined => {
    const date = file.getAttribute(attribute)

    return date !== undefined ? new Date(date.replace(/\s/g, '')).toISOString() : undefined
}

export function courseOverviewPath(slug: string): string {
    return path.join(COURSE_DIRECTORY, slug, 'course.adoc')
}

export function courseSummaryPath(slug: string): string {
    return path.join(COURSE_DIRECTORY, slug, 'summary.adoc')
}

export function moduleOverviewPath(course: string, module: string): string {
    return path.join(COURSE_DIRECTORY, course, 'modules', module, 'module.adoc')
}

export function courseBadgePath(slug: string): string {
    return path.join(COURSE_DIRECTORY, slug, 'badge.svg')
}

export function coursePublicBadgePath(slug: string): string {
    return path.join(PUBLIC_DIRECTORY, 'img', 'courses', 'badges', `${slug}.svg`)
}

export function courseIllustrationPath(slug: string): string {
    return path.join(COURSE_DIRECTORY, slug, 'illustration.svg')
}

export function coursePublicIllustrationPath(slug: string): string {
    return path.join(PUBLIC_DIRECTORY, 'img', 'courses', 'illustrations', `${slug}.svg`)
}

export function courseBackgroundPath(slug: string): string {
    return path.join(COURSE_DIRECTORY, slug, 'background.png')
}

export function coursePublicBackgroundPath(slug: string): string {
    return path.join(PUBLIC_DIRECTORY, 'img', 'courses', 'backgrounds', `${slug}.png`)
}

export function courseBannerPath(slug: string): string {
    return path.join(COURSE_DIRECTORY, slug, 'banner.png')
}

export function coursePublicBannerPath(slug: string): string {
    return path.join(PUBLIC_DIRECTORY, 'img', 'courses', 'banners', `${slug}.png`)
}

export function categoryOverviewPath(slug: string) {
    return path.join(ASCIIDOC_DIRECTORY, 'categories', `${slug}.adoc`)
}

export function categoryBadgePath(slug: string): string {
    return path.join(PUBLIC_DIRECTORY, 'img', 'categories', 'badges', `${slug}.svg`)
}

export function categoryBannerPath(slug: string) {
    return path.join(PUBLIC_DIRECTORY, 'img', 'categories', 'banners', `${slug}.png`)
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

export function attributeIsTruthy(file: Asciidoctor.Document, attribute: string, defaultValue: any = null) {
    const value = file.getAttribute(attribute, defaultValue)
    return isTruthy(value)
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
