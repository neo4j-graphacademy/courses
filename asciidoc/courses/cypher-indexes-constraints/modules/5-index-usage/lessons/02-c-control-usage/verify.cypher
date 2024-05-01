//call apoc.schema.assert({},{},false) yield label, key
//WHERE label = 'ACTED_IN' AND key = 'role'
//return count(*) = 2 as outcome

SHOW INDEXES yield labelsOrTypes, properties
WHERE size(labelsOrTypes) = 1
AND size(properties) = 1
AND "ACTED_IN" IN labelsOrTypes
AND "role" in properties
return count(*) >= 2 as outcome