LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/neo4j-graphacademy/llm-fundamentals/main/data/prompt.csv' AS row
MERGE (p:Prompt {prompt: row.prompt})
SET p.embedding = apoc.convert.fromJsonList(row.embedding);
