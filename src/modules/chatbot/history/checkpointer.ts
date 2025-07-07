import { BaseCheckpointSaver, Checkpoint, CheckpointTuple, CheckpointListOptions } from "@langchain/langgraph-checkpoint";
import { RunnableConfig } from "@langchain/core/runnables";
import type { CheckpointMetadata, PendingWrite } from "@langchain/langgraph-checkpoint";
import { int, type Driver } from "neo4j-driver";
import { BaseMessage } from "@langchain/core/messages";
import { START } from "@langchain/langgraph";

// Define ChannelVersions type locally since it's just a type alias
type ChannelVersions = Record<string, number | string>;

export interface Neo4jCheckpointSaverParams {
    driver: Driver;
    database?: string;
}



/**
 * A LangGraph checkpoint saver backed by a Neo4j database.
 * 
 * This implementation uses the data model:
 * (:Conversation {id: $thread_id})-[:HAS_CHECKPOINT]->(:Checkpoint)
 * 
 * The checkpoint nodes can represent any type of LangChain message.
 */
export class Neo4jCheckpointSaver extends BaseCheckpointSaver {
    public readonly driver: Driver;
    public readonly database: string | undefined;

    constructor(
        { driver, database }: Neo4jCheckpointSaverParams,
        serde?: any
    ) {
        super(serde);
        this.driver = driver;
        this.database = database;
    }

    /**
     * Retrieves a checkpoint from the Neo4j database based on the
     * provided config. If the config contains a "checkpoint_id" key, the checkpoint with
     * the matching thread ID and checkpoint ID is retrieved. Otherwise, the latest checkpoint
     * for the given thread ID is retrieved.
     */
    async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
        const {
            thread_id,
            checkpoint_ns = "",
            checkpoint_id,
        } = config.configurable ?? {};

        if (!thread_id) {
            throw new Error("thread_id is required in config.configurable");
        }

        let query: string;
        let params: Record<string, any>;

        if (checkpoint_id) {
            // Get specific checkpoint by ID
            query = `
                MATCH (c:Conversation {id: $thread_id})-[:HAS_CHECKPOINT]->(checkpoint:Checkpoint {checkpoint_id: $checkpoint_id, checkpoint_ns: $checkpoint_ns})
                OPTIONAL MATCH (checkpoint)-[:PARENT_CHECKPOINT]->(parent:Checkpoint)
                OPTIONAL MATCH (checkpoint)-[:HAS_WRITE]->(write:CheckpointWrite)
                RETURN checkpoint, parent, collect(write) as writes
            `;
            params = { thread_id, checkpoint_id, checkpoint_ns };
        } else {
            // Get latest checkpoint
            query = `
                MATCH (c:Conversation {id: $thread_id})-[:HAS_CHECKPOINT]->(checkpoint:Checkpoint {checkpoint_ns: $checkpoint_ns})
                OPTIONAL MATCH (checkpoint)-[:PARENT_CHECKPOINT]->(parent:Checkpoint)
                OPTIONAL MATCH (checkpoint)-[:HAS_WRITE]->(write:CheckpointWrite)
                WITH checkpoint, parent, collect(write) as writes
                ORDER BY checkpoint.created_at DESC
                LIMIT 1
                RETURN checkpoint, parent, writes
            `;
            params = { thread_id, checkpoint_ns };
        }

        const result = await this.driver.executeQuery(query, params, { database: this.database });

        if (result.records.length === 0) {
            return undefined;
        }

        const record = result.records[0];
        if (!record) {
            return undefined;
        }

        const checkpointNode = record.get("checkpoint");
        const parentNode = record.get("parent");
        const writeNodes = record.get("writes") || [];

        if (!checkpointNode) {
            return undefined;
        }

        const checkpoint = await this.serde.loadsTyped(
            checkpointNode.properties.type,
            new Uint8Array(Buffer.from(checkpointNode.properties.checkpoint, 'base64'))
        ) as Checkpoint;

        const pendingWrites: Array<[string, string, any]> = await Promise.all(
            writeNodes.map(async (writeNode: any) => [
                writeNode.properties.task_id,
                writeNode.properties.channel,
                await this.serde.loadsTyped(
                    writeNode.properties.type,
                    new Uint8Array(Buffer.from(writeNode.properties.value, 'base64'))
                ),
            ])
        );

        const metadata = await this.serde.loadsTyped(
            checkpointNode.properties.metadata_type,
            new Uint8Array(Buffer.from(checkpointNode.properties.metadata, 'base64'))
        ) as CheckpointMetadata;

        const configurableValues = {
            thread_id,
            checkpoint_ns,
            checkpoint_id: checkpointNode.properties.checkpoint_id,
        };

        const tuple: CheckpointTuple = {
            config: { configurable: configurableValues },
            checkpoint,
            pendingWrites,
            metadata,
        };

        if (parentNode) {
            tuple.parentConfig = {
                configurable: {
                    thread_id,
                    checkpoint_ns,
                    checkpoint_id: parentNode.properties.checkpoint_id,
                },
            };
        }

        return tuple;
    }

    /**
     * Retrieve a list of checkpoint tuples from the Neo4j database based
     * on the provided config. The checkpoints are ordered by checkpoint ID
     * in descending order (newest first).
     */
    async *list(
        config: RunnableConfig,
        options?: CheckpointListOptions
    ): AsyncGenerator<CheckpointTuple> {
        const { thread_id, checkpoint_ns = "" } = config.configurable ?? {};

        if (!thread_id) {
            throw new Error("thread_id is required in config.configurable");
        }

        let query = `
            MATCH (c:Conversation {id: $thread_id})-[:HAS_CHECKPOINT]->(checkpoint:Checkpoint {checkpoint_ns: $checkpoint_ns})
            OPTIONAL MATCH (checkpoint)-[:PARENT_CHECKPOINT]->(parent:Checkpoint)
            OPTIONAL MATCH (checkpoint)-[:HAS_WRITE]->(write:CheckpointWrite)
            WITH checkpoint, parent, collect(write) as writes
            ORDER BY checkpoint.created_at DESC
            `;

        const params: Record<string, any> = { thread_id, checkpoint_ns };

        if (options?.limit) {
            query += ` LIMIT $limit`;
            params['limit'] = int(options.limit);
        }

        query += ` RETURN checkpoint, parent, writes`;

        const result = await this.driver.executeQuery(query, params, { database: this.database });

        for (const record of result.records) {
            const checkpointNode = record.get("checkpoint");
            const parentNode = record.get("parent");
            const writeNodes = record.get("writes") || [];

            if (!checkpointNode) {
                continue;
            }

            // Apply before filter if specified
            if (options?.before) {
                const beforeCheckpointId = options.before.configurable?.['checkpoint_id'];
                if (beforeCheckpointId && checkpointNode.properties.checkpoint_id >= beforeCheckpointId) {
                    continue;
                }
            }

            const checkpoint = await this.serde.loadsTyped(
                checkpointNode.properties.type,
                new Uint8Array(Buffer.from(checkpointNode.properties.checkpoint, 'base64'))
            ) as Checkpoint;

            const pendingWrites: Array<[string, string, any]> = await Promise.all(
                writeNodes.map(async (writeNode: any) => [
                    writeNode.properties.task_id,
                    writeNode.properties.channel,
                    await this.serde.loadsTyped(
                        writeNode.properties.type,
                        new Uint8Array(Buffer.from(writeNode.properties.value, 'base64'))
                    ),
                ])
            );

            const metadata = await this.serde.loadsTyped(
                checkpointNode.properties.metadata_type,
                new Uint8Array(Buffer.from(checkpointNode.properties.metadata, 'base64'))
            ) as CheckpointMetadata;

            const configurableValues = {
                thread_id,
                checkpoint_ns,
                checkpoint_id: checkpointNode.properties.checkpoint_id,
            };

            const yieldTuple: CheckpointTuple = {
                config: { configurable: configurableValues },
                checkpoint,
                pendingWrites,
                metadata,
            };

            if (parentNode) {
                yieldTuple.parentConfig = {
                    configurable: {
                        thread_id,
                        checkpoint_ns,
                        checkpoint_id: parentNode.properties.checkpoint_id,
                    },
                };
            }

            yield yieldTuple;
        }
    }

    /**
     * Saves a checkpoint to the Neo4j database. The checkpoint is associated
     * with the provided config and its parent config (if any).
     */
    async put(
        config: RunnableConfig,
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        newVersions: ChannelVersions
    ): Promise<RunnableConfig> {
        const thread_id = config.configurable?.['thread_id'];
        const checkpoint_ns = config.configurable?.['checkpoint_ns'] ?? "";
        const checkpoint_id = checkpoint.id;
        const parent_checkpoint_id = config.configurable?.['checkpoint_id'] ?? null;
        const user_id = config.configurable?.user?.sub ?? null;

        if (thread_id === undefined) {
            throw new Error(
                `The provided config must contain a configurable field with a "thread_id" field.`
            );
        }

        const [checkpointType, serializedCheckpoint] = this.serde.dumpsTyped(checkpoint);
        const [metadataType, serializedMetadata] = this.serde.dumpsTyped(metadata);

        if (checkpointType !== metadataType) {
            throw new Error("Mismatched checkpoint and metadata types.");
        }

        const query = `
            MERGE (c:Conversation {id: $thread_id})
            CREATE (checkpoint:Checkpoint {
                checkpoint_id: $checkpoint_id,
                checkpoint_ns: $checkpoint_ns,
                type: $type,
                checkpoint: $checkpoint,
                metadata_type: $metadata_type,
                metadata: $metadata,
                created_at: datetime()
            })
            CREATE (c)-[:HAS_CHECKPOINT]->(checkpoint)
            
            WITH checkpoint, c
            OPTIONAL MATCH (c)-[:HAS_CHECKPOINT]->(parent:Checkpoint {checkpoint_id: $parent_checkpoint_id})
            WHERE $parent_checkpoint_id IS NOT NULL
            FOREACH (_ IN CASE WHEN parent IS NOT NULL THEN [1] ELSE [] END |
                CREATE (checkpoint)-[:PARENT_CHECKPOINT]->(parent)
            )
            
            // Create User relationship if user_id is provided
            WITH checkpoint, c
            FOREACH (_ IN CASE WHEN $user_id IS NOT NULL THEN [1] ELSE [] END |
                MERGE (u:User {sub: $user_id})
                MERGE (u)-[:HAS_CONVERSATION]->(c)
            )
            
            RETURN checkpoint
            `;

        await this.driver.executeQuery(query, {
            thread_id,
            checkpoint_id,
            checkpoint_ns,
            type: checkpointType,
            checkpoint: Buffer.from(serializedCheckpoint).toString('base64'),
            metadata_type: metadataType,
            metadata: Buffer.from(serializedMetadata).toString('base64'),
            parent_checkpoint_id,
            user_id,
        }, { database: this.database });

        // Save messages from metadata.writes[START] if they exist
        if (metadata.writes && metadata.writes[START]) {
            // Convert to PendingWrite format for putWrites
            const startWrites = metadata.writes[START];

            if (startWrites && typeof startWrites === 'object' && 'messages' in startWrites) {
                // Filter out SystemMessage types
                const messages = (startWrites as any).messages;
                const filteredMessages = Array.isArray(messages) 
                    ? messages.filter((msg: any) => msg.getType && msg.getType() !== 'system')
                    : messages;
                
                if (filteredMessages.length > 0) {
                    const pendingWrites: PendingWrite[] = [['messages', filteredMessages]];
                    const updatedConfig = {
                        configurable: {
                            thread_id,
                            checkpoint_ns,
                            checkpoint_id,
                        },
                    };
                    await this.putWrites(updatedConfig, pendingWrites, START);
                }
            }
        }

        return {
            configurable: {
                thread_id,
                checkpoint_ns,
                checkpoint_id,
            },
        };
    }

    /**
     * Saves intermediate writes associated with a checkpoint to the Neo4j database.
     * Enhanced to create separate CheckpointMessage nodes for each message with HAS_MESSAGE relationships.
     * For AI messages with tool calls, creates Tool nodes and CALLS_TOOL relationships.
     */
    async putWrites(
        config: RunnableConfig,
        writes: PendingWrite[],
        taskId: string
    ): Promise<void> {
        const { thread_id, checkpoint_ns = "", checkpoint_id } = config.configurable ?? {};

        if (!thread_id || !checkpoint_id) {
            throw new Error("thread_id and checkpoint_id are required in config.configurable");
        }

        const writeData = await Promise.all(
            writes.map(async ([channel, value]) => {
                const [type, serializedValue] = this.serde.dumpsTyped(value);

                // Extract messages if the value is an array of messages
                let messages: any[] = [];

                if (Array.isArray(value)) {
                    messages = value.filter((item): item is BaseMessage =>
                        item instanceof BaseMessage
                    ).map(message => {
                        const messageData: any = {
                            type: message.getType(),
                            content: (message as any).content || null,
                            id: (message as any).id || null,
                            name: (message as any).name || null,
                            tool_call_id: (message as any).tool_call_id || null,
                            tool_calls: [],
                        };

                        // Extract tool calls for AI messages
                        if (message.getType() === 'ai' && (message as any).tool_calls) {
                            messageData.tool_calls = (message as any).tool_calls.map((toolCall: any) => ({
                                id: toolCall.id || null,
                                name: toolCall.function?.name || toolCall.name || null,
                                arguments: JSON.stringify(toolCall.function?.arguments || toolCall.args || {}),
                            }));
                        }

                        return messageData;
                    });
                } else if (value instanceof BaseMessage) {
                    const messageData: any = {
                        type: value.getType(),
                        content: (value as any).content || null,
                        id: (value as any).id || null,
                        name: (value as any).name || null,
                        tool_call_id: (value as any).tool_call_id || null,
                        tool_calls: [],
                    };

                    // Extract tool calls for AI messages
                    if (value.getType() === 'ai' && (value as any).tool_calls) {
                        messageData.tool_calls = (value as any).tool_calls.map((toolCall: any) => ({
                            id: toolCall.id || null,
                            name: toolCall.function?.name || toolCall.name || null,
                            arguments: JSON.stringify(toolCall.function?.arguments || toolCall.args || {}),
                        }));
                    }

                    messages = [messageData];
                }

                return {
                    task_id: taskId,
                    channel,
                    type,
                    value: Buffer.from(serializedValue).toString('base64'),
                    messages,
                };
            })
        );
        
        if (writeData.length === 0) {
            return;
        }

        const query = `
        MATCH (c:Conversation {id: $thread_id})-[:HAS_CHECKPOINT]->(checkpoint:Checkpoint {
            checkpoint_id: $checkpoint_id,
            checkpoint_ns: $checkpoint_ns
        })
        
        UNWIND $writes AS write
        MERGE (w:CheckpointWrite {task_id: write.task_id})
        ON CREATE SET w += {
            channel: write.channel,
            type: write.type,
            value: write.value,
            created_at: datetime()
        }
        MERGE (checkpoint)-[:HAS_WRITE]->(w)
        
        // Create CheckpointMessage nodes for each message
        WITH w, write, c
        UNWIND write.messages AS messageData
        MERGE (msg:CheckpointMessage {
            id: coalesce(messageData.id, messageData.tool_call_id, apoc.util.md5([$thread_id, messageData.type, messageData.content]))
        })
        ON CREATE SET msg += {
            type: messageData.type,
            content: messageData.content,
            name: messageData.name,
            tool_call_id: messageData.tool_call_id,
            created_at: datetime()
        }
        MERGE (w)-[:HAS_MESSAGE]->(msg)
        MERGE (c)-[:HAS_MESSAGE]->(msg)

        // Maintain LAST_MESSAGE relationship
        FOREACH (r IN [ (c)-[r:LAST_MESSAGE]->() | r ] | DELETE r)
        MERGE (c)-[:LAST_MESSAGE]->(msg)

        // Maintain NEXT_MESSAGE relationships
        WITH c, msg, messageData
        CALL (c) {
            MATCH (c)-[:HAS_MESSAGE]->(msg)
            WITH c, msg ORDER BY msg.created_at ASC
            FOREACH (r IN [ (msg)-[r:NEXT_MESSAGE]->() | r ] | DELETE r)

            WITH c, collect(msg) AS messages
            CALL apoc.nodes.link(messages, 'NEXT_MESSAGE')
            RETURN count(*) AS num_links
        }
        
        // Add message type labels for better querying
        WITH msg, messageData
        FOREACH (_ IN CASE WHEN messageData.type = 'human' THEN [1] ELSE [] END | 
            SET msg:HumanMessage
        )
        FOREACH (_ IN CASE WHEN messageData.type = 'ai' THEN [1] ELSE [] END | 
            SET msg:AIMessage
        )
        FOREACH (_ IN CASE WHEN messageData.type = 'tool' THEN [1] ELSE [] END | 
            SET msg:ToolMessage

            MERGE (t:Tool {id: messageData.name})
            MERGE (msg)-[:CALLED_TOOL]->(t)
        )
        FOREACH (_ IN CASE WHEN messageData.type = 'system' THEN [1] ELSE [] END | 
            SET msg:SystemMessage
        )
        FOREACH (_ IN CASE WHEN messageData.type = 'function' THEN [1] ELSE [] END | 
            SET msg:FunctionMessage
        )
        
        // Create Tool nodes and TOOL_CALL relationships for AI messages with tool calls
        FOREACH (toolCall IN messageData.tool_calls |
            MERGE (tool:Tool {id: toolCall.name})
            CREATE (msg)-[r:HAS_TOOL_CALL]->(tool)
            SET r.arguments = toolCall.arguments,
                r.tool_call_id = toolCall.id
        )
        `;

        await this.driver.executeQuery(query, {
            thread_id,
            checkpoint_id,
            checkpoint_ns,
            writes: writeData,
        }, { database: this.database });
    }
} 
