import { AxiosInstance } from "axios";
import { Driver, ManagedTransaction, int } from "neo4j-driver";
import { ChatCompletionRequestMessageRoleEnum, OpenAIApi } from 'openai'
import showdown from 'showdown'
import { notify } from "../../middleware/bugsnag.middleware";
import { User } from "../../domain/model/user";
import { CHATBOT_NEO4J_DATABASE, OPENAI_CHAT_MODEL } from "../../constants";
import { FeedbackPayload } from "../../domain/model/feedback";

interface Section {
    pageTitle: string;
    pageUrl: string;
    sectionTitle: string;
    sectionUrl: string;
    sectionText: string;
    score?: number;
    relevanceScore?: number;
}

interface ChatbotResponse {
    status: 'ok' | 'error';
    id?: string;
    message: string;
}

// interface RerankPayload {
//     model: string,
//     query: string,
//     documents: string[]
//     top_n: number,
// }

interface RerankResponse {
    id: string;
    results: {
        index: number;
        relevance_score: number;
    }[];
    meta: {
        api_version: {
            version: number;
        }
    }
}



export class Chatbot {

    constructor(
        private readonly driver: Driver,
        private readonly openai: OpenAIApi,
        private readonly co: AxiosInstance,
        private readonly showdown: showdown.Converter,
    ) {
    }

    private async getPageContent(tx: ManagedTransaction, page: string): Promise<Section[]> {
        const res = await tx.run(`
            MATCH (p:Page {url: $url})-[:HAS_SECTION]->(s)
            RETURN p.title AS pageTitle,
                p.url AS pageUrl,
                s.title AS sectionTitle,
                s.url AS sectionUrl,
                s.text AS sectionText
        `, { url: page });

        return res.records.map(record => record.toObject() as Section);
    }

    private async getSimilarSections(tx: ManagedTransaction, question: string): Promise<Section[]> {
        const chunks = await this.openai.createEmbedding({ input: question, model: 'text-embedding-ada-002' });

        const res = await tx.run(`
            // CALL db.index.vector.queryNodes('chunks', $limit, $embedding)
            // YIELD node, score

            MATCH (node:Chunk) WHERE node.embedding IS NOT NULL
            WITH node, gds.similarity.cosine(node.embedding, $embedding) AS score
            ORDER BY score DESC LIMIT $limit

            MATCH (node)<-[:HAS_SECTION]-(p)
            RETURN
                p.title AS pageTitle,
                p.url AS pageUrl,
                node.title AS sectionTitle,
                node.url AS sectionUrl,
                node.text AS sectionText,
                score
            ORDER BY score DESC
        `, { embedding: chunks.data.data[0]["embedding"], limit: int(10) });

        return res.records.map(record => record.toObject() as Section);
    }

    async getContentFromNeo4j(tx: ManagedTransaction, question: string, page?: string): Promise<Section[]> {
        const similarSections = await this.getSimilarSections(tx, question);

        if (page) {
            const pageContent = await this.getPageContent(tx, page);
            return similarSections.concat(pageContent);
        }

        return similarSections;
    }

    private async rerankResults(query: string, sections: Section[]): Promise<Section[]> {
        try {
            const response = await this.co.post<RerankResponse>('rerank', {
                model: 'rerank-english-2.0',
                query,
                documents: sections.map(section => section.sectionText),
                top_n: 3,
            })

            const { data } = response

            return data.results.map(({ index, relevance_score }) => {
                return {
                    ...sections[index],
                    relevanceScore: relevance_score
                }
            })
        }
        catch (e: any) {
            notify(e)

            return sections.slice(0, 3)
        }
    }

    async saveMessageToNeo4j(user: User, question: string, page: string | undefined, response: string, sections: Section[], reranked: Section[]): Promise<string | undefined> {
        // Save the response in Neo4j
        const writeSession = this.driver.session({ database: CHATBOT_NEO4J_DATABASE })
        const id = await writeSession.executeWrite(async tx => {
            const res = await tx.run<{ id: string }>(`
                MERGE (u:User {sub: $sub})
                CREATE (r:Response {
                    id: randomUuid(),
                    createdAt: timestamp(),
                    question: $question,
                    response: $response
                })
                CREATE (u)-[:RECEIVED_RESPONSE]->(r)

                FOREACH (_ IN CASE WHEN $page IS NOT NULL THEN [1] ELSE [] END |
                    MERGE (p:Page {url: $page})
                    MERGE (r)-[:FROM_PAGE]->(p)
                )

                FOREACH (section IN $sections |
                    MERGE (s:Section {url: section.sectionUrl})
                    MERGE (r)-[sr:SUGGESTED_SECTION]->(p)
                    SET sr.similarityScore = section.score = sr.relevanceScore = section.relevanceScore
                )

                FOREACH (section IN $sections |
                    MERGE (s:Section {url: section.sectionUrl})
                    MERGE (r)-[sr:RERANKED_SECTION]->(p)
                    SET sr.similarityScore = section.score = sr.relevanceScore = section.relevanceScore
                )

                RETURN r.id AS id
            `, { sub: user.sub, question, page, response, sections, reranked })

            const [first] = res.records

            if (first) {
                return first.get('id')
            }
        })
        await writeSession.close()

        return id
    }

    async askQuestion(user: User, question: string, page?: string): Promise<ChatbotResponse> {
        const session = this.driver.session({ database: CHATBOT_NEO4J_DATABASE });
        const results: Section[] = await session.executeRead(tx => this.getContentFromNeo4j(tx, question, page));
        await session.close();

        const reranked = await this.rerankResults(question, results);

        const messages = [
            {
                role: ChatCompletionRequestMessageRoleEnum.System,
                content: `
                You are a chatbot teaching users to how use Neo4j GraphAcademy.
                Attempt to answer the users question with the context provided.
                Respond in a short, but friendly way.
                Use your knowledge to fill in any gaps.
                If you cannot answer the question, ask for more clarification.

                Provide a code sample if possible.
                Also include any links to relevant documentation or lessons on GraphAcademy, excluding the current page where applicable.
                `
            },
            {
                role: ChatCompletionRequestMessageRoleEnum.System,
                content: `
                    Your Context:
                    ${JSON.stringify(reranked)}
                `
            },
            {
                role: ChatCompletionRequestMessageRoleEnum.User,
                content: `
                Answer the users question, wrapped in four dashes:

                ----
                ${question}
                ----`
            }
        ];

        const chatCompletion = await this.openai.createChatCompletion({ model: OPENAI_CHAT_MODEL, messages });

        const [choice] = chatCompletion.data.choices

        if (choice !== undefined && choice.message?.content !== undefined) {
            const content = choice.message.content

            // Save to Neo4j
            const id = await this.saveMessageToNeo4j(user, question, page, content, results, reranked)

            return {
                status: 'ok',
                id,
                message: this.showdown.makeHtml(content).replace('<a href=', '<a target="_blank" href='),
            }
        }

        return {
            status: 'error',
            message: 'No response from OpenAI'
        }
    }

    async recordFeedback(user: User, id: string, feedback: FeedbackPayload): Promise<boolean> {
        const writeSession = this.driver.session({ database: CHATBOT_NEO4J_DATABASE })
        const res = await writeSession.executeWrite(
            async tx =>
                tx.run(
                    `
                        MATCH (u:User {sub: $sub})-[:RECEIVED_RESPONSE]->(r:Response {id: $id})
                        FOREACH (_ IN CASE WHEN $feedback.helpful = true THEN [1] ELSE [] END |
                            SET r:HelpfulResponse
                        )
                        FOREACH (_ IN CASE WHEN $feedback.helpful = false THEN [1] ELSE [] END |
                            SET r:UnhelpfulResponse
                        )
                        SET r += $feedback
                        RETURN r.id AS id
                    `,
                    {
                        sub: user.sub, id, feedback
                    })
        )

        await writeSession.close()

        return res.records.length > 0
    }
}

let instance: Chatbot

export function initChatbot(driver: Driver, openai: OpenAIApi, co: AxiosInstance, converter: showdown.Converter) {
    instance = new Chatbot(driver, openai, co, converter)
}

export default function getChatbot(): Chatbot | undefined {
    return instance
}
