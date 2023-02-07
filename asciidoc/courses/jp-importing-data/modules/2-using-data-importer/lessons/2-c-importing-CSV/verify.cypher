CALL apoc.meta.nodeTypeProperties( )  YIELD nodeType, propertyName, propertyTypes
WITH collect([ nodeType+'.'+propertyName, propertyTypes ]) AS nodeProperties
WITH
all (condition IN [
  // Renamed Properties
  [ pair IN nodeProperties WHERE pair[0] = ':`Movie`.tmdbId' | pair[1] = ['Long'] ],
  [ pair IN nodeProperties WHERE pair[0] = ':`Movie`.imdbId' | pair[1] = ['Long'] ],
  [ pair IN nodeProperties WHERE pair[0] = ':`Movie`.poster' | pair[1] = ['String'] ],
  [ pair IN nodeProperties WHERE pair[0] = ':`Movie`.url' | pair[1] = ['String'] ],
  [ pair IN nodeProperties WHERE pair[0] = ':`Person`.tmdbId' | pair[1] = ['Long'] ],
  [ pair IN nodeProperties WHERE pair[0] = ':`Person`.imdbId' | pair[1] = ['Long'] ],
  [ pair IN nodeProperties WHERE pair[0] = ':`Person`.poster' | pair[1] = ['String'] ],
  [ pair IN nodeProperties WHERE pair[0] = ':`Person`.url' | pair[1] = ['String'] ],
  // Converted Data Types
  [ pair IN nodeProperties WHERE pair[0] = ':`Movie`.revenue' | pair[1] = ['Long'] ],
  [ pair IN nodeProperties WHERE pair[0] = ':`Movie`.budget' | pair[1] = ['Long' ]]
] WHERE condition[0] = true) AS nodes


WITH nodes
CALL apoc.meta.relTypeProperties( ) yield relType, propertyName, propertyTypes
WHERE relType = ":`RATED`"
  AND propertyName = "rating"
  AND "Long" in propertyTypes
WITH  nodes, count(*) as c
RETURN nodes AND count(*) = 1 as outcome
