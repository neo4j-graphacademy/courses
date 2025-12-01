// This challenge verifies that DIRECTED relationships were created using Data Importer.
// The solution involves using Data Importer to import directed.csv and create DIRECTED relationships.
// This Cypher query can be used to verify the relationships were created:
MATCH ()-[r:DIRECTED]->()
RETURN count(r) AS directed_count
LIMIT 1

