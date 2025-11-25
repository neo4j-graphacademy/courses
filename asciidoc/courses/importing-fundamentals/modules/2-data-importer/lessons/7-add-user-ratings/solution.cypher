// This challenge verifies that User nodes and RATED relationships were created using Data Importer.
// The solution involves using Data Importer to import ratings.csv and create User nodes and RATED relationships.
// This Cypher query can be used to verify the data was created:
MATCH (u:User)-[r:RATED]->()
RETURN count(DISTINCT u) AS user_count, count(r) AS rating_count
LIMIT 1

