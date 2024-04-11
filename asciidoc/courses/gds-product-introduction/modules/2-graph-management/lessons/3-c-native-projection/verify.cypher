CALL gds.graph.list() YIELD graphName
WHERE graphName = 'people-acted-in-movies'
RETURN count(*)=1 as outcome