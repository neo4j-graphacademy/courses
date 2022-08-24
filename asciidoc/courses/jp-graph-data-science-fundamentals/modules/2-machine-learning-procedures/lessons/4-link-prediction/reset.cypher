MATCH()-[r:ACTED_WITH]->() DELETE r;
MATCH(m:RecentBigMovie) REMOVE m:RecentBigMovie;
CALL gds.graph.drop('proj', false);
CALL gds.beta.model.drop('lp-pipeline-model', false);
CALL gds.beta.pipeline.drop('pipe', false);