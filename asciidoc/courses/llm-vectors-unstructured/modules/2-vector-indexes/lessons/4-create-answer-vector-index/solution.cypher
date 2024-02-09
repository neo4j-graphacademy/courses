CREATE VECTOR INDEX answers IF NOT EXISTS
FOR (a:Answer)
ON a.embedding
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}};