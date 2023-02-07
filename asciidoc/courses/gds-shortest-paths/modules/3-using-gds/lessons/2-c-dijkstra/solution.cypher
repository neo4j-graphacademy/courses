// tag::project[]
CALL gds.graph.project(
  'routes',
  'Airport',
  'HAS_ROUTE',
  {relationshipProperties:'distance'}
);
// end::project[]

// tag::run[]
MATCH (source:Airport {iata: "BNA"}),
      (target:Airport {iata:"HKT"})

CALL gds.shortestPath.dijkstra.stream(
  'routes',
  {
    sourceNode:source,
    targetNode:target,
    relationshipWeightProperty:'distance'
  }
) YIELD totalCost
RETURN totalCost;
// end::run[]
