// Drop the graph projection
CALL gds.graph.drop('routes', false);

// Recreate it
CALL gds.graph.project(
  'routes',
  'Airport',
  'HAS_ROUTE',
  {relationshipProperties:'distance'}
);