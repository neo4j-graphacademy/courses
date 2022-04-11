MATCH()-[r:ACTED_WITH]->() DELETE r;
CALL gds.graph.drop('proj', false);
CALL gds.beta.model.drop('lp-pipeline-model', false);
CALL gds.beta.pipeline.drop('pipe', false);