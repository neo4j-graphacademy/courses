/**
 * Match Neo4j `apoc.text.base64Encode` for UTF-8 strings (used in MERGE keys).
 */
export function apocBase64Encode(s: string): string {
  return Buffer.from(s, "utf8").toString("base64");
}

/** Composite (:Lesson).id — same as `apoc.text.base64Encode(lesson.link)` in tx.cypher */
export function lessonNodeId(lessonLink: string): string {
  return apocBase64Encode(lessonLink);
}

/** Composite (:Question).id — same as `apoc.text.base64Encode(l.id + '--' + questionSlug)` */
export function questionNodeId(lessonLink: string, questionSlug: string): string {
  return apocBase64Encode(`${lessonNodeId(lessonLink)}--${questionSlug}`);
}

/** Composite (:Answer).id — same as `apoc.text.base64Encode(l.id + '--' + questionSlug + '--' + index)` */
export function answerNodeId(
  lessonLink: string,
  questionSlug: string,
  index: number,
): string {
  return apocBase64Encode(
    `${lessonNodeId(lessonLink)}--${questionSlug}--${index}`,
  );
}
