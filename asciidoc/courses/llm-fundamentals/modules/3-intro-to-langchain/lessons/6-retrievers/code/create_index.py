import os
from langchain_openai import OpenAIEmbeddings
from langchain_neo4j import Neo4jGraph, Neo4jVector
from langchain.schema import Document

# A list of Documents
documents = [
    Document(
        page_content="Text to be indexed",
        metadata={"source": "local"}
    )
]

# Service used to create the embeddings
embedding_provider = OpenAIEmbeddings(
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

graph = Neo4jGraph(
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USERNAME"),
    password=os.getenv("NEO4J_PASSWORD")
)

new_vector = Neo4jVector.from_documents(
    documents,
    embedding_provider,
    graph=graph,
    index_name="myVectorIndex",
    node_label="Chunk",
    text_node_property="text",
    embedding_node_property="embedding",
    create_id_index=True,
)
