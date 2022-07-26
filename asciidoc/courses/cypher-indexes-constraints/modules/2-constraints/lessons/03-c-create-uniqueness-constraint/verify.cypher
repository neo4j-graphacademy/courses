CALL apoc.schema.nodes({labels:['Person']}) yield  properties, type
WHERE type = 'UNIQUENESS' AND "tmdbId" in properties
WITH count(*) as personConstraintCount
CALL apoc.schema.nodes({labels:['User']}) yield  properties, type
WHERE type = 'UNIQUENESS' AND "userId" in properties
WITH personConstraintCount, count(*) as userConstraintCount
CALL apoc.schema.nodes({labels:['Genre']}) yield  properties, type
WHERE type = 'UNIQUENESS' AND "name" in properties
return personConstraintCount + userConstraintCount + count(*) = 3 as outcome