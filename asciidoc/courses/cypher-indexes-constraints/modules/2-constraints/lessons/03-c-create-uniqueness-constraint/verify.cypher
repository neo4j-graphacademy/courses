WITH apoc.schema.node.constraintExists('Person',['tmdbId'])  AS personConstraint,
apoc.schema.node.constraintExists('User',['userId'])  AS userConstraint,
apoc.schema.node.constraintExists('Genre',['name'])  AS genreConstraint
RETURN personConstraint AND userConstraint AND genreConstraint as outcome