import { Driver } from "neo4j-driver";
import { CHATBOT_NEO4J_HOST, CHATBOT_NEO4J_PASSWORD, CHATBOT_NEO4J_USERNAME } from "../../constants";
import { createDriver } from "../neo4j";

let driver: Driver

export async function getChatbotDriver() {
    if (driver) {
        return driver;
    }
    driver = await createDriver(
        CHATBOT_NEO4J_HOST as string,
        CHATBOT_NEO4J_USERNAME as string,
        CHATBOT_NEO4J_PASSWORD as string,
        false
    )

    return driver
}
