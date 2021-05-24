import { Course } from "../domain/model/course";

export function sortCourse(course: Course): Course {
    course.modules.map(module => {
        module.lessons.sort((a, b) => a.order < b.order ? -1 : 1)
    })
    course.modules.sort((a, b) => a.order < b.order ? -1 : 1)

    return course
}