//call apoc.schema.assert({},{},false) yield label, key
// label = 'RATED' AND key = 'ratingY'
//return count(*) = 2 as outcome

SHOW INDEXES yield labelsOrTypes, properties
WHERE size(labelsOrTypes) = 1
AND size(properties) = 1
AND "RATED" IN labelsOrTypes
AND "ratingY" in properties
return count(*) = 2 as outcome