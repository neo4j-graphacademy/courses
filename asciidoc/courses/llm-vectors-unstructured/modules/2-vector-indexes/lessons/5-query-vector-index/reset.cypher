LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/llm-vectors-unstructured/Quora-QuAD-1000-embeddings.csv' AS row

MERGE (q:Question{text:row.question})
WITH row,q
CALL db.create.setNodeVectorProperty(q, 'embedding', apoc.convert.fromJsonList(row.question_embedding))

MERGE (a:Answer{text:row.answer})
WITH row,a,q
CALL db.create.setNodeVectorProperty(a, 'embedding', apoc.convert.fromJsonList(row.answer_embedding))

MERGE(q)-[:ANSWERED_BY]->(a);

CREATE VECTOR INDEX questions IF NOT EXISTS
FOR (q:Question)
ON q.embedding
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}};

CREATE VECTOR INDEX answers IF NOT EXISTS
FOR (a:Answer)
ON a.embedding
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}};