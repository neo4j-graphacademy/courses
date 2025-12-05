// Pre-populate the catalog with 4 projections from previous lessons
// This allows students to practice listing and managing multiple graphs

// 1. Actor network (monopartite - actors connected through movies)
MATCH (source:Actor)-[:ACTED_IN]->(:Movie)<-[:ACTED_IN]-(target:Actor)
WITH gds.graph.project(
  'actor-network',
  source,
  target,
  {},
  {}
) AS g
RETURN g.graphName AS graph, g.nodeCount AS nodes, g.relationshipCount AS rels;

// 2. Genre co-occurrence (monopartite - genres connected through movies)
MATCH (source:Genre)<-[:IN_GENRE]-(:Movie)-[:IN_GENRE]->(target:Genre)
WITH gds.graph.project(
  'genre-cooccurrence',
  source,
  target
) AS g
RETURN g.graphName AS graph, g.nodeCount AS nodes, g.relationshipCount AS rels;

// 3. User-movie network (bipartite - with labels preserved)
MATCH (source:User)-[r:RATED]->(target:Movie)
WITH gds.graph.project(
  'user-movie',
  source,
  target,
  {
    sourceNodeLabels: labels(source),
    targetNodeLabels: labels(target),
    relationshipType: type(r)
  },
  {}
) AS g
RETURN g.graphName AS graph, g.nodeCount AS nodes, g.relationshipCount AS rels;

// 4. Actor-movie network (bipartite - with labels preserved)
MATCH (source:Actor)-[r:ACTED_IN]->(target:Movie)
WITH gds.graph.project(
  'actor-movie',
  source,
  target,
  {
    sourceNodeLabels: labels(source),
    targetNodeLabels: labels(target),
    relationshipType: type(r)
  },
  {}
) AS g
RETURN g.graphName AS graph, g.nodeCount AS nodes, g.relationshipCount AS rels

