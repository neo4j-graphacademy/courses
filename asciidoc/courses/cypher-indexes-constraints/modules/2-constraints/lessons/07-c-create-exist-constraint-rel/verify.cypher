WITH apoc.schema.relationship.constraintExists('RATED',['timestamp'])  AS RATEDConstraint
RETURN RATEDConstraint as outcome