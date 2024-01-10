from langchain_openai import ChatOpenAI
from langchain.prompts.prompt import PromptTemplate
from langchain.chains import LLMChain
from langchain.chains.conversation.memory import ConversationBufferMemory
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain import hub

chat_llm = ChatOpenAI(
    openai_api_key="sk-..."
)

memory = ConversationBufferMemory(memory_key="chat_history", input_key="input", return_messages=True)

prompt = PromptTemplate(template="""You are a Neo4j expert having a conversation about how to create Cypher queries

Chat History: {chat_history}
Question: {input}
""", input_variables=["chat_history", "input"])

chat_chain = LLMChain(
    llm=chat_llm,
    prompt=prompt,
    memory=memory)

tools = [
    Tool.from_function(
        name="ChatOpenAI",
        description="Talk about Neo4j Cypher queries",
        func=chat_chain.run,
        return_direct=True,
    )
]

agent_prompt = hub.pull("hwchase17/react")
agent = create_react_agent(chat_llm, tools, agent_prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, memory=memory, handle_parse_errors=True)

while True:
    q = input("> ")
    print(agent_executor.invoke({"input": q}))