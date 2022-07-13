CALL apoc.schema.relationships({types:['RATED']}) yield properties, name
where name = ':RATED(ratingY)'
return count(*) = 2 as outcome