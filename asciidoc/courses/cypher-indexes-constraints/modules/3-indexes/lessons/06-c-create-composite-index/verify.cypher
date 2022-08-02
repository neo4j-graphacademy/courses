CALL apoc.schema.nodes({labels:['Movie']}) yield name
WHERE name = ':Movie(year,imdbRating)'
return count(*) = 1 as outcome