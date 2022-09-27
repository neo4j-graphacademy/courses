MATCH (source:Airport {iata: 'BNA'}), (target:Airport {iata: 'HKT'})  
MATCH p=allShortestPaths((source)-[:HAS_ROUTE*]->(target))
RETURN count(p) AS result