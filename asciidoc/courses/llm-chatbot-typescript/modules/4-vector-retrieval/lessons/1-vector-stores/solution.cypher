// tag::setup[]
CREATE VECTOR INDEX `moviePlots` IF NOT EXISTS
FOR (n: Movie) ON (n.embedding)
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}};
// end::setup[]

// tag::import[]
LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/llm-fundamentals/openai-embeddings.csv'
AS row
MATCH (m:Movie {movieId: row.movieId})
CALL db.create.setNodeVectorProperty(m, 'embedding', apoc.convert.fromJsonList(row.embedding))
RETURN count(*);
// end::import[]

// This index is created by the text
CREATE VECTOR INDEX `test-index` IF NOT EXISTS
FOR (n: Test) ON (n.embedding)
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}};