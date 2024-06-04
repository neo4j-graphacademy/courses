SHOW INDEXES
YIELD name
WHERE name = 'talk_embeddings_openai'
RETURN count(*) = 1 AS outcome