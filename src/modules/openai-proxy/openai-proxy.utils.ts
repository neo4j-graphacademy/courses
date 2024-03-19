import { User } from "../../domain/model/user";

export const TOKEN_PREFIX = 'ga-'

export function generateBearerToken(user: User, slug: string): string {
  const key = Buffer.from(`${user.id}:${slug}`, 'utf-8').toString('base64')

  return `${TOKEN_PREFIX}${key}`
}

export function decodeBearerToken(token: string): { user: string, course: string } {
  const decoded = Buffer.from(token.replace(TOKEN_PREFIX, ''), 'base64').toString('utf8')

  console.log(decoded);

  const [user, course] = decoded.split(':')

  console.log(user, course);


  return { user, course }
}
