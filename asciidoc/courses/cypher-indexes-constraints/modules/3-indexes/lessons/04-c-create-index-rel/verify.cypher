CALL apoc.schema.relationships({types:['RATED']}) yield properties, name
where properties[0] = 'rating'
return name = ':RATED(rating)' as outcome