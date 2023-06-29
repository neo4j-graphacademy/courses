import { formatCourse } from "../../utils";
import getCourses from "./get-courses";

export default async function getCertifications() {
    const courses = await getCourses()
    return Promise.all(courses.filter(course => course.certification)
        .map(async course => await formatCourse(course)))
}
