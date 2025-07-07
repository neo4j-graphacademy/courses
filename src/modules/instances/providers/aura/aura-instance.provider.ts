import { InstanceProvider } from "../../instance-provider.interface";
import { Instance } from "../../../../domain/model/instance";
import { User } from "../../../../domain/model/user";
import { AURA_API_URL, AURA_CLIENT_ID, AURA_CLIENT_SECRET, AURA_TENANT_ID } from "../../../../constants";
import { createDriver, read, write } from "../../../../modules/neo4j";
import { notifyPossibleRequestError } from "../../../../middleware/bugsnag.middleware";
import { EagerResult, RoutingControl } from "neo4j-driver";

/**
 * Custom error class for Aura API errors
 */
export class AuraAPIError extends Error {
    public readonly status: number;
    public readonly statusText: string;
    public readonly response?: any;

    constructor(message: string, status: number, statusText: string, response?: any) {
        super(message);
        this.name = 'AuraAPIError';
        this.status = status;
        this.statusText = statusText;
        this.response = response;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AuraAPIError);
        }
    }
}

// Helper function to handle fetch responses
async function handleFetchResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let responseBody: any;
        try {
            // Try to parse the response body for additional error details
            responseBody = await response.json();
        } catch {
            // If parsing fails, use response text or fallback to status text
            try {
                responseBody = await response.text();
            } catch {
                responseBody = response.statusText;
            }
        }

        const message = `HTTP ${response.status} ${response.statusText}`;
        throw new AuraAPIError(message, response.status, response.statusText, responseBody);
    }
    
    return await response.json();
}

export class AuraInstanceProvider implements InstanceProvider {
    private token: string | undefined;


    /**
     * Generates a new token for the Aura API
     *
     * @returns {string}
     */
    static async generateToken(): Promise<string> {
        const response = await fetch('https://api.neo4j.io/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${AURA_CLIENT_ID}:${AURA_CLIENT_SECRET}`).toString('base64')}`
            },
            body: 'grant_type=client_credentials'
        })

        const data = await handleFetchResponse<{ access_token: string }>(response)
        return data.access_token
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
            database: auraInstance.database,
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
            if (status === 'running' || status === 'creating') {
                return {
                    ...dbInstance,
                    status,
                    usecase,
                };
            }

            // if aura instance is not running, delete from database
            if (status === 'not_found') {
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
     * @returns {Promise<{ instance: Instance | undefined; status: string }>}
     */
    async getInstanceById(token: string, user: User, hash: string): Promise<{ instance: Instance | undefined; status: string }> {
        try {
            const response = await this.get(`/instances/${hash}`);
            const auraInstance = response.data;

            return {
                instance: this.mapAuraInstanceToInstance(auraInstance),
                status: auraInstance.status || 'UNKNOWN'
            };
        } catch (e: any) {
            if (e.response?.status === 404) {
                return {
                    instance: undefined,
                    status: 'NOT_FOUND'
                };
            }

            notifyPossibleRequestError(e, user);
            throw e;
        }
    }

    async getInstances(token: string, user: User): Promise<Instance[]> {
        try {
            const response = await this.get('/instances');
            
            // Handle different possible response formats
            let instances = response.data;
            
            // If the response has a nested data property (common API pattern)
            if (instances && typeof instances === 'object' && instances.data) {
                instances = instances.data;
            }
    
            return instances
                .filter((instance: any) => instance.name && instance.name.includes(user.sub))
                .map((instance: any) => this.mapAuraInstanceToInstance(instance));
        } catch (e: any) {
            notifyPossibleRequestError(e, user);
            throw e;
        }
    }

    async stopInstance(token: string, user: User, id: string): Promise<void> {
        try {
            await this.delete(`/instances/${id}`);
        } catch (e: any) {
            notifyPossibleRequestError(e, user);
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

        return `${provider}|${id}||${sanitizedUsecase}`;
    }
    /**
     * Makes a POST request to the Aura API with automatic token refresh on auth errors
     *
     * @param endpoint - The endpoint to make the request to
     * @param payload - The payload to send
     * @returns {Promise<any>}
     */
    private async post(endpoint: string, payload: Record<string, any>): Promise<{ data: any }> {
        return this.makeAuthenticatedRequest('POST', endpoint, payload);
    }

    /**
     * Makes a GET request to the Aura API with automatic token refresh on auth errors
     *
     * @param endpoint - The endpoint to make the request to
     * @returns {Promise<any>}
     */
    private async get(endpoint: string): Promise<{ data: any }> {
        return this.makeAuthenticatedRequest('GET', endpoint);
    }

    /**
     * Makes a DELETE request to the Aura API with automatic token refresh on auth errors
     *
     * @param endpoint - The endpoint to make the request to
     * @returns {Promise<any>}
     */
    private async delete(endpoint: string): Promise<{ data: any }> {
        return this.makeAuthenticatedRequest('DELETE', endpoint);
    }

    /**
     * Makes an authenticated HTTP request to the Aura API with automatic token refresh on auth errors
     * This method handles 401/403 responses by refreshing the token and retrying once
     *
     * @param method - The HTTP method
     * @param endpoint - The endpoint to make the request to
     * @param payload - The payload to send (for POST requests)
     * @returns {Promise<any>}
     */
    private async makeAuthenticatedRequest(method: 'GET' | 'POST' | 'DELETE', endpoint: string, payload?: Record<string, any>): Promise<{ data: any }> {
        // Ensure we have a token before making the request
        if (!this.token) {
            await this.refreshToken();
        }

        try {
            // Make the initial request
            const response = await this.executeRequest(method, endpoint, payload);
            return response;
        } catch (error: any) {
            // Check if it's an AuraAPIError with authentication error status (401 or 403)
            if (error instanceof AuraAPIError && (error.status === 401 || error.status === 403)) {
                // Refresh the token
                await this.refreshToken();
                
                try {
                    // Retry the request with the new token
                    const retryResponse = await this.executeRequest(method, endpoint, payload);
                    return { data: retryResponse };
                } catch (retryError: any) {
                    if (retryError instanceof AuraAPIError) {
                    }
                    throw retryError;
                }
            }
            
            // Re-throw all other errors (including non-authentication AuraAPIErrors)
            throw error;
        }
    }

    /**
     * Executes an HTTP request to the Aura API
     *
     * @param method - The HTTP method
     * @param endpoint - The endpoint to make the request to
     * @param payload - The payload to send (for POST requests)
     * @returns {Promise<any>}
     */
    private async executeRequest(method: 'GET' | 'POST' | 'DELETE', endpoint: string, payload?: Record<string, any>): Promise<any> {
        const requestOptions: RequestInit = {
            method,
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        };

        // Add content-type and body for POST requests
        if (method === 'POST' && payload) {
            requestOptions.headers = {
                ...requestOptions.headers,
                'Content-Type': 'application/json'
            };
            requestOptions.body = JSON.stringify(payload);
        }
        
        const response = await fetch(`${AURA_API_URL}${endpoint}`, requestOptions);

        // Use our existing error handler which will throw errors with response info
        return await handleFetchResponse(response);
    }

    async createInstance(token: string, user: User, usecase: string, vectorOptimized: boolean, graphAnalyticsPlugin: boolean): Promise<Instance> {
        const instanceName = this.getInstanceName(user, usecase);

        const payload = {
            version: "5",
            region: "europe-west1",
            memory: "1GB",
            name: instanceName,
            type: "free-db",
            tenant_id: AURA_TENANT_ID,
            cloud_provider: "gcp"
        };

        try {
            const response = await this.post('/instances', payload);
            const auraInstance = response.data;

            const instance = this.mapAuraInstanceToInstance(auraInstance);

            // Save the instance to the database
            await write(`
                MATCH (u:User {sub: $sub})
                MERGE (u)-[:HAS_INSTANCE]->(i:Instance {id: $id})
                SET i += $instance, i.usecase = $usecase
            `, {
                sub: user.sub,
                id: instance.id,
                instance,
                usecase,
            });

            return instance;
        } catch (e: any) {
            notifyPossibleRequestError(e, user);
            throw e;
        }
    }

    async getOrCreateInstanceForUseCase(token: string, user: User, usecase: string, vectorOptimized: boolean, graphAnalyticsPlugin: boolean): Promise<Instance> {
        const existing = await this.getInstanceForUseCase(token, user, usecase);

        if (existing) {
            return existing;
        }

        return await this.createInstance(token, user, usecase, vectorOptimized, graphAnalyticsPlugin);
    }

    private async resumeInstance(instanceId: string): Promise<void> {
        await this.post(`/instances/${instanceId}/resume`, {});
    }

    async executeCypher<T extends Record<string, any> = Record<string, any>>(token: string, user: User, usecase: string, cypher: string, params: Record<string, any> = {}, routing: RoutingControl): Promise<EagerResult<T> | undefined> {
        try {
            const instance = await this.getInstanceForUseCase(token, user, usecase)

            if (instance !== undefined) {
                // Connect to instance
                const driver = await createDriver(
                    `bolt://${instance.ip}:${instance.boltPort}`,
                    instance.username,
                    instance.password,
                    true
                )

                let result: EagerResult<T> | undefined;

                const parts = cypher.split(';\n')
                    .filter(e => e.trim() !== '')

                for (const part of parts) {
                    result = await driver.executeQuery<EagerResult<T>>(part, params, {
                        database: instance.database || 'neo4j',
                        routing,
                    })
                }

                await driver.close()

                return result;
            }

            throw new Error(`Could not connect to aura instance for usecase: ${usecase}`)
        }
        catch (e) {
            notifyPossibleRequestError(e, user);
            throw e;
        }
    }
}