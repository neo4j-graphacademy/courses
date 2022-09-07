CALL apoc.meta.nodeTypeProperties( )  YIELD nodeType, propertyName, propertyTypes
WITH apoc.map.fromPairs(collect([ nodeType+'.'+propertyName, propertyTypes ])) AS nodeProperties
WITH
all(condition IN [
  // Renamed Properties
  nodeProperties[':`Movie`.tmdbId'] = ['Long'],
  nodeProperties[':`Movie`.imdbId'] = ['Long'],
  nodeProperties[':`Movie`.poster'] = ['String'],
  nodeProperties[':`Movie`.url'] = ['String'],
  nodeProperties[':`Person`.tmdbId'] = ['Long'],
  nodeProperties[':`Person`.imdbId'] = ['Long'],
  nodeProperties[':`Person`.poster'] = ['String'],
  nodeProperties[':`Person`.url'] = ['String'],
  // Converted Data Types
  nodeProperties[':`Movie`.revenue'] = ['Long'],
  nodeProperties[':`Movie`.budget'] = ['Long']
] WHERE condition) AS nodes
WITH nodes
CALL apoc.meta.relTypeProperties( ) yield relType, propertyName, propertyTypes
WHERE relType = ":`RATED`"
  AND propertyName = "rating"
  AND "Long" in propertyTypes
WITH  nodes, count(*) as c
RETURN nodes AND count(*) = 1 as outcome
