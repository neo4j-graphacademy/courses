CALL db.index.vector.createNodeIndex(
    'moviePlots',
    'Movie',
    'embedding',
    1536,
    'cosine'
);

LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/llm-fundamentals/openai-embeddings.csv'
AS row
MATCH (m:Movie {movieId: row.movieId})
CALL db.create.setNodeVectorProperty(m, 'embedding', apoc.convert.fromJsonList(row.embedding))
RETURN count(*);

MATCH (m:Movie {title: 'Toy Story'})
WITH m LIMIT 1

CALL db.index.vector.queryNodes('moviePlots', 6, m.embedding)
YIELD node, score

RETURN node.title AS title, node.plot AS plot, score;