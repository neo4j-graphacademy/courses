import { InstanceProvider } from "../../instance-provider.interface";
import { Instance } from "../../../../domain/model/instance";
import { User } from "../../../../domain/model/user";
import axios, { AxiosInstance } from 'axios';
import { AURA_API_URL, AURA_CLIENT_ID, AURA_CLIENT_SECRET, AURA_TENANT_ID } from "../../../../constants";
import { read, write } from "../../../../modules/neo4j";
import { notifyPossibleRequestError } from "../../../../middleware/bugsnag.middleware";

export class AuraInstanceProvider implements InstanceProvider {
    private api: AxiosInstance;
    private token: string | undefined;

    constructor() {
        this.api = axios.create({
            baseURL: AURA_API_URL,
        });
    }

    /**
     * Generates a new token for the Aura API
     *
     * @returns {string}
     */
    static async generateToken(): Promise<string> {
        const response = await axios.post('https://api.neo4j.io/oauth/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${AURA_CLIENT_ID}:${AURA_CLIENT_SECRET}`).toString('base64')}`
                }
            }
        );

        return response.data.access_token as string;

    }

    /**
     * Maps the data returned by the Aura API to an Instance object
     *
     * @param auraInstance - The Aura instance to map
     * @returns {Instance}
     */
    private mapAuraInstanceToInstance(auraInstance: any): Instance {
        const [userId, usecase] = auraInstance.name.split('||')

        return {
            id: auraInstance.id,
            hashKey: auraInstance.name,
            usecase,
            scheme: 'neo4j+s',
            ip: `${auraInstance.id}.databases.neo4j.io`,
            host: `${auraInstance.id}.databases.neo4j.io`,
            boltPort: '7687',
            username: auraInstance.username || auraInstance.id,
            password: auraInstance.password,
            expires: 0,
            status: auraInstance.status,
            vectorOptimized: auraInstance.vector_optimized,
            graphAnalyticsPlugin: auraInstance.graph_analytics_plugin,
        };
    }

    /**
     * Checks the database for an instance of the given user and usecase
     *
     * @param user - The user to check for
     * @param usecase - The usecase to check for
     * @returns {Instance | undefined}
     */
    private async checkDatabaseForInstance(user: User, usecase: string): Promise<Instance | undefined> {
        const params = {
            sub: user.sub,
            usecase
        };

        try {
            const result = await read<{ instance: Instance }>(`
                MATCH (u:User {sub: $sub})-[:HAS_INSTANCE]->(i:Instance {usecase: $usecase})
                RETURN i { .* } AS instance
            `, params);
            if (result.records.length > 0) {
                const instance = result.records[0].get('instance');

                try {
                    // Get updated instance status
                    const { instance: updatedInstance, status } = await this.getInstanceById('', user, instance.id);

                    // If instance exists, try to resume it
                    if (status === 'PAUSED') {
                        await this.resumeInstance(instance.id);
                    }

                    return instance;
                } catch (e: any) {
                    // if 409, the instance is already running
                    if (e.response?.status === 409 || e.response?.status === 403) {
                        return instance;
                    }

                    // If we get a 404, the instance no longer exists in Aura
                    if (e.response?.status === 404) {
                        await this.cleanupInstanceFromDatabase(instance.id);
                        return undefined;
                    }

                    notifyPossibleRequestError(e, user)

                    throw e;
                }
            }
        } catch (e) {
            notifyPossibleRequestError(e, user)
        }

        return undefined;
    }

    /**
     * Removes a stale instance from the database
     *
     * @param instanceId - The ID of the instance to cleanup
     */
    private async cleanupInstanceFromDatabase(instanceId: string): Promise<void> {
        const query = `
            MATCH (s:Instance {id: $instanceId})
            DETACH DELETE s
        `;

        try {
            await write(query, { instanceId });
        } catch (e) {
            notifyPossibleRequestError(e, undefined)
        }
    }

    /**
     * Debug method to check the current token state
     */
    public getTokenDebugInfo(): { hasToken: boolean; tokenLength: number } {
        return {
            hasToken: !!this.token,
            tokenLength: this.token ? this.token.length : 0
        };
    }

    /**
     * Refreshes the token and updates the API instance authorization header
     */
    private async refreshToken(): Promise<void> {
        this.token = await AuraInstanceProvider.generateToken();
    }


    /**
     * Gets an instance for a given usecase
     *
     * @param token - The token to use for the API call
     * @param user - The user to get the instance for
     * @param usecase - The usecase to get the instance for
     * @returns {Instance | undefined}
     */
    async getInstanceForUseCase(token: string, user: User, usecase: string): Promise<Instance | undefined> {
        // First check the database
        const dbInstance = await this.checkDatabaseForInstance(user, usecase);
        if (dbInstance) {
            // Check aura API to see if instance is running
            const { instance, status } = await this.getInstanceById(token, user, dbInstance.id);

            // if running, return the instance
            if (status === 'RUNNING' || status === 'CREATING') {
                return {
                    ...dbInstance,
                    status,
                    usecase,
                };
            }

            // if aura instance is not running, delete from database
            if (status === 'NOT_FOUND') {
                await this.cleanupInstanceFromDatabase(dbInstance.id);
            }

            // create a new instance and save it to the database
            const newInstance = await this.createInstance(token, user, usecase, false, false);

            return newInstance;
        }

        return undefined;
    }

    /**
     * Gets an instance by ID
     *
     * @param token - The token to use for the API call
     * @param user - The user to get the instance for
     * @param hash - The hash of the instance to get
     * @returns {Instance | undefined}
     */
    async getInstanceById(token: string, user: User, hash: string): Promise<{ instance: Instance | undefined; status: string }> {
        try {
            const response = await this.get(`/instances/${hash}`);
            const auraInstance = response.data.data;

            return {
                instance: this.mapAuraInstanceToInstance(auraInstance),
                status: auraInstance.status.toUpperCase()
            };
        }
        catch (e: any) {
            return {
                instance: undefined,
                status: 'NOT_FOUND'
            }
        }
    }

    /**
     * Gets all instances
     *
     * @param token - The token to use for the API call
     * @param user - The user to get the instances for
     * @returns {Instance[]}
     */
    async getInstances(token: string, user: User): Promise<Instance[]> {
        try {
            const response = await this.get('/instances');
            const instances = response.data.data || [];

            return instances
                // .filter(instance => instance.name.startsWith(user.sub))
                .map((instance: any) => this.mapAuraInstanceToInstance(instance));
        }
        catch (e: any) {
            notifyPossibleRequestError(e, user)
            return [];
        }
    }

    /**
     * Stops an instance
     *
     * @param token - The token to use for the API call
     * @param user - The user to stop the instance for
     * @param id - The ID of the instance to stop
     */
    async stopInstance(token: string, user: User, id: string): Promise<void> {
        try {
            await this.delete(`/instances/${id}`);
        }
        catch (e: any) {
            if (e.response?.status === 404 || e.response?.status === 403) {
                return;
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
        const [providerName = 'unknownprovider', id = 'unknownid'] = user.sub.split('|');

        const provider = providerName.split('-').map(word => word.slice(0, 1)).join('-') // 2 chars
        const sanitizedUsecase = usecase.split('-').map(word => word.slice(0, 1)).join('-') // 5 chars

        return `${provider}-${id}|${sanitizedUsecase}`;
    }

    /**
     * Makes a POST request to the Aura API
     *
     * @param endpoint - The endpoint to make the request to
     * @param payload - The payload to send with the request
     * @returns {Promise<AxiosResponse>}
     */
    private async post(endpoint: string, payload: Record<string, any>) {
        if (!this.token) {
            await this.refreshToken();
        }

        try {
            const res = await this.api.post(endpoint, payload, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            })

            return res
        } catch (e: any) {
            if (e.response?.status === 401 || e.response?.status === 403) {
                await this.refreshToken();
                return this.post(endpoint, payload);
            }

            throw e;
        }
    }

    private async get(endpoint: string) {
        if (!this.token) {
            await this.refreshToken();
        }

        try {
            const res = await this.api.get(endpoint, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            })

            return res
        } catch (e: any) {
            if (e.response?.status === 401 || e.response?.status === 403) {
                await this.refreshToken();
                return this.get(endpoint);
            }

            throw e;
        }
    }

    private async delete(endpoint: string) {
        if (!this.token) {
            await this.refreshToken();
        }
        try {
            const res = await this.api.delete(endpoint, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            })

            return res
        } catch (e: any) {
            if (e.response?.status === 401 || e.response?.status === 403) {
                await this.refreshToken();
                return this.delete(endpoint);
            }

            throw e;
        }
    }

    /**
     * Creates a new instance and saves a reference to it in the database
     *
     * @param token - The token to use for the API call
     * @param user - The user to create the instance for
     * @param usecase - The usecase to create the instance for
     * @returns {Instance}
     */
    async createInstance(token: string, user: User, usecase: string, vectorOptimized: boolean, graphAnalyticsPlugin: boolean): Promise<Instance> {
        const name = this.getInstanceName(user, usecase)

        const payload = {
            name,
            type: 'free-db',
            cloud_provider: 'gcp',
            region: 'europe-west1',
            version: '5',
            memory: '1GB',
            tenant_id: AURA_TENANT_ID,
            // TODO: enable this when supported
            // vector_optimized: vectorOptimized,
            // graph_analytics_plugin: graphAnalyticsPlugin,
        };

        const response = await this.post('/instances', payload)

        const auraInstance = response.data.data;

        const instance = this.mapAuraInstanceToInstance(auraInstance);

        const res = await write<{ id: string }>(`
                MATCH (u:User {sub: $sub})
                CREATE (i:Instance {id: $instanceId})
                SET i += $instance,
                    i.createdAt = datetime(),
                    i.usecase = $usecase
                CREATE (u)-[:HAS_INSTANCE]->(i)
                RETURN elementId(i) as id
            `, {
            sub: user.sub,
            usecase,
            instanceId: instance.id,
            instance
        })

        return {
            ...instance,
            usecase,
        }

    }

    /**
     * Gets an instance for a given usecase or creates a new one if it doesn't exist
     *
     * @param token - The token to use for the API call
     * @param user - The user to get or create the instance for
     * @param usecase - The usecase to get or create the instance for
     * @returns {Instance}
     */
    async getOrCreateInstanceForUseCase(token: string, user: User, usecase: string, vectorOptimized: boolean, graphAnalyticsPlugin: boolean): Promise<Instance> {
        let instance = await this.getInstanceForUseCase(token, user, usecase);

        if (!instance) {
            instance = await this.createInstance(token, user, usecase, vectorOptimized, graphAnalyticsPlugin);
        }

        return instance;
    }

    /**
     * Resumes an instance
     *
     * @param instanceId - The ID of the instance to resume
     */
    private async resumeInstance(instanceId: string): Promise<void> {
        await this.post(`/instances/${instanceId}/resume`, {});
    }
}
