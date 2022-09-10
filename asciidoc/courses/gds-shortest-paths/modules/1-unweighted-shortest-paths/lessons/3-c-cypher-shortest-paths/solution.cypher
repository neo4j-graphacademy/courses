MATCH (source:Airport {iata: 'LAX'}), (target:Airport {iata: 'HKT'})  
MATCH p=shortestPath((source)-[:HAS_ROUTE*]->(target))
RETURN length(p) AS result