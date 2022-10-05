MATCH (source:Airport {iata: "BNA"}),
      (target:Airport {iata:"HKT"})

CALL gds.shortestPath.yens.stream(
  'routes',
  {
    sourceNode:source,
    targetNode:target,
    relationshipWeightProperty:'distance',
    k:3
  }
) YIELD index, totalCost
WHERE index = 2 // index starts at 0
RETURN totalCost