// Create (or reuse the existing) projection
CALL gds.graph.project('proj',
    ['Person','Movie'],
    {
        ACTED_IN:{orientation:'UNDIRECTED'},
        DIRECTED:{orientation:'UNDIRECTED'}
    }
);

// Find the shortest path
MATCH (kevin:Actor{name : 'Kevin Bacon'})
MATCH (??????)

CALL gds.shortestPath.dijkstra.stream(
    'proj', 
    {
        sourceNode:kevin, 
        TargetNode:??????
    }
)

YIELD sourceNode, targetNode, path
RETURN sourceNode, targetNode, nodes(path) as path;