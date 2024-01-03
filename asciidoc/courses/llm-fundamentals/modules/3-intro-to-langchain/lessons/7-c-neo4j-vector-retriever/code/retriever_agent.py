from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain, RetrievalQA
from langchain.chains.conversation.memory import ConversationBufferMemory
from langchain.agents import AgentType, initialize_agent
from langchain.tools import Tool, YouTubeSearchTool
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores.neo4j_vector import Neo4jVector

OPENAI_API_KEY = "sk-..."

llm = ChatOpenAI(
    openai_api_key=OPENAI_API_KEY
)

youtube = YouTubeSearchTool()

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

prompt = PromptTemplate(
    template="""
    You are a movie expert. You find movies from a genre or plot. 

    ChatHistory:{chat_history} 
    Question:{input}
    """, 
    input_variables=["chat_history", "input"]
    )

chat_chain = LLMChain(llm=llm, prompt=prompt, memory=memory, verbose=True)

embedding_provider = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)

movie_plot_vector = Neo4jVector.from_existing_index(
    embedding_provider,
    url="bolt://localhost:7687",
    username="neo4j",
    password="pleaseletmein",
    index_name="moviePlots",
    embedding_node_property="embedding", 
    text_node_property="plot",
)

retrievalQA = RetrievalQA.from_llm(
    llm=llm, 
    retriever=movie_plot_vector.as_retriever(), 
    verbose=True, 
    return_source_documents=True
)

def run_retriever(query):
    results = retrievalQA({"query":query})
    return str(results)

tools = [
    Tool.from_function(
        name="ChatOpenAI",
        description="For when you need to chat about movies, genres or plots. The question will be a string. Return a string.",
        func=chat_chain.run,
        return_direct=True
    ),
    Tool.from_function(
        name="YouTubeSearchTool",
        description="For when you need a link to a movie trailer. The question will be a string. Return a link to a YouTube video.",
        func=youtube.run,
        return_direct=True
    ),
    Tool.from_function(
        name="PlotRetrieval",
        description="For when you need to compare a plot to a movie. The question will be a string. Return a string.",
        func=run_retriever,
        # func=lambda query: str(retrievalQA({"query": query})), Alternative way to wrap the function using lambda.
        return_direct=True
    )
]

agent = initialize_agent(
    tools, llm, memory=memory,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    # max_iterations=3,
    verbose=True, 
    handle_parsing_errors=True,
)

while True:
    q = input(">")
    print(agent.run(q))