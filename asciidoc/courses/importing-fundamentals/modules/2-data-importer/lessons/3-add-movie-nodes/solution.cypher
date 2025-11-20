// This challenge verifies that Movie nodes were created using Data Importer.
// The solution involves using Data Importer to import movies.csv and create Movie nodes.
// This Cypher query can be used to verify the nodes were created:
MATCH (m:Movie)
RETURN count(m) AS movie_count
LIMIT 1

