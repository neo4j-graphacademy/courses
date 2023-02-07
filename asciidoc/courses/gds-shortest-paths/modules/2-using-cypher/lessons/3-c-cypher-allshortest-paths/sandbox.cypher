MATCH (source:Airport {iata: 'BNA'}), (target:Airport {iata: 'HKT'})  
MATCH p=shortestPath((source)-[:HAS_ROUTE*]->(target))
RETURN p