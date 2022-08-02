WITH apoc.schema.relationship.indexExists('RATED',['rating'])  AS RATEDConstraint
RETURN RATEDConstraint as outcome