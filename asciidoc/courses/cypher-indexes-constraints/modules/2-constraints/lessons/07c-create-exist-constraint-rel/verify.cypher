CALL apoc.schema.relationships({types:['RATED']}) yield   properties, type
WHERE properties[0] = 'timestamp'
RETURN
'RELATIONSHIP_PROPERTY_EXISTENCE' = type as outcome