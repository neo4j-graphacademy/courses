MATCH (source:Airport {iata: "BNA"}),
      (target:Airport {iata:"HKT"})

CALL gds.shortestPath.yens.stream(
  'routes',
  {
    sourceNode:source,
    targetNode:target,
    relationshipWeightProperty:'distance',
    k: 1 // Set the number of routes to return here
  }
) YIELD totalCost
RETURN totalCost