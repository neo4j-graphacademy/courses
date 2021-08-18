import path from 'path'
import fs from 'fs'
import { ASCIIDOC_DIRECTORY, BASE_URL } from '../constants';
import { Course } from "../domain/model/course";
import { User } from '../domain/model/user';
import { Lesson } from '../domain/model/lesson';

export function sortCourse(course: Course): Course {
    course.modules?.map(module => {
        module.lessons?.sort((a, b) => a.order < b.order ? -1 : 1)
    })
    course.modules?.sort((a, b) => a.order < b.order ? -1 : 1)

    return course
}

export function formatCourse(course: Course): Course {
    let badge
    const badgePath = path.join(ASCIIDOC_DIRECTORY, 'courses', course.slug, 'badge.svg')

    if (fs.existsSync(badgePath)) {
        badge = fs.readFileSync(badgePath).toString()
    }

    return sortCourse({
        ...course,
        badge,
    })
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

    for (let key in elements) {
        for (let inner in elements[key]) {
            // @ts-ignore
            output[ `${key}_${inner}` ] = elements[key][inner]?.toString()
        }
    }

    return output

}