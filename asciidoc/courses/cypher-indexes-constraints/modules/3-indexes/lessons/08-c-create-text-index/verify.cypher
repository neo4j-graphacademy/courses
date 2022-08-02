call apoc.schema.assert({},{},false) yield label, key
WHERE label = 'RATED' AND key = 'ratingY'
return count(*) = 2 as outcome