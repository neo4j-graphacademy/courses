from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
# tag::import-neo4j[]
from langchain_neo4j import Neo4jGraph
# end::import-neo4j[]
# tag::import-neo4j-chat[]
from langchain_neo4j.chat_message_histories.neo4j import Neo4jChatMessageHistory
# end::import-neo4j-chat[]
# tag::session-id[]
from uuid import uuid4

SESSION_ID = str(uuid4())
print(f"Session ID: {SESSION_ID}")
# end::session-id[]

chat_llm = ChatOpenAI(openai_api_key="sk-...")

# tag::neo4j-graph[]
graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="pleaseletmein"
)
# end::neo4j-graph[]

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a surfer dude, having a conversation about the surf conditions on the beach. Respond using surfer slang.",
        ),
        ("system", "{context}"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}"),
    ]
)

# tag::get-memory[]
def get_memory(session_id):
    return Neo4jChatMessageHistory(session_id=session_id, graph=graph)
# end::get-memory[]

chat_chain = prompt | chat_llm | StrOutputParser()

chat_with_message_history = RunnableWithMessageHistory(
    chat_chain,
    get_memory,
    input_messages_key="question",
    history_messages_key="chat_history",
)

current_weather = """
    {
        "surf": [
            {"beach": "Fistral", "conditions": "6ft waves and offshore winds"},
            {"beach": "Bells", "conditions": "Flat and calm"},
            {"beach": "Watergate Bay", "conditions": "3ft waves and onshore winds"}
        ]
    }"""

while True:
    question = input("> ")

    # tag::invoke[]
    response = chat_with_message_history.invoke(
        {
            "context": current_weather,
            "question": question,

        },
        config={
            "configurable": {"session_id": SESSION_ID}
        }
    )
    # end::invoke[]

    print(response)
