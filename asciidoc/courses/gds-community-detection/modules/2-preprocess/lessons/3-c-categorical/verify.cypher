MATCH (p:Person)
WITH collect(apoc.meta.cypher.type(p.PunctualityEncoding)) AS types, 'INTEGER' AS expected
RETURN
    'PunctualityEncoding' AS task,
    any(type in types WHERE type = expected) AS outcome,
    CASE WHEN any(type in types WHERE type = expected) THEN null
    ELSE 'Expected one or more `PunctualityEncoding` values with type of '+ expected
    END AS reason