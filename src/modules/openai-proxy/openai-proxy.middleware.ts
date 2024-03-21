import { NextFunction, Request, Response } from "express";
import { decodeBearerToken } from "./openai-proxy.utils";
import { read, write } from "../neo4j";
import { notify } from "../../middleware/bugsnag.middleware";

export async function requiresValidBearerToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  try {
    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Missing API Key.  You can find your API key in the course content.'
        }
      })
    }

    const { user, course } = decodeBearerToken(token)

    const dbRes = await read<{ llmCallLimitPeriod: string, llmCallLimit: number; allowsLLMCalls: boolean, seenRecently: boolean, throttled: boolean, alreadyCompleted: boolean }>(`
      MATCH (u:User {id: $user})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)
      WHERE c.slug = $course
      WITH c, e,
        coalesce(c.llmCallLimitPeriod, 'PT2M') AS llmCallLimitPeriod,
        coalesce(c.llmCallLimit, 10) AS llmCallLimit
      CALL {
        WITH e, c, llmCallLimitPeriod
        MATCH (e)-[:SENT_LLM_CALL]->(l)
        WHERE l.createdAt >= datetime() - duration(llmCallLimitPeriod)
        RETURN count(l) AS recentCalls
      }
      RETURN c.allowsLLMCalls AS allowsLLMCalls,
        llmCallLimitPeriod, llmCallLimit,
        e:CompletedEnrolment AS alreadyCompleted,
        e.lastSeenAt >= datetime() - duration('P30M') AS seenRecently,
        CASE WHEN llmCallLimit > 0 AND recentCalls >= llmCallLimit THEN true ELSE false END AS throttled
    `, { user, course })

    // Is the user enrolled?
    if (dbRes.records.length === 0) {
      return res.status(401).json({
        error: {
          message: `You must be enrolled to the course to send an LLM request using this key.  Head to https://graphacademy.neo4j.com/courses/${course}/ to enroll.`
        }
      })
    }

    const [first] = dbRes.records

    // Does the course allow LLM calls?
    if (!first.get('allowsLLMCalls')) {
      return res.status(401).json({
        error: {
          message: 'This course does not allow LLM calls.'
        }
      })
    }

    // Have they already completed the course
    if (first.get('alreadyCompleted')) {
      return res.status(401).json({
        error: {
          message: 'This API key expired once you completed the course.  You can always call the LLM directly via the OpenAI API.'
        }
      })
    }

    // Have they been seen recently?
    if (!first.get('seenRecently')) {
      return res.status(401).json({
        error: {
          message: 'You need to have loaded the a lesson within the past 30 minutes to use this key.  If you have the page open, try refreshing the page.'
        }
      })
    }


    // Have they sent a request within the throttle window?
    if (first.get('throttled')) {
      return res.status(401).json({
        error: {
          message: `You are limited to ${first.get('llmCallLimit')} API calls in any ${first.get('llmCallLimitPeriod')} period.  You can always call the LLM directly via the OpenAI API.`
        }
      })
    }

    // Otherwise, everything is fine
    next()
  }
  catch (err: any) {
    notify(err)

    return res.status(401).json({
      error: {
        message: 'Bad API Key.  You can find your API key in the course content.'
      }
    })
  }
}

export async function saveLLMChatCompletion(userId: string, course, body: Record<string, any>, response: string | undefined): Promise<void> {
  await write(`
    MATCH (u:User {id: $user})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)
    WHERE c.slug = $course

    CREATE (l:LLMChatCompletion {
      id: randomUuid(),
      createdAt: datetime(),
      body: $body,
      response: $response
    })
    CREATE (e)-[:SENT_LLM_CALL]->(l)
  `, { user: userId, course, body: JSON.stringify(body), response })
}