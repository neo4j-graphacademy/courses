call apoc.meta.nodeTypeProperties()
yield nodeLabels, propertyName, propertyTypes, totalObservations
WHERE nodeLabels=['Person'] AND propertyName IN ['Storm', 'Gender']
WITH apoc.map.fromPairs(collect([propertyName, propertyTypes])) AS properties

UNWIND [{ property: 'Storm', expected: 'Double' }, {property: 'Gender', expected: 'String'}] AS condition

WITH properties, condition.property AS property, condition.expected AS expected,
properties[ condition.property ][0] AS actual

RETURN
property + ' should be ' + expected AS task,
coalesce(expected = actual, false ) AS outcome,

CASE WHEN expected = actual THEN null ELSE 'Expected `'+ expected + '` but was `'+ coalesce(actual, 'null') +'`' END AS reason
