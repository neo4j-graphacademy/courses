WITH NOT (apoc.schema.relationship.constraintExists('RATED',['timestamp']))  AS RATEDConstraint,
NOT (apoc.schema.node.constraintExists('Movie',['title','released']))  AS movieConstraint
RETURN RATEDConstraint AND movieConstraint as outcome
