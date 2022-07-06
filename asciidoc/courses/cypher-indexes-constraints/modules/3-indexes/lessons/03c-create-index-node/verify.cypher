CALL apoc.schema.nodes({labels:['Person']}) yield  properties, type
WHERE type = 'UNIQUENESS' AND "name" in properties AND "url" in properties
WITH count(*) as nodekey
CALL apoc.schema.nodes({labels:['Person']}) yield  properties, type
WHERE type = 'INDEX' AND "name" in properties
return nodekey + count(*) = 1 as outcome