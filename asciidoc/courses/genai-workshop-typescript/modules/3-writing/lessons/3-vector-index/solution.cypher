CREATE VECTOR INDEX talk_embeddings_openai IF NOT EXISTS
FOR (t:Talk)
ON m.embedding
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}}