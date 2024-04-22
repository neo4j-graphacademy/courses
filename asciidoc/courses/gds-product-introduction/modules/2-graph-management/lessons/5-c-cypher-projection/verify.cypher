CALL gds.graph.list() YIELD graphName
WHERE graphName = 'movie-ratings-after-2014'
RETURN count(*)=1 as outcome