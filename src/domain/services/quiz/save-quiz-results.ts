import { emitter } from "../../../events";
import { write } from "../../../modules/neo4j";
import { UserCompletedCourse } from "../../events/UserCompletedCourse";
import { CourseWithProgress } from "../../model/course";
import { User } from "../../model/user";
import { appendParams, courseCypher, } from "../cypher";

export async function saveQuizResults(user: User, token: string, course: string, answers: Record<string, any>): Promise<CourseWithProgress> {
    const res = await write(`
        MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c {slug: $course})

        SET e:CompletedEnrolment:CompletedWithQuiz,
            e.completedAt = datetime(),
            e.quizAnswers = $answers

        RETURN ${courseCypher('e')} AS course
    `, appendParams({
        sub: user.sub,
        course,
        answers: JSON.stringify(answers),
    }))

    const [first] = res.records
    const courseWithProgress: CourseWithProgress = first.get('course')

    emitter.emit(new UserCompletedCourse(user, courseWithProgress, token, true))

    return courseWithProgress
}
