CALL gds.graph.project(
  // Name of the projection
  'people-acted-in-movies',
  // Labels of nodes to include in the projection
  ['Person', 'Movie'],
  // Relationship types to include in the projection
  'ACTED_IN'
)
