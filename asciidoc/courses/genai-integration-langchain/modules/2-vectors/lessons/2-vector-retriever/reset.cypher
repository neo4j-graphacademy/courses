LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/rec-embed/movie-plot-embeddings-1k.csv'
AS row
MATCH (m:Movie {movieId: row.movieId})
CALL db.create.setNodeVectorProperty(m, 'plotEmbedding', apoc.convert.fromJsonList(row.embedding));

CREATE VECTOR INDEX moviePlots IF NOT EXISTS
FOR (m:Movie)
ON m.plotEmbedding
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}};