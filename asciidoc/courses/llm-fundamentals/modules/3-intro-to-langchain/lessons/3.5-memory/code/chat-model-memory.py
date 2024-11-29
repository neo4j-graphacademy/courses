from langchain_openai import ChatOpenAI
# tag::import-messages[]
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# end::import-messages[]
from langchain.schema import StrOutputParser
# tag::import-memory[]
from langchain_neo4j import ChatMessageHistory
# end::import-memory[]
# tag::import-runnable[]
from langchain_core.runnables.history import RunnableWithMessageHistory
# end::import-runnable[]

chat_llm = ChatOpenAI(openai_api_key="sk-...")

# tag::prompt[]
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
# end::prompt[]

# tag::memory[]
memory = ChatMessageHistory()

def get_memory(session_id):
    return memory
# end::memory[]

# tag::chat-history[]
chat_chain = prompt | chat_llm | StrOutputParser()

chat_with_message_history = RunnableWithMessageHistory(
    chat_chain,
    get_memory,
    input_messages_key="question",
    history_messages_key="chat_history",
)
# end::chat-history[]


current_weather = """
    {
        "surf": [
            {"beach": "Fistral", "conditions": "6ft waves and offshore winds"},
            {"beach": "Bells", "conditions": "Flat and calm"},
            {"beach": "Watergate Bay", "conditions": "3ft waves and onshore winds"}
        ]
    }"""

# tag::loop[]
while True:
    question = input("> ")

    response = chat_with_message_history.invoke(
        {
            "context": current_weather,
            "question": question,
            
        }, 
        config={
            "configurable": {"session_id": "none"}
        }
    )
    
    print(response)
# end::loop[]