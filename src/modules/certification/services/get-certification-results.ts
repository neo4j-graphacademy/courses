import { Course } from "../../../domain/model/course"
import { User } from "../../../domain/model/user";
import { read } from "../../neo4j";

type QuestionWithAnswer = {
  id: string;
  category: { title: string, slug: string };
  title: string;
  question: string;
  options: string[];
  answers: string[];
  provided: string[];
  correct: boolean;
  feedback: string | undefined;
}

type CategoryWithQuestions = {
  slug: string;
  title: string;
  questions: QuestionWithAnswer[];
  status: 'success' | 'warning' | 'danger';
  total: number;
  correct: number;
  percentage: number;
}

type CertificationResults = {
  course: Pick<Course, 'slug' | 'title' | 'link' | 'caption'>;
  passed: boolean;
  certificateId: string | undefined;
  certificateUrl: string | undefined;
  updatedAt: string; // DateTime
  assigned: number;
  correct: number;
  percentage: number;
  questions: CategoryWithQuestions[]
}

export default async function getCertificationResults(slug: string, user: User): Promise<CertificationResults | undefined> {
  const res = await read<CertificationResults>(`
    MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $slug})
    MATCH (e)-[:HAS_ATTEMPT]->(a)
    WITH u, e, c, a ORDER BY a.createdAt DESC LIMIT 1

    WITH u, e, c, a

    MATCH (a)-[:ASSIGNED_QUESTION]->(q)-[:IN_CATEGORY]->(cc)
    OPTIONAL MATCH (a)-[r:PROVIDED_ANSWER]->(q)

    WITH *
    ORDER BY cc.order, q.level

    WITH a, c, e, cc, collect(q {
      .id, .title, .question, .options, answers: q.correct,
      category: cc { .title, .slug },
      provided: coalesce(r.answers, []),
      correct: r.correct,
      feedback: CASE WHEN coalesce(r.correct, false) THEN q.correctFeedback ELSE q.incorrectFeedback END
    }) AS questions

    WITH a, c, e, cc, questions, size(questions) AS total, size([ n in questions where n.correct | n]) AS correct

    WITH a, c, e,
      collect({
        slug: cc.slug,
        title: cc.title,
        questions: questions,
        total: total,
        correct: correct,
        percentage: 100.0 * correct / size(questions),
        status: CASE
          WHEN 100.0 * correct / size(questions) < 60 THEN 'danger'
          WHEN 100.0 * correct / size(questions) < 85 THEN 'warning'
          ELSE 'success' END
      }) AS questions,
      COUNT { (a)-[:PROVIDED_ANSWER {correct: true}]->() } AS correct,
      COUNT { (a)-[:ASSIGNED_QUESTION]->() } AS assigned

    RETURN c { .title, .slug, .link, .caption } AS course,
      e.certificateId AS certificateId,
      '/c/'+ e.certificateId +'/' AS certificateUrl,
      a.updatedAt AS updatedAt,
      correct,
      assigned,
      round(100.0 * correct / assigned, 1) AS percentage,
      round(100.0 * correct / assigned, 1) > course.passPercentage AS passed,
      questions

  `, { slug, sub: user.sub })

  return res.records[0]?.toObject()
}
