import { UserViewedCourse } from "../domain/events/UserViewedCourse";
import { UserViewedLesson } from "../domain/events/UserViewedLesson";
import { UserViewedModule } from "../domain/events/UserViewedModule";
import { emitter } from "../events";
import { write } from "../modules/neo4j";

export default function initCourseListeners() {
  const setLastSeenAt = async (event: UserViewedCourse | UserViewedLesson) => {
    await write(`
      MATCH (u:User {id: $user})
      MATCH (u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)
      WHERE c.slug = $course
      SET e.lastSeenAt = datetime()

    `, { user: event.user.id, course: event.course.slug }
    )
  }

  emitter.on<UserViewedModule>(UserViewedModule, event => setLastSeenAt(event))
  emitter.on<UserViewedLesson>(UserViewedLesson, event => setLastSeenAt(event))

}