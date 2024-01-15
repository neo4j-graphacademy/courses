from langchain_openai import ChatOpenAI
from langchain.schema.messages import HumanMessage, SystemMessage

chat_llm = ChatOpenAI(
    openai_api_key="sk-..."
)

instructions = SystemMessage(content="""
You are a surfer dude, having a conversation about the surf conditions on the beach.
Respond using surfer slang.
""")

question = HumanMessage(content="What is the weather like?")

response = chat_llm.invoke([
    instructions,
    question
])

print(response.content)