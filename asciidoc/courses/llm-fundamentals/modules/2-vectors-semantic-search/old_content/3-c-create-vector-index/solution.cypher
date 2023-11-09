// tag::create[]
CALL db.index.vector.createNodeIndex(
    'moviePlots',
    'Movie',
    'plotEmbedding',
    1536,
    'cosine'
);
// end::create[]

// tag::load[]
LOAD CSV WITH HEADERS
FROM 'https://github.com/neo4j-graphacademy/llm-fundamentals/raw/main/data/openai-embeddings.csv'
AS row
MATCH (m:Movie {movieId: row.movieId})
CALL db.create.setVectorProperty(m, 'plotEmbedding', apoc.convert.fromJsonList(row.embedding)) YIELD node
RETURN count(*);
// end::load[]

// tag::prompt[]
MATCH (p:Prompt)
RETURN p.prompt, size(p.embedding) AS embeddingDimensions;
// end::prompt[]

// tag::query[]
MATCH (p:Prompt)
CALL db.index.vector.queryNodes('moviePlots', 1, p.embedding)
YIELD node, score
RETURN node.title AS title, left(node.plot, 50) +'...' AS plot, score;
// end::query[]