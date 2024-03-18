CREATE VECTOR INDEX questions IF NOT EXISTS
FOR (q:Question)
ON q.embedding
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}}