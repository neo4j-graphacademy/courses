MATCH (from:User) WHERE from.email = $from
MATCH (to:User) WHERE to.email = $to

MATCH (from)-[r:HAS_ENROLMENT]->(e)

DELETE r
MERGE (to)-[:HAS_ENROLMENT]->(e)

RETURN *