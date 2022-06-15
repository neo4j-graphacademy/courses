CALL apoc.meta.nodeTypeProperties( )  YIELD nodeType, propertyName, propertyTypes
WITH apoc.map.fromPairs(collect([ nodeType+'.'+propertyName, propertyTypes ])) AS nodeProperties
RETURN
all(condition IN [
  // Renamed Properties
  nodeProperties[':`Movie`.tmdbId'] = ['String'],
  nodeProperties[':`Movie`.imdbId'] = ['String'],
  // Converted Data Types
  nodeProperties[':`Movie`.imdbRating'] = ['Double'],
  nodeProperties[':`Movie`.year'] = ['Long'],
  nodeProperties[':`Movie`.revenue'] = ['Long'],
  nodeProperties[':`Movie`.runtime'] = ['Long'],
  nodeProperties[':`Movie`.year'] = ['Long']
] WHERE condition) AS outcome