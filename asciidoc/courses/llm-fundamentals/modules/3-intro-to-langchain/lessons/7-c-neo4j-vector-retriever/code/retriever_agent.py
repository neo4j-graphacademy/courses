from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain, RetrievalQA
from langchain.chains.conversation.memory import ConversationBufferMemory
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain import hub
from langchain_community.tools import YouTubeSearchTool
from langchain_community.vectorstores.neo4j_vector import Neo4jVector

OPENAI_API_KEY = "sk-..."

llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY)
embedding_provider = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)

prompt = PromptTemplate(
    template="""
    You are a movie expert. You find movies from a genre or plot. 

    ChatHistory:{chat_history} 
    Question:{input}
    """, 
    input_variables=["chat_history", "input"]
    )

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

chat_chain = LLMChain(llm=llm, prompt=prompt, memory=memory)

youtube = YouTubeSearchTool()

movie_plot_vector = Neo4jVector.from_existing_index(
    embedding_provider,
    url="bolt://localhost:7687",
    username="neo4j",
    password="pleaseletmein",
    index_name="moviePlots",
    embedding_node_property="embedding",
    text_node_property="plot",
)

plot_retriever = RetrievalQA.from_llm(
    llm=llm,
    retriever=movie_plot_vector.as_retriever(), 
    verbose=True, 
    return_source_documents=True
)

def run_retriever(query):
    results = plot_retriever.invoke({"query":query})
    # format the results
    movies = '\n'.join([doc.metadata["title"] + " - " + doc.page_content for doc in results["source_documents"]])
    return movies

tools = [
    Tool.from_function(
        name="Movie Chat",
        description="For when you need to chat about movies. The question will be a string. Return a string.",
        func=chat_chain.run,
        return_direct=True
    ),
    Tool.from_function(
        name="Movie Trailer Search",
        description="Use when needing to find a movie trailer. The question will include the word 'trailer'. Return a link to a YouTube video.",
        func=youtube.run,
        return_direct=True
    ),
    Tool.from_function(
        name="Movie Plot Search",
        description="For when you need to compare a plot to a movie. The question will be a string. Return a string.",
        func=run_retriever,
        return_direct=True
    )
]

agent_prompt = hub.pull("hwchase17/react-chat")
agent = create_react_agent(llm, tools, agent_prompt)
agent_executor = AgentExecutor(
    agent=agent, 
    tools=tools, 
    memory=memory,
    max_interations=3,
    verbose=True,
    handle_parse_errors=True)

while True:
    q = input("> ")
    response = agent_executor.invoke({"input": q})
    print(response["output"])