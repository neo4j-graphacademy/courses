import { join, parse } from "path";
import { readFile } from "fs/promises";
import { LessonToImport } from "./load-lessons";
import { doc, loadFile } from "../../modules/asciidoc";
import { COURSE_DIRECTORY } from "../../constants";
import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { answerNodeId } from "./graph-ids";

export type AnswerToImport = {
  id: string;
  text: string;
  correct: boolean;
  /** Display order within the question (0-based, checklist order). */
  order: number;
};

export type QuestionToImport = {
  id: string;
  filename: string;
  basename: string;
  title: string;
  text: string;
  lessonLink: string;
  type: string;
  hint: string | null;
  solution: string | null;
  order: number;
  answers: AnswerToImport[];
};

const generateQuestionId = (title: string): string => {
  const adoc = `== ${title}`;
  const html = doc.load(adoc).convert();
  const matches = html.match(/<h2 id="([^"]+)">/);

  if (matches) {
    return matches[1];
  }

  return (
    "_" +
    title
      .replace(/(<([^>]+)>)/gi, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/_+$/g, "")
  );
};

function stripBlockComments(raw: string): string {
  return raw.replace(/\/\/\/\/[\s\S]*?\/\/\/\//g, "");
}

function extractTipBlock(raw: string, role: "hint" | "solution"): string | null {
  const re = new RegExp(
    `\\[TIP,role=${role}\\]\\s*\\n(?:\\.[^\\n]*\\n)?====\\s*\\n([\\s\\S]*?)\\n====`,
    "m",
  );
  const m = raw.match(re);
  return m ? m[1].trim() : null;
}

function extractChecklistOptions(raw: string): { text: string; correct: boolean }[] {
  const options: { text: string; correct: boolean }[] = [];
  const lines = raw.split(/\r?\n/);
  let inChecklist = false;
  for (const line of lines) {
    const m = line.match(/^\s*[\*\-]\s*\[([ xX])\]\s*(.+)$/);
    if (m) {
      inChecklist = true;
      options.push({
        correct: m[1].toLowerCase() === "x",
        text: m[2].trim(),
      });
    } else if (inChecklist) {
      // Blank lines between options are common; only stop at non-empty non-checklist lines.
      if (line.trim() === "") {
        continue;
      }
      break;
    }
  }
  return options;
}

/** First section title line (`= ...`) after optional `[.question]` / `[.verify]`. */
function extractTitleFromRaw(raw: string): string {
  const lines = stripBlockComments(raw).split(/\r?\n/);
  let i = 0;
  if (lines[i]?.match(/^\[\.(question|verify)\]/)) {
    i++;
  }
  while (i < lines.length && lines[i].trim() === "") {
    i++;
  }
  const m = lines[i]?.match(/^=\s+(.+)$/);
  return m ? m[1].trim() : "";
}

function extractStem(raw: string): string {
  const withoutComments = stripBlockComments(raw);
  const lines = withoutComments.split(/\r?\n/);
  let i = 0;
  if (lines[i]?.match(/^\[\.(question|verify)\]/)) {
    i++;
  }
  while (i < lines.length && lines[i].trim() === "") {
    i++;
  }
  if (!lines[i]?.match(/^=\s+/)) {
    return "";
  }
  i++;
  while (i < lines.length && lines[i].trim() === "") {
    i++;
  }
  const stemLines: string[] = [];
  for (; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.match(/^[\*\-]\s*\[[ xX]\]/)) {
      break;
    }
    if (trimmed.startsWith("verify::")) {
      break;
    }
    if (trimmed.startsWith("[TIP")) {
      break;
    }
    if (trimmed.startsWith("image::")) {
      break;
    }
    stemLines.push(lines[i]);
  }
  return stemLines.join("\n").trim();
}

function detectBlockRole(raw: string): "verify" | "question" | null {
  const m = stripBlockComments(raw).match(/^\[\.(question|verify)\]/m);
  if (m?.[1] === "verify") {
    return "verify";
  }
  if (m?.[1] === "question") {
    return "question";
  }
  return null;
}

const loadQuestion = async (
  lesson: LessonToImport,
  filename: string,
  order: number,
): Promise<QuestionToImport> => {
  const filepath = join(
    COURSE_DIRECTORY,
    lesson.course.slug,
    "modules",
    lesson.module.slug,
    "lessons",
    lesson.slug,
    "questions",
    filename,
  );
  const parsed = parse(filename);
  const basename = parsed.name;

  const raw = await readFile(filepath, "utf8");
  // Header-only: avoids resolving body `include::` (unfilled attrs like `{cypher-repository-raw}`).
  const file = loadFile(filepath, { parse_header_only: true });
  const titleFromRaw = extractTitleFromRaw(raw);
  const title =
    ((file.getTitle() as string) || "").trim() || titleFromRaw;
  const id = file.getAttribute(
    "id",
    generateQuestionId(
      ((file.getDocumentTitle({ sanitize: true }) as string) || "").trim() ||
        titleFromRaw ||
        title,
    ),
  ) as string;
  const stem = extractStem(raw);
  const hint = extractTipBlock(raw, "hint");
  const solution = extractTipBlock(raw, "solution");
  const optionRows = extractChecklistOptions(raw);
  const blockRole = detectBlockRole(raw);

  const attrType = file.getAttribute("type", null) as string | null;
  let type = attrType?.trim() || "";
  if (!type) {
    if (blockRole === "verify") {
      type = "verify";
    } else if (optionRows.length > 0) {
      type = "multiple-choice";
    } else {
      type = "multiple-choice";
    }
  }

  const answers: AnswerToImport[] = optionRows.map((opt, index) => ({
    id: answerNodeId(lesson.link, id, index),
    text: opt.text,
    correct: opt.correct,
    order: index,
  }));

  return {
    id,
    filename: parsed.base,
    basename,
    title,
    text: stem,
    lessonLink: lesson.link,
    type,
    hint,
    solution,
    order,
    answers,
  };
};

export default async function loadQuestions(
  lessons: LessonToImport[],
): Promise<QuestionToImport[]> {
  const output: QuestionToImport[] = [];
  for (const lesson of lessons) {
    const questionDir = join(
      COURSE_DIRECTORY,
      lesson.course.slug,
      "modules",
      lesson.module.slug,
      "lessons",
      lesson.slug,
      "questions",
    );

    if (existsSync(questionDir)) {
      const filenames = (await readdir(questionDir)).filter((f) =>
        f.endsWith(".adoc"),
      );
      filenames.sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
      );

      for (let o = 0; o < filenames.length; o++) {
        const question = await loadQuestion(lesson, filenames[o], o);
        output.push(question);
      }
    }
  }

  return output;
}
