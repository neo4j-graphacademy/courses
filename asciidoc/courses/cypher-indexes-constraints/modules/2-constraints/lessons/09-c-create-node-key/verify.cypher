CALL apoc.schema.nodes({labels:['Person']}) yield  properties, type
WHERE type = 'UNIQUENESS' AND "name" in properties AND "url" in properties
return  count(*) = 1 as outcome