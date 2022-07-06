RETURN NOT(
apoc.schema.node.constraintExists("Movie", ["title","released"]) 
AND 
apoc.schema.relationship.constraintExists("RATED", ["timestamp"]) 
) AS output