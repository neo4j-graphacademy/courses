// Create the TEXT index on the role property of the ACTED_IN relationship
CREATE  TEXT INDEX ACTED_IN_role_text IF NOT EXISTS FOR ()-[x:ACTED_IN]-() ON (x.role);

// query the graph with the query hint to use the newly-created indes
PROFILE MATCH
(p:Person)-[r:ACTED_IN]->(m:Movie)
USING INDEX r:ACTED_IN(role)
WHERE
p.name CONTAINS 'George'
AND
r.role CONTAINS 'General'
RETURN p.name, r.role, m.title