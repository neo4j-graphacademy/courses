CALL gds.graph.list()
YIELD graphName
CALL gds.graph.drop(graphName)
YIELD graphName AS droppedGraph
RETURN droppedGraph

