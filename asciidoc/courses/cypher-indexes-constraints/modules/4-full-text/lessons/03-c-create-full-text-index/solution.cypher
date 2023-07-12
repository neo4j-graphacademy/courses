// Create the full-text index
CREATE FULLTEXT INDEX ACTED_IN_role_ft IF NOT EXISTS FOR ()-[x:ACTED_IN]-() ON EACH [x.role];

// query the graph with the full-text index
CALL db.index.fulltext.queryRelationships("ACTED_IN_role_ft", "+narrator +voice") YIELD relationship
RETURN relationship.role