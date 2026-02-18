// Drop all graph projections
CALL gds.graph.list()
YIELD graphName
CALL gds.graph.drop(graphName)
YIELD graphName AS droppedGraph;

// Remove SIMILAR relationships created in previous lessons
MATCH ()-[r:SIMILAR]->()
DELETE r;

// Return confirmation
RETURN "Sandbox reset complete" AS status
