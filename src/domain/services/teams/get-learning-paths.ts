import { read } from "../../../modules/neo4j"
import { User } from "../../model/user";

interface ExistingPath {
    name: string;
    courses: string; // comma separated list of course slugs
}

export default async function getLearningPaths(user: User): Promise<{ teamPaths: ExistingPath[], categoryPaths: ExistingPath[] }> {
    const res = await read<{ teamPaths: ExistingPath[], categoryPaths: ExistingPath[] }>(` 

        OPTIONAL MATCH (u:User {sub: $sub})

        CALL (u) {
            MATCH (u)-[:MEMBER_OF]->(t)<-[r:ON_LEARNING_PATH_FOR]-(c)
            WITH t, c ORDER BY r.order ASC 
            WITH t, collect(c.slug) as courses
            WHERE size(courses) > 0
            RETURN collect({ name: t.name, courses: apoc.text.join(courses, ',') }) as teamPaths
        }

        CALL { 
            MATCH (:Category {slug: 'paths'})-[:HAS_CHILD]->(c:Category)
            MATCH (co:Course)-[r:IN_CATEGORY]->(c)
            WITH c, co ORDER BY r.order ASC 
            WITH c, collect(co.slug) as courses
            WHERE size(courses) > 0
            RETURN collect({ name: c.title, courses: apoc.text.join(courses, ',') }) as categoryPaths
        }

        RETURN teamPaths, categoryPaths
        `, { sub: user.sub })

    if (res.records.length === 0) {
        return {
            teamPaths: [],
            categoryPaths: []
        }
    }

    return {
        teamPaths: res.records[0].get('teamPaths') || [],
        categoryPaths: res.records[0].get('categoryPaths') || []
    }
}   