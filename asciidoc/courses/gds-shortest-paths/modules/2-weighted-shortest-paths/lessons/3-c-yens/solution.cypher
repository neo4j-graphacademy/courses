MATCH (source:Airport {iata: "BNA"}), (target:Airport {iata:"HKT"})
CALL gds.shortestPath.yens.stream('routes', 
  {sourceNode:source, targetNode:target, relationshipWeightProperty:'distance', k:3}) YIELD totalCost
RETURN totalCost