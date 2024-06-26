// Load in the embeddings
// TODO: Check the file is correct
// tag::load[]
LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/llm-fundamentals/openai-embeddings.csv'
AS row
MATCH (m:Movie {movieId: row.movieId})
CALL db.create.setVectorProperty(m, 'plotEmbedding', apoc.convert.fromJsonList(row.embedding)) YIELD node
RETURN count(*)
// end::load[]
;

// Create the vector index
// tag::create[]
CREATE VECTOR INDEX moviePlots IF NOT EXISTS
FOR (m:Movie)
ON m.plotEmbedding
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}}
// end::create[]
;