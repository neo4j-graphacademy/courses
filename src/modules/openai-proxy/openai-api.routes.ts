import { Router } from "express";
import { OPENAI_PROXY_API_KEY } from "../../constants";
import { requiresAuth } from "express-openid-connect";
import { getUser } from "../../middleware/auth.middleware";
import { User } from "../../domain/model/user";
import OpenAI from "openai";
import { decodeBearerToken, generateBearerToken, getProxyURL } from "./openai-proxy.utils";
import { requiresValidBearerToken, saveLLMChatCompletion } from "./openai-proxy.middleware";

const router = Router()

router.get('/keys/:slug', requiresAuth(), async (req, res) => {
  const user = await getUser(req) as User
  const key = generateBearerToken(user, req.params.slug)

  res.json({
    key,
    url: getProxyURL(),
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
