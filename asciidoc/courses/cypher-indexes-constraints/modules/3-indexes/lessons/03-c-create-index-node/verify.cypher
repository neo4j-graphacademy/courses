WITH NOT (apoc.schema.node.constraintExists('Person',['name','url']))  AS personConstraint,
apoc.schema.node.indexExists('Person',['name'])  AS personIndex
RETURN personConstraint  AND personIndex as outcome
