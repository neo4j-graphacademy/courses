import { InstanceProvider } from "../../instance-provider.interface";
import { Instance } from "../../../../domain/model/instance";
import { User } from "../../../../domain/model/user";
import axios, { AxiosInstance } from 'axios';
import { AURA_API_URL, AURA_CLIENT_ID, AURA_CLIENT_SECRET, AURA_TENANT_ID } from "../../../../constants";

export class AuraInstanceProvider implements InstanceProvider {
    private api: AxiosInstance;

    constructor(private readonly token: string) {
        this.api = axios.create({
            baseURL: AURA_API_URL,
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
    }

    static async create(): Promise<AuraInstanceProvider> {
        const token = await AuraInstanceProvider.generateToken();
        const provider = new AuraInstanceProvider(token);

        return provider;
    }

    static async generateToken(): Promise<string> {
        try {
            const response = await axios.post('https://api.neo4j.io/oauth/token',
                'grant_type=client_credentials',
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${AURA_CLIENT_ID}:${AURA_CLIENT_SECRET}`).toString('base64')}`
                    }
                }
            );

            return response.data.access_token;
        } catch (e) {
            console.error('Error generating Aura token:', e);
            throw new Error('Failed to generate Aura token');
        }
    }

    private mapAuraInstanceToInstance(auraInstance: any): Instance {
        const [userId, usecase] = auraInstance.name.split('||')

        console.log(userId, usecase, auraInstance.name)

        return {
            id: auraInstance.id,
            hashKey: auraInstance.name,
            usecase,
            scheme: 'neo4j+s',
            ip: undefined,
            host: `${auraInstance.id}.databases.neo4j.io`,
            boltPort: '7687',
            username: 'neo4j',
            password: auraInstance.password,
            expires: 0,
            status: auraInstance.status,
            vectorOptimized: auraInstance.vector_optimized,
            graphAnalyticsPlugin: auraInstance.graph_analytics_plugin,
        };
    }

    async getInstanceForUseCase(token: string, user: User, usecase: string): Promise<Instance | undefined> {
        const instances = await this.getInstances(token, user);

        const name = this.getInstanceName(user, usecase)

        console.log('looking for', name)

        const found = instances.find((instance: Instance) => instance.hashKey === name)

        console.log(' --found? ', !!found)

        console.log('getInstanceForUseCase', { name, found, instances: instances.map(instance => instance.hashKey) })

        // if (!found) {
        //     throw new Error('Not implemented: ')
        // }

        return found
    }

    async getInstanceById(token: string, user: User, hash: string): Promise<{ instance: Instance; status: string }> {
        try {
            const response = await this.api.get(`/${hash}`);
            const auraInstance = response.data.data;

            return {
                instance: this.mapAuraInstanceToInstance(auraInstance),
                status: auraInstance.status.toUpperCase()
            };
        }
        catch (e: any) {
            if (e.response?.status === 404) {
                throw new Error(`Instance with ID ${hash} not found`);
            }

            throw e;
        }
    }

    async getInstances(token: string, user: User): Promise<Instance[]> {
        try {
            const response = await this.api.get('');
            const instances = response.data.data || [];

            return instances
                // .filter(instance => instance.name.startsWith(user.sub))
                .map((instance: any) => this.mapAuraInstanceToInstance(instance));
        }
        catch (e: any) {
            console.error('Error fetching Aura instances:', e);
            return [];
        }
    }

    async stopInstance(token: string, user: User, id: string): Promise<void> {
        try {
            await this.api.delete(`/${id}`);
        }
        catch (e: any) {
            if (e.response?.status === 404) {
                throw new Error(`Instance with ID ${id} not found`);
            }

            throw e;
        }
    }

    /**
     * Generate a unique name for the instance as a combination of the 
     * user sub (unique ID) and the usecase 
     * 
     * @param user 
     * @param usecase 
     * @returns {string}
     */
    private getInstanceName(user: User, usecase: string): string {
        // TODO: This is a temporary solution to ensure the name is <= 30 characters
        // return `${user.sub}||*||${usecase}`

        const [provider, id] = user.sub.split('|')
        const shortenedProvider = provider.split('-').map(word => word[0]).join('')
        const shortenedId = id.slice(-20)

        const shortenedUsecase = usecase.split('-').map(word => word[0]).join('')

        const fullName = `${shortenedProvider}-${shortenedId}||${shortenedUsecase}`
        return fullName.slice(-30)
    }

    async createInstance(token: string, user: User, usecase: string, vectorOptimized: boolean, graphAnalyticsPlugin: boolean): Promise<Instance> {
        const name = this.getInstanceName(user, usecase)
        console.log('createInstance', { name })

        const payload = {
            // name: usecase,
            type: 'free-db',
            cloud_provider: 'gcp',
            region: 'europe-west1',
            version: '5',
            memory: '1GB',
            tenant_id: AURA_TENANT_ID,
            name,
            // TODO: enable this when supported
            // vector_optimized: vectorOptimized,
            // graph_analytics_plugin: graphAnalyticsPlugin,
        };

        try {
            const response = await this.api.post('', payload);
            const auraInstance = response.data.data;
            return this.mapAuraInstanceToInstance(auraInstance);
        }
        catch (e: any) {
            console.log(e.response.data)
            console.error('Error creating Aura instance:', e);
            throw e;
        }
    }

    async getOrCreateInstanceForUseCase(token: string, user: User, usecase: string, vectorOptimized: boolean, graphAnalyticsPlugin: boolean): Promise<Instance> {
        let instance = await this.getInstanceForUseCase(token, user, usecase);

        if (!instance) {
            instance = await this.createInstance(token, user, usecase, vectorOptimized, graphAnalyticsPlugin);
        }

        return instance;
    }
} 