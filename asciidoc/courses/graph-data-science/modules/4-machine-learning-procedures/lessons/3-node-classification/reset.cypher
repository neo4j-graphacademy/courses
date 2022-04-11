MATCH(m:TrainMovie) REMOVE m:TrainMovie;
CALL gds.graph.drop('proj', false);
CALL gds.beta.model.drop('nc-pipeline-model', false);
CALL gds.beta.pipeline.drop('pipe', false);