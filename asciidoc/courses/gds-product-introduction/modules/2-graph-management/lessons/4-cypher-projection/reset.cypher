MATCH(m:RecentBigMovie) REMOVE m:RecentBigMovie;
CALL gds.graph.drop('native-proj', false);
CALL gds.graph.drop('cypher-proj', false);