MATCH (source:Airport {iata: "BNA"}), (target:Airport {iata:"HKT"})
CALL gds.shortestPath.dijkstra.stream('routes', 
  {sourceNode:source, targetNode:target, relationshipWeightProperty:'distance'}) YIELD totalCost
RETURN totalCost