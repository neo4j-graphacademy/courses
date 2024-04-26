// Create graph projection
CALL gds.graph.project(
    'actor-directors',
    ['??????', '??????'],
    '??????'
);

// Run degree centrality algorithm
CALL gds.degree.stream('actor-directors')
YIELD nodeId, score
RETURN 
  gds.util.asNode(nodeId).name AS name, 
  score AS movies
ORDER BY ?????? DESC