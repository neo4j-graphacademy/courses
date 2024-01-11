from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores.neo4j_vector import Neo4jVector

OPENAI_API_KEY = "sk-..."

chat_llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY)

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

plot_retriever = RetrievalQA.from_llm(
    llm=chat_llm,
    retriever=movie_plot_vector.as_retriever()
)

result = plot_retriever.invoke(
    {"query": "A movie where a mission to the moon goes wrong"}
    )

print(result)