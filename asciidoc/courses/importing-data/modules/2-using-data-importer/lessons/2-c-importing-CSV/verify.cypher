MATCH ()-[r]->()
WITH count(r) AS Relationships
MATCH (n)
WITH count(n) as Nodes, Relationships
CALL apoc.meta.nodeTypeProperties( ) yield  propertyTypes, totalObservations
with Relationships, Nodes, sum(totalObservations) AS numProperties
CALL apoc.meta.nodeTypeProperties( ) yield  propertyTypes, totalObservations
with * where  propertyTypes = ["Long"] OR propertyTypes = ["Double"]
with Relationships, Nodes, numProperties, sum(totalObservations) AS numNumericProperties
RETURN Relationships + Nodes + numProperties + numNumericProperties = 12417 as outcome