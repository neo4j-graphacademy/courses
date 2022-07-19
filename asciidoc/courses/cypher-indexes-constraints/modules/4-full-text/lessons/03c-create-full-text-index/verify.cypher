CALL apoc.schema.relationships({types:['ACTED_IN']}) yield properties, name
where name = ':ACTED_IN(role)'
return count(*) = 1 as outcome