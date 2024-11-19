import { formatCourse } from "../../utils";
import { STATUS_ACTIVE } from "../model/course";
import getCourses from "./get-courses";

export default async function getCertifications() {
    const courses = await getCourses()
    return Promise.all(courses.filter(course => course.certification)
        .filter(course => course.status === STATUS_ACTIVE)
        .map(async course => await formatCourse(course)))
}
