from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores.neo4j_vector import Neo4jVector
from langchain.schema import Document

# A list of Documents
documents = [
    Document(page_content="Text to be indexed", metadata={"source": "local"})
    ]

# Service used to create the embeddings
embedding_provider = OpenAIEmbeddings(
    openai_api_key="sk-..."
)

new_vector = Neo4jVector.from_documents(
    documents,
    embedding_provider,
    url="bolt://localhost:7687",
    username="neo4j",
    password="pleaseletmein",
    index_name="myVectorIndex",
    node_label="Chunk",
    text_node_property="text",
    embedding_node_property="embedding",
    create_id_index=True,
)