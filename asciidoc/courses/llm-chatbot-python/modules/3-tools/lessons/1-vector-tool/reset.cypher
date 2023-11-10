// Create the vector index
// tag::create[]
CALL db.index.vector.createNodeIndex(
    'moviePlots',
    'Movie',
    'plotEmbedding',
    1536,
    'cosine'
);
// end::create[]

// Load in the embeddings
// TODO: Check the file is correct
// tag::load[]
LOAD CSV WITH HEADERS
FROM 'https://github.com/neo4j-graphacademy/llm-fundamentals/raw/main/data/openai-embeddings.csv'
AS row
MATCH (m:Movie {movieId: row.movieId})
CALL db.create.setVectorProperty(m, 'plotEmbedding', apoc.convert.fromJsonList(row.embedding)) YIELD node
RETURN count(*);
// end::load[]