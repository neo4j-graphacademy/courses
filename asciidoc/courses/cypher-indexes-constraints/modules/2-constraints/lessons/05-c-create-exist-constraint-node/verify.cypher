WITH apoc.schema.node.constraintExists('Movie',['title'])  AS movieConstraint,
apoc.schema.node.constraintExists('User',['name'])  AS userConstraint
RETURN movieConstraint AND userConstraint  as outcome