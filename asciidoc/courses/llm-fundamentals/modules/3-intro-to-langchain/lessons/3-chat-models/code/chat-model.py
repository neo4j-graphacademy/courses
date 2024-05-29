# tag::import[]
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage  
# end::import[]

# tag::llm[]
chat_llm = ChatOpenAI(
    openai_api_key="sk-..."
)
# end::llm[]

# tag::system[]
instructions = SystemMessage(content="""
You are a surfer dude, having a conversation about the surf conditions on the beach.
Respond using surfer slang.
""")
# end::system[]

# tag::human[]
question = HumanMessage(content="What is the weather like?")
# end::human[]

# tag::invoke[]
response = chat_llm.invoke([
    instructions,
    question
])

print(response.content)
# end::invoke[]