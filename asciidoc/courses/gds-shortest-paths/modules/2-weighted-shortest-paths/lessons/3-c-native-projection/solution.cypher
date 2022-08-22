CALL gds.graph.project(
  // Name of the projection
  'user-rated-movie',
  // Labels of nodes to include in the projection
  ['User', 'Movie'],
  // Relationship types to include in the projection
  {
    RATED: {
        type: 'RATED',
        orientation: 'UNDIRECTED'
    }
  }
)
YIELD relationshipCount

