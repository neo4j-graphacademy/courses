import { config } from 'dotenv'
import initNeo4j, { close } from '../../modules/neo4j'
import { getSandboxForUseCase, stopSandbox } from '../../modules/sandbox'
import { CourseWithProgress, } from "../model/course"
import { User } from '../model/user'
import { createAndSaveSandbox } from "./create-and-save-sandbox"

// Sandbox module relies on process.env being set
config()

// TODO: Get token programatically
const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlFUbENPRVV4UmtJNFJETkROakpETXpBME5EZzBRelV3UWpNek9UVTVNRFF4TlRKRk56STJOZyJ9.eyJlbWFpbCI6ImFkYW0uY293bGV5QG5lb3RlY2hub2xvZ3kuY29tIiwibmFtZSI6IkFkYW0gQ293bGV5IiwiZ2l2ZW5fbmFtZSI6IkFkYW0iLCJmYW1pbHlfbmFtZSI6IkNvd2xleSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHaWZSMHNVd0hfN3BIdmNhem5icGlpaGdJNTdYMFhka2VDb1l3THI9czk2LWMiLCJsb2NhbGUiOiJlbiIsIm5pY2tuYW1lIjoiYWRhbS5jb3dsZXkiLCJ1c2VyX21ldGFkYXRhIjp7ImZpcnN0TmFtZSI6IiIsImxhc3ROYW1lIjoiIiwid29ya0VtYWlsIjoiIiwiY29tcGFueSI6IngiLCJjb3VudHJ5IjoiIiwic3RhdGUiOiIiLCJwaG9uZSI6IiIsImNvZGluZ0xhbmd1YWdlIjoiamF2YXNjcmlwdCJ9LCJhcHBfbWV0YWRhdGEiOnsiYWNjZXB0ZWRUZXJtcyI6dHJ1ZSwic2FuZGJveHYzIjp7ImNyZWF0ZWRBdCI6MTU4MDkxNzU2NTIzMSwiYWdyZWVkVG9UZXJtc0F0IjoxNTgwOTE3NjEwODgxLCJzYW5kYm94QnJvd3NlclRvdXIiOjE2MTYxNTQ3OTkzNDUsInNhbmRib3hCcm93c2VyRmVlZGJhY2siOnsicmF0aW5nIjoxLCJ0ZXh0RmVlZGJhY2siOiIifX19LCJhY2NlcHRlZFRlcm1zIjp0cnVlLCJzYW5kYm94djMiOnsiY3JlYXRlZEF0IjoxNTgwOTE3NTY1MjMxLCJhZ3JlZWRUb1Rlcm1zQXQiOjE1ODA5MTc2MTA4ODEsInNhbmRib3hCcm93c2VyVG91ciI6MTYxNjE1NDc5OTM0NSwic2FuZGJveEJyb3dzZXJGZWVkYmFjayI6eyJyYXRpbmciOjEsInRleHRGZWVkYmFjayI6IiJ9fSwiZmlyZWJhc2VfZGF0YSI6eyJ1aWQiOiJnb29nbGUtb2F1dGgyfDExMzA0NjE5NjM0OTc4MDk4ODE0NyJ9LCJzY29wZXMiOnsic2FuZGJveGVzIjpbInNib3gxIiwic2JveDIiLCJzYm94MyJdfSwiZW1haWxfdmVyaWZpZWQiOnRydWUsImNsaWVudElEIjoiRHhobWlGOFRDZXpuSTdYb2kwOFV5WVNjTEdabms0a2UiLCJ1cGRhdGVkX2F0IjoiMjAyMi0wMy0wMlQxMTowMDo0OC4zMDJaIiwidXNlcl9pZCI6Imdvb2dsZS1vYXV0aDJ8MTEzMDQ2MTk2MzQ5NzgwOTg4MTQ3IiwiaWRlbnRpdGllcyI6W3sicHJvdmlkZXIiOiJnb29nbGUtb2F1dGgyIiwidXNlcl9pZCI6IjExMzA0NjE5NjM0OTc4MDk4ODE0NyIsImNvbm5lY3Rpb24iOiJnb29nbGUtb2F1dGgyIiwiaXNTb2NpYWwiOnRydWV9XSwiY3JlYXRlZF9hdCI6IjIwMTctMDgtMjVUMTM6MTA6MjMuOTE4WiIsImlzcyI6Imh0dHBzOi8vbmVvNGotc3luYy5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMTMwNDYxOTYzNDk3ODA5ODgxNDciLCJhdWQiOiJEeGhtaUY4VENlem5JN1hvaTA4VXlZU2NMR1puazRrZSIsImlhdCI6MTY0NjIxODg0OSwiZXhwIjoxNjQ2MzA1MjQ5LCJub25jZSI6ImllNFFpVXp5MUcydGhRQUNkUEhJaVZ2TmFDMWIyREw1MHZVUkg4Tk1Rd0kifQ.VXPWssQ2x_OVNHbxjKwL9VO7-MUwRbev40_r_v4U1C9jwJLylVg1ZwlAV8vNv_jLtSwgYY3oynScZyid0SkVMbV-tFPBjEEwgIN-S2A7ZctLh7fFM6VbBEEt80DBv16m3IlVv-_EnsqTl79mDCFKbxSnWfIFVM9Yuej_QvcX176d8Cd_1HTvNZ3zcYx3aRWBifnhk0CA0nPbsqAnNyGjiVpgER_UGZwxMW-qHMfEkuhoWaiUA6N-30wI3m74LVCGqP-Binyn6RGIKbe7FLTbV0WEAnvGuWoT1jZcSCjFWlLbO-9_m27g469HTGzJcqjeS0gJqtTeSsLsgdfVjdHYoA"

const user = {} as User

const course: CourseWithProgress = {
    enrolmentId: '1234',
    usecase: 'twitter-trolls'
} as CourseWithProgress

describe('createAndSaveSandbox', () => {
    beforeAll(() => {
        const {
            NEO4J_HOST,
            NEO4J_USERNAME,
            NEO4J_PASSWORD,
        } = process.env

        return initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)
    })

    afterAll(() => close())

    it('should return undefined if no usecase is defined', async () => {
        const noUseCase = {
            usecase: undefined
        } as CourseWithProgress

        expect(await createAndSaveSandbox(token, user, noUseCase)).toEqual(undefined)
    })


    it('should throw an error if token is invalid', async () => {
        expect(() => createAndSaveSandbox('', user, course)).rejects.toThrow()
    })

    it('should create a new sandbox', async () => {
        // Terminate existing if one already exists
        const existing = await getSandboxForUseCase(token, user, course.usecase!)

        if ( existing !== undefined ) {
            await stopSandbox(token, user, existing.sandboxHashKey)
        }

        // Attempt to create
        const output = await createAndSaveSandbox(token, user, course)

        expect(output).toBeDefined()
        expect(output?.usecase).toEqual(course.usecase)
    })

    it('should use an existing sandbox if it exists', async () => {
        // Attempt to create
        const first = await createAndSaveSandbox(token, user, course)

        expect(first).toBeDefined()

        // Should use existing sandbox
        const second = await createAndSaveSandbox(token, user, course)

        expect(second).toBeDefined()

        // Both values should be equal
        expect(first!.sandboxHashKey).toEqual(second!.sandboxHashKey)
    })
})
