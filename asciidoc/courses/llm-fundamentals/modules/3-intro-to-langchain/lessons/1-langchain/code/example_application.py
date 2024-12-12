import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain import hub
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain.schema import StrOutputParser
from langchain_neo4j.chat_message_histories.neo4j import Neo4jChatMessageHistory
from langchain_neo4j import Neo4jGraph
from uuid import uuid4

# Load environment variables
load_dotenv()

def create_cypher_agent(session_id=None):
    if session_id is None:
        session_id = str(uuid4())

    llm = ChatOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    graph = Neo4jGraph(
        url=os.getenv("NEO4J_URI", "bolt://localhost:7687"),
        username=os.getenv("NEO4J_USERNAME", "neo4j"),
        password=os.getenv("NEO4J_PASSWORD")
    )

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are a Neo4j expert having a conversation about how to create Cypher queries",
        ),
        ("human", "{input}"),
    ])

    cypher_chat = prompt | llm | StrOutputParser()

    def get_memory(session_id):
        return Neo4jChatMessageHistory(session_id=session_id, graph=graph)

    tools = [
        Tool.from_function(
            name="Cypher Support",
            description="For when you need to talk about Cypher queries.",
            func=cypher_chat.invoke,
        )
    ]

    agent_prompt = hub.pull("hwchase17/react-chat")
    agent = create_react_agent(llm, tools, agent_prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools)

    return RunnableWithMessageHistory(
        agent_executor,
        get_memory,
        input_messages_key="input",
        history_messages_key="chat_history",
    )

def main():
    session_id = str(uuid4())
    print(f"Session ID: {session_id}")
    
    cypher_agent = create_cypher_agent(session_id)

    while True:
        try:
            q = input("> ")
            response = cypher_agent.invoke(
                {"input": q},
                {"configurable": {"session_id": session_id}},
            )
            print(response["output"])
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break

if __name__ == "__main__":
    main()
