from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.neo4j_vector import Neo4jVector

embedding_provider = OpenAIEmbeddings(
    openai_api_key="sk-..."
)

movie_plot_vector = Neo4jVector.from_existing_index(
    embedding_provider,
    url="bolt://localhost:7687",
    username="neo4j",
    password="pleaseletmein",
    index_name="moviePlots",
    embedding_node_property="embedding",
    text_node_property="plot",
)

result = movie_plot_vector.similarity_search("A movie where aliens land and attack earth.")
for doc in result:
    print(doc.metadata["title"], "-", doc.page_content)
