import { ManagedTransaction } from "neo4j-driver";
import { Course } from "../../../domain/model/course";


export type AbridgedCertification = Pick<Course, 'slug' | 'title' | 'caption' | 'link' | 'certification' | 'categories' | 'duration' | 'passPercentage'>

export default async function getCertificationInformation(tx: ManagedTransaction, slug: string): Promise<AbridgedCertification | undefined> {
  const res = await tx.run<{ course: AbridgedCertification }>(`
    MATCH(c: Course: Certification { slug: $slug })
    RETURN c {
      .*,
      certification: true,
      categories: [(c) - [: IN_CATEGORY] -> (n) | n { .slug, .title }]
    } AS course
  `, { slug })

  return res.records[0]?.get('course')
}
