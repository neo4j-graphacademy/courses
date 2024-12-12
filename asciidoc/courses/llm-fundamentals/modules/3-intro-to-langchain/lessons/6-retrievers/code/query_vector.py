from langchain_openai import OpenAIEmbeddings
from langchain_neo4j import Neo4jGraph
from langchain_neo4j import Neo4jVector

embedding_provider = OpenAIEmbeddings(
    openai_api_key="sk-..."
)

graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="pleaseletmein"
)

movie_plot_vector = Neo4jVector.from_existing_index(
    embedding_provider,
    graph=graph,
    index_name="moviePlots",
    embedding_node_property="plotEmbedding",
    text_node_property="plot",
)

result = movie_plot_vector.similarity_search("A movie where aliens land and attack earth.")
for doc in result:
    print(doc.metadata["title"], "-", doc.page_content)
