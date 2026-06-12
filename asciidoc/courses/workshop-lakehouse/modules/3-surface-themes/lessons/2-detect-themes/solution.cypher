CALL gds.graph.project(
  'doc-links',
  'Section',
  {LINKS_TO: {orientation: 'UNDIRECTED', properties: 'strength'}}
);

CALL gds.leiden.write('doc-links', {
  writeProperty: 'communityId',
  relationshipWeightProperty: 'strength',
  gamma: 0.5
})
YIELD communityCount, nodeCount
RETURN communityCount, nodeCount;
