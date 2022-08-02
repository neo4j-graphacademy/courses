WITH apoc.schema.node.constraintExists('Person',['name','url'])  AS personConstraint
RETURN personConstraint as outcome