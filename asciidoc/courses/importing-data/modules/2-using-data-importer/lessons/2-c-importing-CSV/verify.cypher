CALL apoc.meta.nodeTypeProperties( )  YIELD nodeType, propertyName, propertyTypes
WITH apoc.map.fromPairs(collect([ nodeType+'.'+propertyName, propertyTypes ])) AS nodeProperties

CALL apoc.meta.relTypeProperties( ) yield relType, propertyName, propertyTypes
WITH nodeProperties, apoc.map.fromPairs(collect([ relType+'.'+propertyName, propertyTypes ])) AS relProperties
WITH apoc.map.merge(nodeProperties, relProperties) AS properties

UNWIND [
  { entry: ':`Movie`.tmdbId', expected: ['Long']},
  { entry: ':`Movie`.imdbId', expected: ['Long']},
  { entry: ':`Movie`.poster', expected: ['String']},
  { entry: ':`Movie`.url', expected: ['String']},
  { entry: ':`Person`.tmdbId', expected: ['Long']},
  { entry: ':`Person`.imdbId', expected: ['Long']},
  { entry: ':`Person`.poster', expected: ['String']},
  { entry: ':`Person`.url', expected: ['String']},
  // Converted Data Types
  { entry: ':`Movie`.revenue', expected: ['Long']},
  { entry: ':`Movie`.budget', expected: ['Long']},
  { entry: ':`RATED`.rating', expected: ['Long']}
] AS condition

WITH properties, condition.entry AS label, condition.expected AS expected, properties[ condition.entry ] AS actual
RETURN
  apoc.text.join(label +' should be' + expected, ' ') AS task,
  coalesce(expected = actual, false) AS outcome,
  actual AS answers,
    CASE WHEN expected = actual THEN null ELSE apoc.text.join('Expected ' + label + ' data type to be `'+ expected +'` but was `'+ coalesce(actual, '(null)') +'`', ' ') END AS reason
