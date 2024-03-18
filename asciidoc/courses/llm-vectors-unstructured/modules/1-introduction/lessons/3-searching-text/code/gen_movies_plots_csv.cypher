// Generate the movies-plot-embedding.csv file from the recommendations dataset

// Load embeddings
LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/rec-embed/movie-plot-embeddings-1k.csv'
AS row
MATCH (m:Movie {movieId: toInteger(row.movieId)})
CALL db.create.setNodeVectorProperty(m, 'plotEmbedding', apoc.convert.fromJsonList(row.embedding));

// Export the movies-plot-embedding.csv file
MATCH (movie:Movie)
WHERE movie.plotEmbedding IS NOT NULL
WITH collect(movie) AS movies
CALL apoc.export.csv.data(movies, [], "movies-plot-embedding.csv", {})
YIELD file, source, format, nodes, relationships, properties, time, rows, batchSize, batches, done, data
RETURN file, source, format, nodes, relationships, properties, time, rows, batchSize, batches, done, data;