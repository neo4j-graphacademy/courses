import { User } from "../../../../domain/model/user"
import { AuraInstanceProvider } from "./aura-instance.provider"

describe('Clean up Instances', () => {

    jest.setTimeout(30000)

    let provider: AuraInstanceProvider

    beforeAll(async () => {
        provider = new AuraInstanceProvider()
    })

    it('should delete an instance', async () => {
        const instances = await provider.getInstances('', {} as User)

        for (const instance of instances) {
            console.log(instance)
            if (instance.name?.startsWith('test-') || instance.hashKey?.startsWith('t-')) {
                await provider.stopInstance('', {} as User, instance.id)
            }
        }
    })
})
