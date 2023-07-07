// First create the graph projection,  and then call the
// gds.degree.stream() procedure run the algorithm on the projection
CALL gds.graph.project(
    'actor-directors',
    ['labels'],
    'RELATIONSHIP_TYPE'
)
