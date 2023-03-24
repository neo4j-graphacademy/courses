import axios from 'axios'
import { createSandbox, getAuth0UserInfo, getOrCreateSandboxForUseCase, getSandboxes, getSandboxForUseCase, getUserInfo, Sandbox, sandboxApi } from '.'
import { SANDBOX_URL } from '../../constants'
import { User } from '../../domain/model/user'

const {
    SANDBOX_TOKEN = ''
} = process.env

const user = {} as User

describe('Sandbox Module', () => {

    describe('Setup', () => {
        it('should have env variables set', () => {
            expect(SANDBOX_URL).toBeDefined()
            expect(SANDBOX_TOKEN).toBeDefined()
            expect(SANDBOX_TOKEN).not.toEqual('')
        })
    })

    describe('sandboxApi', () => {
        it('should create api as a singleton', () => {
            const api = sandboxApi()
            expect(api).toBeDefined()

            const api2 = sandboxApi()
            expect(api2).toEqual(api)
        })
    })

    describe('getSandboxes', () => {
        it('should get sandboxes for a user', async () => {
            const sandboxes = await getSandboxes(SANDBOX_TOKEN, {} as User)

            expect(sandboxes).toBeInstanceOf(Array)
        })
    })

    describe('getAuth0UserInfo', () => {
        it('should get user profile', async () => {
            const res = await getAuth0UserInfo(SANDBOX_TOKEN, user)
            expect(res).toBeInstanceOf(Object)
            expect(res).toBeDefined()
        })
    })

    describe('getOrCreateSandboxForUseCase', () => {
        it('should create a sandbox', async () => {
            jest.setTimeout(30000)

            const first = await getOrCreateSandboxForUseCase(SANDBOX_TOKEN, user, 'recommendations')
            const second = await getOrCreateSandboxForUseCase(SANDBOX_TOKEN, user, 'recommendations')

            expect(first.sandboxHashKey).toEqual(second.sandboxHashKey)

            const all = await getSandboxes(SANDBOX_TOKEN, user)
            expect(all.length).toBeGreaterThan(0)

            expect(all.find(sandbox => sandbox.sandboxHashKey === first.sandboxHashKey)).toBeDefined()

            const get = await getSandboxForUseCase(SANDBOX_TOKEN, user, 'recommendations')

            expect(get).toBeDefined()

            console.log(get);

            expect(get!.sandboxHashKey).toEqual(first.sandboxHashKey)
            expect(get!.sandboxHashKey).toEqual(second.sandboxHashKey)

            console.log(first);
        })
    })

    describe('createSandbox', () => {
        it('should create a sandbox', async () => {
            jest.setTimeout(30000)

            const usecase = 'blank-sandbox'

            const first = await createSandbox(SANDBOX_TOKEN, user, usecase)
            const second = await createSandbox(SANDBOX_TOKEN, user, usecase)

            expect(first.sandboxHashKey).toEqual(second.sandboxHashKey)

            const all = await getSandboxes(SANDBOX_TOKEN, user)

            expect(all.find(sandbox => sandbox.sandboxHashKey === first.sandboxHashKey)).toBeDefined()

            const get = await getSandboxForUseCase(SANDBOX_TOKEN, user, usecase)

            expect(get).toBeDefined()

            console.log(get);

            expect(get!.sandboxHashKey).toEqual(first.sandboxHashKey)
            expect(get!.sandboxHashKey).toEqual(second.sandboxHashKey)

            console.log(first);
        })
    })
})
