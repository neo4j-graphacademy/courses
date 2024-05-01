LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/llm-fundamentals/openai-embeddings.csv'
AS row
MATCH (m:Movie {movieId: row.movieId})
CALL db.create.setNodeVectorProperty(m, 'embedding', apoc.convert.fromJsonList(row.embedding))
RETURN count(*);

CREATE VECTOR INDEX moviePlots IF NOT EXISTS
FOR (m:Movie)
ON m.embedding
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}};
