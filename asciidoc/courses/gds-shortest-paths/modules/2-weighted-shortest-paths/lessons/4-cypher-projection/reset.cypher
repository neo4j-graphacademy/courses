MATCH(m:RecentBigMovie) REMOVE m:RecentBigMovie;
CALL gds.graph.drop('proj-native', false);
CALL gds.graph.drop('proj-cypher', false);