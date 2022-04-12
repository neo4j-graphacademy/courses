CALL gds.graph.drop('proj', false);
MATCH(:Person)-[r:ACTED_WITH]->(:Person) DELETE r;