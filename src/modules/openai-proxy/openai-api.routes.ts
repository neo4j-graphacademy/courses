import { Router } from "express";
import { OPENAI_PROXY_API_KEY } from "../../constants";
import { requiresAuth } from "express-openid-connect";
import { getUser } from "../../middleware/auth.middleware";
import { User } from "../../domain/model/user";
import OpenAI from "openai";
import { decodeBearerToken, generateBearerToken, getProxyURL } from "./openai-proxy.utils";
import { requiresValidBearerToken, saveLLMChatCompletion } from "./openai-proxy.middleware";
import { Course } from "../../domain/model/course";
import { read } from "../neo4j";

const router = Router()

type CourseLLMInfo = Pick<Course, 'title' | 'slug' | 'allowsLLMCalls' | 'llmCallLimit' | 'llmCallLimitPeriod'> & {
  enrolled: boolean;
  seenRecently: boolean;
  recentCalls: number;
  throttled: boolean;
  remaining: number | null;
}

async function getCourseLLMInfo(slug: string, user: User): Promise<CourseLLMInfo | undefined> {
  const res = await read<CourseLLMInfo>(`
    MATCH (c:Course {slug: $slug})
    WITH c, coalesce(c.llmCallLimitPeriod, 'PT2M') AS llmCallLimitPeriod,
      coalesce(c.llmCallLimit, 10) AS llmCallLimit

    CALL {
      WITH c, llmCallLimitPeriod

      MATCH (u:User {id: $id})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)
      OPTIONAL MATCH (e)-[:SENT_LLM_CALL]->(l)
      WHERE l.createdAt >= datetime() - duration(llmCallLimitPeriod)

      RETURN e IS NOT NULL as enrolled,
        e.lastSeenAt >= datetime() - duration('P30M') AS seenRecently,
        count(l) AS recentCalls
    }

    RETURN c.slug AS slug,
      c.title AS title,
      c.allowsLLMCalls as allowsLLMCalls,
      c.llmCallLimit as llmCallLimit,
      llmCallLimitPeriod,
      enrolled,
      seenRecently,
      recentCalls,
      CASE WHEN llmCallLimit > 0 AND recentCalls >= llmCallLimit THEN true ELSE false END AS throttled,
      CASE WHEN llmCallLimit > 0 THEN c.llmCallLimit - recentCalls ELSE null END AS remaining
  `, { slug, id: user.id })

  if (res.records.length > 0) {
    return res.records[0].toObject()
  }
}

router.get('/keys/:slug', requiresAuth(), async (req, res) => {
  const { slug } = req.params

  const user = await getUser(req) as User
  const course = await getCourseLLMInfo(slug, user)

  if (course === undefined) {
    return res.status(404).json({
      message: `Course ${slug} not found`
    })
  }
  else if (!course.allowsLLMCalls) {
    return res.status(401).json({
      message: `Course ${slug} does not allow LLM calls`
    })
  }

  const key = generateBearerToken(user, slug)

  res.json({
    key,
    url: getProxyURL(),
    throttled: course.throttled,
    seenRecently: course.seenRecently,
    remaining: course.llmCallLimit && course.llmCallLimit > 0 ? Math.max(course.remaining ?? 0, 0) : undefined,
    limit: course.llmCallLimit > 0 ? course.llmCallLimit : 'unlimited',
    period: course.llmCallLimitPeriod,
  })
})

router.post('/v1/completions', requiresValidBearerToken, async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') as string
  const { user, course } = decodeBearerToken(token)

  const openai = new OpenAI({
    apiKey: OPENAI_PROXY_API_KEY as string,
  })

  const body = {
    ...req.body,
    prompt: req.body.prompt.join('\n'),
    model: 'gpt-3.5-turbo-instruct',
    user,
  }

  let completion
  try {
    completion = await openai.completions.create(body)

    await saveLLMChatCompletion(user, course, body, JSON.stringify(completion))

    res.status(201).json(completion)
  }
  catch (e: any) {
    await saveLLMChatCompletion(user, course, body, e.message)

    res.status(e.status).json(e.error)
  }
})

router.post('/v1/chat/completions', requiresValidBearerToken, async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') as string
  const { user, course } = decodeBearerToken(token)

  const openai = new OpenAI({
    apiKey: OPENAI_PROXY_API_KEY as string,
  })

  const body = {
    ...req.body,
    model: 'gpt-3.5-turbo',
    user,
  }

  let completion
  try {
    completion = await openai.chat.completions.create(body)

    await saveLLMChatCompletion(user, course, body, JSON.stringify(completion))

    res.status(201).json(completion)
  }
  catch (e: any) {
    await saveLLMChatCompletion(user, course, body, e.message)

    res.status(e.status).json(e.error)
  }

})

router.post('/v1/embeddings', requiresValidBearerToken, async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: OPENAI_PROXY_API_KEY as string,
    })
    const embeddings = await openai.embeddings.create(req.body)

    res.status(201).json(embeddings)
  }
  catch (e: any) {
    res.status(e.status).json(e.error)
  }
})

export default router
