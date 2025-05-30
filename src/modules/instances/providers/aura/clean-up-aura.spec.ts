import { User } from "../../../../domain/model/user"
import { AuraInstanceProvider } from "./aura-instance.provider"

describe('Clean up Instances', () => {

    jest.setTimeout(30000)

    let provider: AuraInstanceProvider

    beforeAll(async () => {
        provider = await AuraInstanceProvider.create()
    })

    it('should delete an instance', async () => {
        const instances = await provider.getInstances('', {} as User)

        for (const instance of instances) {
            console.log(`Stopping instance ${instance.id}`)
            await provider.stopInstance('', {} as User, instance.id)
        }
    })
})
