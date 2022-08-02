call apoc.schema.assert({},{},false) yield label, key
WHERE label = 'ACTED_IN' AND key = 'role'
return count(*) = 2 as outcome