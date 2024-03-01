MERGE (t:Team { id: 'neo4j' })
 SET t.domains = ['neo4j.com', 'neotechnology.com'], t.name = 'Neo4j Employees & Alumni', t.description = 'Neo4j Employees & Alumni', t.public = true , t.open = false ;

MERGE (t:Team { id: 'neo4j-devrel' })
 SET t.pin = '987654322', t.name = 'Neo4j DevRel', t.description = 'The Developer Relations team at Neo4j', t.public = true , t.open = false ;

MERGE (t:Team { id: 'neo4j-graphacademy' })
 SET t.name = t.pin = '987654322', t.name = 'Neo4j GraphAcademy', t.description = 'This should be a private group', t.public = false , t.open = false ;

MERGE (t:Team { id: 'eb9Fhbs' })
 SET t.name = "Adam's friends", t.pin = '1234', t.description = "Adam's GraphAcademy friends", t.public = false , t.open = true ;
