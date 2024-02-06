// Generate the movies-poster-embedding.csv file from the recommendations dataset

// Load embeddings
LOAD CSV WITH HEADERS
FROM 'file:///movie-poster-embeddings-1000.csv'
AS row
MATCH (m:Movie {movieId: toInteger(row.movieId)})
CALL db.create.setNodeVectorProperty(m, 'posterEmbedding', apoc.convert.fromJsonList(row.posterEmbedding));

// Export the movies-poster-embedding.csv file
MATCH (movie:Movie)
WHERE movie.posterEmbedding IS NOT NULL
WITH collect(movie) AS movies
CALL apoc.export.csv.data(movies, [], "movies-poster-embedding.csv", {})
YIELD file, source, format, nodes, relationships, properties, time, rows, batchSize, batches, done, data
RETURN file, source, format, nodes, relationships, properties, time, rows, batchSize, batches, done, data;