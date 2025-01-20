LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/rec-embed/movie-poster-embeddings-1k.csv" AS row
match (m:Movie {movieId:row.movieId})
WITH row,m
CALL db.create.setNodeVectorProperty(m, 'posterEmbedding', apoc.convert.fromJsonList(row.posterEmbedding));

CREATE VECTOR INDEX moviePosters IF NOT EXISTS
FOR (m:Movie)
ON m.posterEmbedding
OPTIONS {indexConfig: {
 `vector.dimensions`: 512,
 `vector.similarity_function`: 'cosine'
}};