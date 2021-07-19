import path from 'path'
import fs from 'fs'
import { ASCIIDOC_DIRECTORY } from '../constants';
import { Course } from "../domain/model/course";

export function sortCourse(course: Course): Course {
    course.modules.map(module => {
        module.lessons.sort((a, b) => a.order < b.order ? -1 : 1)
    })
    course.modules.sort((a, b) => a.order < b.order ? -1 : 1)

    return course
}

export function formatCourse(course: Course): Course {
    let badge
    let badgePath = path.join(ASCIIDOC_DIRECTORY, 'courses', course.slug, 'badge.svg')

    if ( fs.existsSync(badgePath) ) {
        badge = fs.readFileSync(badgePath).toString()
        // badgePath = path.join(__dirname, '..', '..', 'resources', 'svg', 'default-badge.svg')
    }


    return {
        ...course,
        badge,
    }
}